import { Prisma } from "@prisma/client";

import { multiplyMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export const DEFAULT_USD_TO_BOB_EXCHANGE_RATE = 6.96;
export const BCB_USD_QUOTATION_URL =
  "https://www.bcb.gob.bo/librerias/indicadores/otras/otras_imprimir.php";
const PLATFORM_SETTINGS_ID = "default";

export type OfficialUsdToBobExchangeRate = {
  rate: number;
  publishedOn: string | null;
};

type Queryable =
  | Pick<typeof prisma, "$queryRaw" | "$executeRaw">
  | Prisma.TransactionClient;

type ExchangeRateRow = {
  usd_to_bob_exchange_rate: Prisma.Decimal | string | number;
  updated_by_id: string | null;
};

export function normalizeExchangeRate(value: unknown) {
  const rate = Number(value);

  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error("Tipo de cambio inválido");
  }

  return Number(rate.toFixed(4));
}

export function convertUsdToBob(amountUsd: number, exchangeRate: number) {
  return multiplyMoney(amountUsd, exchangeRate);
}

export function parseBcbOfficialUsdToBobExchangeRate(
  page: string,
): OfficialUsdToBobExchangeRate {
  const normalizedPage = page
    .replace(/&nbsp;/gi, " ")
    .replace(/&Oacute;/gi, "Ó")
    .replace(/&oacute;/gi, "ó")
    .replace(/&Aacute;/gi, "Á")
    .replace(/&aacute;/gi, "á")
    .replace(/&Eacute;/gi, "É")
    .replace(/&eacute;/gi, "é")
    .replace(/&Iacute;/gi, "Í")
    .replace(/&iacute;/gi, "í")
    .replace(/&Uacute;/gi, "Ú")
    .replace(/&uacute;/gi, "ú");
  const officialSection = normalizedPage.match(
    /Cotizaci(?:ó|&oacute;)n Oficial del Boliviano[\s\S]*?<\/table>/i,
  )?.[0];
  const cells = officialSection?.match(/<td[^>]*>[\s\S]*?<\/td>/gi) ?? [];
  const amountCell = cells.at(-1)?.replace(/<[^>]+>/g, "").trim();
  const rate = Number(amountCell?.replace(/,/g, ""));

  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error("El BCB no publicó un tipo de cambio USD válido");
  }

  const dateMatch = normalizedPage.match(
    /TABLA DE COTIZACIONES DEL\s+(\d{1,2}\s+DE\s+[A-ZÁÉÍÓÚÑ]+\s+DE\s+\d{4})/i,
  );

  return {
    rate: normalizeExchangeRate(rate),
    publishedOn: dateMatch?.[1] ?? null,
  };
}

export async function getOfficialUsdToBobExchangeRate() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(BCB_USD_QUOTATION_URL, {
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error("No se pudo cargar la cotización oficial del BCB");
    }

    return parseBcbOfficialUsdToBobExchangeRate(await response.text());
  } finally {
    clearTimeout(timeout);
  }
}

async function getStoredExchangeRateRow(db: Queryable = prisma) {
  const rows = await db.$queryRaw<ExchangeRateRow[]>`
    select
      "usd_to_bob_exchange_rate",
      "updated_by_id"::text as "updated_by_id"
    from "platform_settings"
    where "id" = ${PLATFORM_SETTINGS_ID}
    limit 1
  `;

  return rows[0] ?? null;
}

export async function getUsdToBobExchangeRate(db: Queryable = prisma) {
  const row = await getStoredExchangeRateRow(db);

  try {
    return (await getOfficialUsdToBobExchangeRate()).rate;
  } catch (error) {
    console.error("BCB exchange rate fallback:", error);
  }

  const rate =
    row?.usd_to_bob_exchange_rate ?? DEFAULT_USD_TO_BOB_EXCHANGE_RATE;
  return normalizeExchangeRate(rate);
}

export async function getUsdToBobExchangeRateSettings() {
  const row = await getStoredExchangeRateRow();
  const storedUsdToBobExchangeRate = row
    ? normalizeExchangeRate(row.usd_to_bob_exchange_rate)
    : null;
  const hasManualFallback = Boolean(row?.updated_by_id);

  let officialUsdToBobExchangeRate: OfficialUsdToBobExchangeRate | null = null;
  try {
    officialUsdToBobExchangeRate = await getOfficialUsdToBobExchangeRate();
  } catch (error) {
    console.error("Error fetching BCB exchange rate:", error);
  }

  const usdToBobExchangeRate =
    officialUsdToBobExchangeRate?.rate ??
    storedUsdToBobExchangeRate ??
    DEFAULT_USD_TO_BOB_EXCHANGE_RATE;

  return {
    usdToBobExchangeRate: normalizeExchangeRate(usdToBobExchangeRate),
    officialUsdToBobExchangeRate: officialUsdToBobExchangeRate?.rate ?? null,
    officialPublishedOn: officialUsdToBobExchangeRate?.publishedOn ?? null,
    storedUsdToBobExchangeRate,
    source: officialUsdToBobExchangeRate
      ? "bcb"
      : hasManualFallback
        ? "manual_fallback"
        : "default_fallback",
  };
}

export async function upsertUsdToBobExchangeRate({
  exchangeRate,
  updatedById,
}: {
  exchangeRate: number;
  updatedById: string;
}) {
  const normalizedRate = normalizeExchangeRate(exchangeRate);

  await prisma.$executeRaw`
    insert into "platform_settings" (
      "id",
      "usd_to_bob_exchange_rate",
      "updated_by_id",
      "updated_at"
    )
    values (
      ${PLATFORM_SETTINGS_ID},
      ${normalizedRate},
      ${updatedById}::uuid,
      now()
    )
    on conflict ("id")
    do update set
      "usd_to_bob_exchange_rate" = excluded."usd_to_bob_exchange_rate",
      "updated_by_id" = excluded."updated_by_id",
      "updated_at" = now()
  `;

  return normalizedRate;
}

export async function useAutomaticUsdToBobExchangeRate() {
  const officialRate = await getOfficialUsdToBobExchangeRate();

  await prisma.$executeRaw`
    insert into "platform_settings" (
      "id",
      "usd_to_bob_exchange_rate",
      "updated_by_id",
      "updated_at"
    )
    values (
      ${PLATFORM_SETTINGS_ID},
      ${officialRate.rate},
      null,
      now()
    )
    on conflict ("id")
    do update set
      "usd_to_bob_exchange_rate" = excluded."usd_to_bob_exchange_rate",
      "updated_by_id" = null,
      "updated_at" = now()
  `;

  return officialRate.rate;
}

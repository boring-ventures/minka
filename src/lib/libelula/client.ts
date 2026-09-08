import { z } from 'zod';

const money = z.union([z.number(), z.string().min(1)]).transform(Number).pipe(z.number().finite());
const boolean = z.union([z.boolean(), z.literal(0), z.literal(1), z.literal('0'), z.literal('1')])
  .transform(value => value === true || value === 1 || value === '1');
const envelope = z.object({ error: z.union([z.number(), z.boolean()]), datos: z.unknown().optional() }).passthrough();
export const debtSchema = z.object({
  email_cliente: z.string().email().optional(),
  identificador: z.string(), valor_total: money, moneda: z.string(), pagado: boolean,
  pago_anulado: boolean.optional(), deuda_expirada: boolean.optional(),
  fecha_vencimiento: z.string().nullish(), fecha_pago: z.string().nullish(),
  forma_pago: z.string().nullish(), forma_pago_codigo: z.string().nullish(),
  codigo_recaudacion: z.string().nullish(), url_pasarela_pagos: z.string().url(),
});
export type LibelulaDebt = z.infer<typeof debtSchema>;
export class LibelulaError extends Error {
  constructor(public code: string) { super(code); }
}

export function checkoutUrl(value: string) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || !['pagos.libelula.bo', 'libelula.bo', 'www.libelula.bo'].includes(url.hostname) || url.username || url.password) {
    throw new LibelulaError('PAYMENT_PROVIDER_INVALID_RESPONSE');
  }
  return url.href;
}

export function parseDebtResponse(payload: unknown, reference: string): LibelulaDebt | null {
  const result = envelope.parse(payload);
  if (result.error !== 0 && result.error !== false) throw new LibelulaError('PAYMENT_PROVIDER_ERROR');
  if (result.datos == null) return null;
  const rows = Array.isArray(result.datos) ? result.datos : [result.datos];
  if (rows.length === 0) return null;
  const debts = rows.map(row => debtSchema.parse(row));
  if (debts.length !== 1 || debts[0].identificador !== reference) throw new LibelulaError('PAYMENT_PROVIDER_INVALID_RESPONSE');
  checkoutUrl(debts[0].url_pasarela_pagos);
  return debts[0];
}

export class LibelulaClient {
  constructor(private request: typeof fetch = fetch) {}
  private async post(path: string, body: Record<string, unknown>) {
    const appkey = process.env.LIBELULA_APP_KEY;
    if (!appkey) throw new LibelulaError('PAYMENT_NOT_CONFIGURED');
    try {
      const response = await this.request(`${process.env.LIBELULA_BASE_URL || 'https://api.libelula.bo'}/rest/deuda/${path}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, appkey }), cache: 'no-store', signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new LibelulaError('PAYMENT_PROVIDER_UNAVAILABLE');
      const payload = envelope.parse(await response.json());
      if (payload.error !== 0 && payload.error !== false) throw new LibelulaError('PAYMENT_PROVIDER_ERROR');
      return payload;
    } catch (error) {
      if (error instanceof LibelulaError) throw error;
      throw new LibelulaError('PAYMENT_PROVIDER_UNAVAILABLE');
    }
  }
  async register(body: Record<string, unknown>) {
    const result = z.object({ id_transaccion: z.string().uuid(), url_pasarela_pagos: z.string().url() }).parse(await this.post('registrar', body));
    return { paymentId: result.id_transaccion, url: checkoutUrl(result.url_pasarela_pagos) };
  }
  async lookup(reference: string) {
    return parseDebtResponse(await this.post('consultar_deudas/por_identificador', { identificador: reference }), reference);
  }
  async payments(from: string, to: string) {
    const result = await this.post('consultar_pagos', { fecha_inicial: from, fecha_final: to });
    return z.array(z.object({ identificador: z.string(), id_transaccion: z.string().uuid() })).parse(result.datos ?? []);
  }
}
export const libelulaClient = new LibelulaClient();

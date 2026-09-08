import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { refreshLibelulaDonation } from '@/lib/libelula/reconciliation';

async function handle(request: Request) {
  const url = new URL(request.url);
  let data: Record<string, unknown> = {};
  if (request.method === 'POST') {
    if (request.headers.get('content-type')?.includes('application/json')) data = await request.json().catch(() => ({}));
    else data = Object.fromEntries(new URLSearchParams(await request.text()));
  }
  const transactionId = url.searchParams.get('transaction_id') || data?.transaction_id || data?.id_transaccion;
  const parsed = z.string().uuid().safeParse(transactionId);
  if (!parsed.success) return NextResponse.json({ error: 'INVALID_TRANSACTION_ID' }, { status: 400 });
  const id = url.searchParams.get('donationId');
  if (id && !z.string().uuid().safeParse(id).success) return NextResponse.json({ error: 'INVALID_DONATION_ID' }, { status: 400 });
  const donation = await prisma.donation.findFirst({ where: { paymentProvider: 'libelula', ...(id ? { id } : { providerPaymentId: parsed.data }) }, select: { id: true } });
  if (!donation) return NextResponse.json({ error: 'PAYMENT_NOT_FOUND' }, { status: 404 });
  try {
    await refreshLibelulaDonation(donation.id, 'callback', parsed.data);
    return NextResponse.json({ received: true });
  } catch {
    console.error('[LIBELULA][CALLBACK_RETRY]', donation.id);
    return NextResponse.json({ error: 'PAYMENT_VERIFICATION_PENDING' }, { status: 503 });
  }
}
export const GET = handle;
export const POST = handle;

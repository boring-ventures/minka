import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { reconcileLibelulaPayments } from '@/lib/libelula/reconciliation';
export async function POST(request: Request) {
  const expected = process.env.LIBELULA_RECONCILE_SECRET;
  const actual = request.headers.get('authorization')?.replace(/^Bearer /, '');
  if (!expected || !actual || Buffer.byteLength(actual) !== Buffer.byteLength(expected) || !timingSafeEqual(Buffer.from(actual), Buffer.from(expected))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try { return NextResponse.json({ success: true, result: await reconcileLibelulaPayments() }); }
  catch { return NextResponse.json({ error: 'RECONCILIATION_FAILED' }, { status: 503 }); }
}

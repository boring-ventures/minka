import { reconcileLibelulaPayments } from '../../src/lib/libelula/reconciliation';
export default async function handler() {
  if (!process.env.LIBELULA_APP_KEY) return;
  const result = await reconcileLibelulaPayments();
  console.info(JSON.stringify({ event: 'libelula_reconcile_completed', ...result }));
}

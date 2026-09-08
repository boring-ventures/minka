import { Donation } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { completeDonationAccounting, sendCompletedDonationNotification } from '@/lib/donations/accounting';
import { createCompletedPaymentLogIfMissing } from '@/lib/payments/payment-log';
import { LibelulaDebt } from './client';
import { validateDebt } from './validation';

export function parsePaymentDate(value: string | null | undefined) {
  if (!value) return null;
  // Provider date strings are Bolivia local time unless an offset is supplied.
  const iso = value.replace(' ', 'T');
  const date = new Date(/(?:Z|[+-]\d\d:\d\d)$/.test(iso) ? iso : `${iso.length === 10 ? `${iso}T00:00:00` : iso}-04:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function completeLibelulaPayment(donation: Donation, debt: LibelulaDebt, source: string) {
  if (!validateDebt(donation, debt)) throw new Error('PAYMENT_DETAILS_MISMATCH');
  if (!debt.pagado || debt.pago_anulado) return false;
  if (donation.paymentStatus === 'completed') return false;
  if (donation.paymentStatus !== 'pending') throw new Error('LATE_PAYMENT_REQUIRES_REVIEW');
  let notification;
  let completed = false;
  await prisma.$transaction(async tx => {
    const result = await completeDonationAccounting(tx, {
      donationId: donation.id,
      donationUpdate: { providerPaymentDate: parsePaymentDate(debt.fecha_pago), providerNextCheckAt: null },
    });
    if (!result.completedNow) return;
    completed = true;
    notification = result.notification;
    if (notification && debt.email_cliente) notification.donorEmail = debt.email_cliente;
    // Stable merchant reference also works when registration timed out before its transaction ID was saved.
    await createCompletedPaymentLogIfMissing(tx, {
      paymentprovider: 'libelula', paymentmethod: 'credit_card', paymentid: donation.id,
      amount: debt.valor_total, tipamount: Number(donation.providerTipAmount ?? 0), currency: debt.moneda,
      campaignid: donation.campaignId, donorid: donation.donorId,
      metadata: JSON.stringify({ donationId: donation.id, providerPaymentId: donation.providerPaymentId, source, channel: debt.forma_pago_codigo }),
    });
  });
  await sendCompletedDonationNotification(notification);
  return completed;
}

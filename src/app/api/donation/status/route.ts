import { NextResponse } from 'next/server'
import { prisma as db } from '@/lib/prisma'
import { z } from 'zod'
import { refreshLibelulaDonation } from '@/lib/libelula/reconciliation'
import { formatDonationStatusDto } from '@/lib/api/donation-dto'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const donationId = url.searchParams.get('donationId')

    if (!z.string().uuid().safeParse(donationId).success) {
      return NextResponse.json(
        { success: false, error: 'Missing donationId' },
        { status: 400 },
      )
    }

    try { await refreshLibelulaDonation(donationId!, 'status') }
    catch { console.error('[LIBELULA][STATUS_RETRY]', donationId) }

    const donation = await db.donation.findUnique({
      where: { id: donationId! },
      select: {
        id: true,
        paymentStatus: true,
        paymentProvider: true,
        paymentMethod: true,
        amount: true,
        tip_amount: true,
        total_amount: true,
        currency: true,
        updatedAt: true,
        providerPaymentId: true,
        providerAmount: true,
        providerTipAmount: true,
        providerTotalAmount: true,
        providerCurrency: true,
      },
    })

    if (!donation) {
      return NextResponse.json(
        { success: false, error: 'Donation not found' },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      donation: formatDonationStatusDto(donation),
    })
  } catch (err) {
    console.error('[DONATION_STATUS][ERROR]', err)
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 },
    )
  }
}

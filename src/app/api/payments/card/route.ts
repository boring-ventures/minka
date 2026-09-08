import { createCardCheckout } from '@/lib/libelula/checkout';
export async function POST(request: Request) {
  return createCardCheckout(await request.json().catch(() => null));
}

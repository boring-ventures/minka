# Libélula card payments

Set these environment variables in every runtime that serves card checkout:

```dotenv
LIBELULA_BASE_URL=https://api.libelula.bo
LIBELULA_APP_KEY=...
LIBELULA_CHECKOUT_SECRET=... # 64 random characters
LIBELULA_RECONCILE_SECRET=... # a different 64 random characters
LIBELULA_MERCHANT_BASE_URL=https://minka-comunidad.org
NEXT_PUBLIC_CARD_PAYMENTS_ENABLED=true
```

`LIBELULA_APP_KEY` is issued by Libélula. `LIBELULA_CHECKOUT_SECRET` and `LIBELULA_RECONCILE_SECRET` are separate 64-character random values generated and kept by Minka; Libélula does not issue or need them.

For local development, `LIBELULA_MERCHANT_BASE_URL=http://localhost:3000` is sufficient for the browser return and status verification. Libélula cannot call a localhost callback, so deploy to `https://minka-comunidad.org` before exercising callback delivery.

Libélula calls `GET` or `POST /api/libelula/callback` after payment. The callback does not complete a donation itself: Minka fetches the debt by its server-generated UUID and checks its paid state, amount, and currency first.

`libelula-reconcile` runs every 15 minutes in Netlify. It checks pending payments and a rolling paid-payment range so completed payments are recovered when a callback or browser return is missed.

-- Converge fresh installations and the abandoned card-provider experiment.
-- The old experiment is intentionally retired, including its migration ledger entry.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM donations WHERE payment_provider = 'transoft' AND payment_status = 'completed') THEN
    RAISE EXCEPTION 'Unexpected completed retired-provider payments: review before cleanup';
  END IF;
END $$;
DROP TABLE IF EXISTS transoft_notification_tokens;
DELETE FROM payment_logs WHERE paymentprovider::text = 'transoft';
DELETE FROM donations WHERE payment_provider = 'transoft';
DELETE FROM "_prisma_migrations" WHERE migration_name = '20260825120000_replace_tripto_with_transoft';

ALTER TABLE donations
  ADD COLUMN IF NOT EXISTS provider_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS provider_checkout_url TEXT,
  ADD COLUMN IF NOT EXISTS provider_session_id TEXT,
  ADD COLUMN IF NOT EXISTS provider_reference TEXT,
  ADD COLUMN IF NOT EXISTS provider_session_expires_at TIMESTAMP(6),
  ADD COLUMN IF NOT EXISTS provider_payment_date TIMESTAMPTZ(6),
  ADD COLUMN checkout_key TEXT,
  ADD COLUMN checkout_fingerprint TEXT,
  ADD COLUMN provider_next_check_at TIMESTAMPTZ(6),
  ADD COLUMN provider_registration_started_at TIMESTAMPTZ(6);

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='donations' AND column_name='tripto_payment_id') THEN
    UPDATE donations SET
      provider_payment_id = COALESCE(provider_payment_id, tripto_payment_id),
      provider_checkout_url = COALESCE(provider_checkout_url, tripto_checkout_url),
      provider_session_id = COALESCE(provider_session_id, tripto_session_id)
    WHERE payment_provider = 'tripto';
  END IF;
END $$;
ALTER TABLE donations DROP COLUMN IF EXISTS tripto_payment_id,
  DROP COLUMN IF EXISTS tripto_checkout_url, DROP COLUMN IF EXISTS tripto_session_id;

-- Rebuild this small enum to remove the retired provider; keep historical Tripto logs.
ALTER TYPE "PaymentProvider" RENAME TO "PaymentProvider_retired";
CREATE TYPE "PaymentProvider" AS ENUM ('libelula', 'tripto', 'bisa');
ALTER TABLE payment_logs ALTER COLUMN paymentprovider TYPE "PaymentProvider"
  USING paymentprovider::text::"PaymentProvider";
DROP TYPE "PaymentProvider_retired";

CREATE UNIQUE INDEX donations_checkout_key_key ON donations(checkout_key);
CREATE UNIQUE INDEX donations_payment_provider_provider_payment_id_key ON donations(payment_provider, provider_payment_id);
CREATE UNIQUE INDEX donations_payment_provider_provider_reference_key ON donations(payment_provider, provider_reference);
CREATE INDEX donations_payment_provider_payment_status_provider_next_che_idx ON donations(payment_provider, payment_status, provider_next_check_at);

CREATE TABLE IF NOT EXISTS "platform_settings" (
  "id" TEXT NOT NULL DEFAULT 'default',
  "usd_to_bob_exchange_rate" DECIMAL(10,4) NOT NULL DEFAULT 6.9600,
  "updated_by_id" UUID,
  "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "platform_settings_updated_by_id_fkey"
    FOREIGN KEY ("updated_by_id")
    REFERENCES "profiles"("id")
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT "platform_settings_usd_to_bob_exchange_rate_positive"
    CHECK ("usd_to_bob_exchange_rate" > 0)
);

INSERT INTO "platform_settings" ("id", "usd_to_bob_exchange_rate")
VALUES ('default', 6.9600)
ON CONFLICT ("id") DO NOTHING;

ALTER TABLE "platform_settings" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_read_platform_settings" ON "platform_settings";
CREATE POLICY "admin_read_platform_settings"
ON "platform_settings"
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM "profiles"
    WHERE "profiles"."id" = auth.uid()
      AND "profiles"."role" = 'admin'::"UserRole"
      AND "profiles"."status" = 'active'::"Status"
  )
);

DROP POLICY IF EXISTS "admin_update_platform_settings" ON "platform_settings";
CREATE POLICY "admin_update_platform_settings"
ON "platform_settings"
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM "profiles"
    WHERE "profiles"."id" = auth.uid()
      AND "profiles"."role" = 'admin'::"UserRole"
      AND "profiles"."status" = 'active'::"Status"
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM "profiles"
    WHERE "profiles"."id" = auth.uid()
      AND "profiles"."role" = 'admin'::"UserRole"
      AND "profiles"."status" = 'active'::"Status"
  )
);

CREATE TABLE payment_reconciliation_cursors (
  provider TEXT PRIMARY KEY,
  through TIMESTAMPTZ(6) NOT NULL
);
ALTER TABLE payment_reconciliation_cursors ENABLE ROW LEVEL SECURITY;

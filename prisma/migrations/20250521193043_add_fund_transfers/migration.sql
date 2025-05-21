-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('processing', 'completed', 'rejected', 'cancelled');

-- CreateEnum
CREATE TYPE "TransferFrequency" AS ENUM ('monthly_once', 'monthly_twice', 'every_90_days');

-- CreateTable
CREATE TABLE "fund_transfers" (
    "id" UUID NOT NULL,
    "campaign_id" UUID NOT NULL,
    "account_holder_name" TEXT NOT NULL,
    "bank_name" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "status" "TransferStatus" NOT NULL DEFAULT 'processing',
    "frequency" "TransferFrequency" NOT NULL DEFAULT 'monthly_once',
    "transfer_date" TIMESTAMP(6),
    "notes" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "fund_transfers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "fund_transfers" ADD CONSTRAINT "fund_transfers_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

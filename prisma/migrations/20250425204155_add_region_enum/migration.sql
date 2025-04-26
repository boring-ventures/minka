/*
  Warnings:

  - Added the required column `story` to the `campaigns` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `location` on the `campaigns` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "Region" AS ENUM ('la_paz', 'santa_cruz', 'cochabamba', 'sucre', 'oruro', 'potosi', 'tarija', 'beni', 'pando');

-- AlterEnum
ALTER TYPE "CampaignCategory" ADD VALUE 'otros';

-- AlterTable
ALTER TABLE "campaign_updates" ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "youtube_url" TEXT;

-- AlterTable
ALTER TABLE "campaigns" ADD COLUMN     "story" VARCHAR(600) NOT NULL,
DROP COLUMN "location",
ADD COLUMN     "location" "Region" NOT NULL,
ALTER COLUMN "verification_date" DROP NOT NULL;

-- AlterTable
ALTER TABLE "donations" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'BOB';

-- CreateTable
CREATE TABLE "campaign_verifications" (
    "id" UUID NOT NULL,
    "campaign_id" UUID NOT NULL,
    "request_date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approval_date" TIMESTAMP(6),
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "id_document_url" TEXT,
    "supporting_docs_urls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "campaign_story" TEXT,
    "reference_contact_name" TEXT,
    "reference_contact_email" TEXT,
    "reference_contact_phone" TEXT,
    "status" "Status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "campaign_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "campaign_verifications_campaign_id_key" ON "campaign_verifications"("campaign_id");

-- AddForeignKey
ALTER TABLE "campaign_verifications" ADD CONSTRAINT "campaign_verifications_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

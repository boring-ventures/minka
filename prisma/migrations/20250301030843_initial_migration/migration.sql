/*
  Warnings:

  - The values [USER,SUPERADMIN] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - The primary key for the `profiles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `active` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `avatarUrl` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `first_name` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `profiles` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `profiles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[identity_number]` on the table `profiles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `address` to the `profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bio` to the `profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `birth_date` to the `profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `identity_number` to the `profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `join_date` to the `profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password_hash` to the `profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profile_picture` to the `profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `profiles` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `profiles` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "CampaignCategory" AS ENUM ('cultura_arte', 'educacion', 'emergencia', 'igualdad', 'medioambiente', 'salud');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('draft', 'active', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('image', 'video');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('credit_card', 'qr', 'bank_transfer');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('active', 'inactive');

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('user', 'organizer', 'admin');
ALTER TABLE "profiles" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "profiles" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
ALTER TABLE "profiles" ALTER COLUMN "role" SET DEFAULT 'user';
COMMIT;

-- DropIndex
DROP INDEX "profiles_userId_idx";

-- DropIndex
DROP INDEX "profiles_userId_key";

-- AlterTable
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_pkey",
DROP COLUMN "active",
DROP COLUMN "avatarUrl",
DROP COLUMN "createdAt",
DROP COLUMN "first_name",
DROP COLUMN "last_name",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "active_campaigns_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "bio" TEXT NOT NULL,
ADD COLUMN     "birth_date" DATE NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "identity_number" TEXT NOT NULL,
ADD COLUMN     "join_date" DATE NOT NULL,
ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "password_hash" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "profile_picture" TEXT NOT NULL,
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'active',
ADD COLUMN     "updated_at" TIMESTAMP NOT NULL,
ADD COLUMN     "verification_status" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ALTER COLUMN "role" SET DEFAULT 'user',
ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "campaigns" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "beneficiaries_description" TEXT NOT NULL,
    "category" "CampaignCategory" NOT NULL,
    "goal_amount" DECIMAL NOT NULL,
    "collected_amount" DECIMAL NOT NULL DEFAULT 0,
    "donor_count" INTEGER NOT NULL DEFAULT 0,
    "percentage_funded" DOUBLE PRECISION NOT NULL,
    "days_remaining" INTEGER NOT NULL,
    "youtube_url" TEXT,
    "location" TEXT NOT NULL,
    "end_date" DATE NOT NULL,
    "verification_status" BOOLEAN NOT NULL DEFAULT false,
    "verification_date" TIMESTAMP NOT NULL,
    "campaign_status" "CampaignStatus" NOT NULL DEFAULT 'draft',
    "status" "Status" NOT NULL DEFAULT 'active',
    "organizer_id" UUID NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_media" (
    "id" UUID NOT NULL,
    "campaign_id" UUID NOT NULL,
    "media_url" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "order_index" INTEGER NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "campaign_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_updates" (
    "id" UUID NOT NULL,
    "campaign_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "campaign_updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donations" (
    "id" UUID NOT NULL,
    "campaign_id" UUID NOT NULL,
    "donor_id" UUID NOT NULL,
    "amount" DECIMAL NOT NULL,
    "predefined_amount" BOOLEAN NOT NULL DEFAULT true,
    "payment_method" "PaymentMethod" NOT NULL,
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "message" TEXT,
    "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
    "notification_enabled" BOOLEAN NOT NULL DEFAULT false,
    "status" "Status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "donations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" UUID NOT NULL,
    "campaign_id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_campaigns" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "campaign_id" UUID NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "saved_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_email_key" ON "profiles"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_identity_number_key" ON "profiles"("identity_number");

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_media" ADD CONSTRAINT "campaign_media_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_updates" ADD CONSTRAINT "campaign_updates_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_donor_id_fkey" FOREIGN KEY ("donor_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_campaigns" ADD CONSTRAINT "saved_campaigns_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_campaigns" ADD CONSTRAINT "saved_campaigns_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

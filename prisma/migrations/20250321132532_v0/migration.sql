-- AlterTable
ALTER TABLE "profiles" ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "bio" DROP NOT NULL,
ALTER COLUMN "join_date" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "location" DROP NOT NULL,
ALTER COLUMN "profile_picture" DROP NOT NULL;

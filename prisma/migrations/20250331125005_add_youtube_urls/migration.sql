-- AlterTable
ALTER TABLE "campaigns" ADD COLUMN     "youtube_urls" TEXT[] DEFAULT ARRAY[]::TEXT[];

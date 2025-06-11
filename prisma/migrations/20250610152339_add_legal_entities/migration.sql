-- AlterTable
ALTER TABLE "campaigns" ADD COLUMN     "legal_entity_id" UUID;

-- CreateTable
CREATE TABLE "legal_entities" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "tax_id" TEXT,
    "registration_number" TEXT,
    "legal_form" TEXT,
    "address" TEXT,
    "city" TEXT,
    "province" "Province",
    "department" "Region",
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "description" TEXT,
    "document_urls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "status" "Status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "legal_entities_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_legal_entity_id_fkey" FOREIGN KEY ("legal_entity_id") REFERENCES "legal_entities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "system_notification_logs" (
    "id" UUID NOT NULL,
    "admin_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "recipient_count" INTEGER NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "system_notification_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "system_notification_logs" ADD CONSTRAINT "system_notification_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

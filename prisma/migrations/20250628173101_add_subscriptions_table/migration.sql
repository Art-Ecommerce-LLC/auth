/*
  Warnings:

  - You are about to drop the `Permit` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Permit";

-- CreateTable
CREATE TABLE "permits" (
    "id" TEXT NOT NULL,
    "permit_number" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "issue_date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "raw_hash" TEXT NOT NULL,
    "urgency" TEXT NOT NULL,
    "project_value" TEXT NOT NULL,
    "recommended_roles" JSONB NOT NULL,
    "guide_json" JSONB NOT NULL,
    "hotness" INTEGER NOT NULL,
    "alert_sent" BOOLEAN NOT NULL DEFAULT false,
    "reasoning_summary" TEXT NOT NULL,
    "estimated_value_per_role" JSONB NOT NULL,
    "lead_price" DOUBLE PRECISION NOT NULL,
    "needs_more_permits" BOOLEAN NOT NULL DEFAULT false,
    "next_steps" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "match_type" TEXT NOT NULL,
    "match_value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "permits_permit_number_key" ON "permits"("permit_number");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_email_key" ON "subscriptions"("email");

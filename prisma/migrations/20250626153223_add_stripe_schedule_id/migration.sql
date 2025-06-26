-- CreateTable
CREATE TABLE "Permit" (
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

    CONSTRAINT "Permit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Permit_permit_number_key" ON "Permit"("permit_number");

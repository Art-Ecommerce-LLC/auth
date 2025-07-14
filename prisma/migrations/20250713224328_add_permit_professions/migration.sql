/*
  Warnings:

  - You are about to drop the column `alert_sent` on the `permits` table. All the data in the column will be lost.
  - You are about to drop the column `hotness` on the `permits` table. All the data in the column will be lost.
  - You are about to drop the column `needs_more_permits` on the `permits` table. All the data in the column will be lost.
  - You are about to drop the column `next_steps` on the `permits` table. All the data in the column will be lost.
  - You are about to drop the column `project_value` on the `permits` table. All the data in the column will be lost.
  - You are about to drop the column `recommended_roles` on the `permits` table. All the data in the column will be lost.
  - You are about to drop the column `urgency` on the `permits` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "permits" DROP COLUMN "alert_sent",
DROP COLUMN "hotness",
DROP COLUMN "needs_more_permits",
DROP COLUMN "next_steps",
DROP COLUMN "project_value",
DROP COLUMN "recommended_roles",
DROP COLUMN "urgency";

-- CreateTable
CREATE TABLE "permit_professions" (
    "id" TEXT NOT NULL,
    "permit_id" TEXT NOT NULL,
    "profession" TEXT NOT NULL,
    "project_value_estimate" INTEGER,
    "urgency_score" INTEGER NOT NULL,
    "lead_value" INTEGER NOT NULL,
    "reasoning" TEXT NOT NULL,
    "next_steps" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permit_professions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "permit_professions_permit_id_profession_key" ON "permit_professions"("permit_id", "profession");

-- AddForeignKey
ALTER TABLE "permit_professions" ADD CONSTRAINT "permit_professions_permit_id_fkey" FOREIGN KEY ("permit_id") REFERENCES "permits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `estimated_value_per_role` on the `permits` table. All the data in the column will be lost.
  - You are about to drop the column `guide_json` on the `permits` table. All the data in the column will be lost.
  - You are about to drop the column `lead_price` on the `permits` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "permits" DROP COLUMN "estimated_value_per_role",
DROP COLUMN "guide_json",
DROP COLUMN "lead_price";

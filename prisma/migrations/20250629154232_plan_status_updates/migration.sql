/*
  Warnings:

  - The values [canceling] on the enum `PlanStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PlanStatus_new" AS ENUM ('incomplete', 'incomplete_expired', 'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'paused');
ALTER TABLE "users" ALTER COLUMN "planStatus" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "planStatus" TYPE "PlanStatus_new" USING ("planStatus"::text::"PlanStatus_new");
ALTER TYPE "PlanStatus" RENAME TO "PlanStatus_old";
ALTER TYPE "PlanStatus_new" RENAME TO "PlanStatus";
DROP TYPE "PlanStatus_old";
ALTER TABLE "users" ALTER COLUMN "planStatus" SET DEFAULT 'active';
COMMIT;

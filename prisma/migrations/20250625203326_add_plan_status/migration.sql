/*
  Warnings:

  - The `role` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'BASE', 'PLUS');

-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('active', 'canceling', 'canceled', 'past_due');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "planStatus" "PlanStatus" NOT NULL DEFAULT 'active',
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';

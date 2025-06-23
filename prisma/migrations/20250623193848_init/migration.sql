/*
  Warnings:

  - You are about to drop the `Booking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Event` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TimeSlot` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `render_deploys` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[service_token]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `service_token` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_time_slot_id_fkey";

-- DropForeignKey
ALTER TABLE "TimeSlot" DROP CONSTRAINT "TimeSlot_event_id_fkey";

-- DropForeignKey
ALTER TABLE "render_deploys" DROP CONSTRAINT "render_deploys_user_id_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "google_token" TEXT,
ADD COLUMN     "service_token" TEXT NOT NULL;

-- DropTable
DROP TABLE "Booking";

-- DropTable
DROP TABLE "Event";

-- DropTable
DROP TABLE "TimeSlot";

-- DropTable
DROP TABLE "render_deploys";

-- CreateIndex
CREATE UNIQUE INDEX "users_service_token_key" ON "users"("service_token");

/*
  Warnings:

  - You are about to drop the column `appId` on the `events` table. All the data in the column will be lost.
  - Added the required column `app_id` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `key` to the `events` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_appId_fkey";

-- AlterTable
ALTER TABLE "apps" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "events" DROP COLUMN "appId",
ADD COLUMN     "app_id" INTEGER NOT NULL,
ADD COLUMN     "key" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - The migration will add a unique constraint covering the columns `[key]` on the table `apps`. If there are existing duplicate values, the migration will fail.
  - Added the required column `key` to the `apps` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "apps" ADD COLUMN     "key" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "apps.key_unique" ON "apps"("key");

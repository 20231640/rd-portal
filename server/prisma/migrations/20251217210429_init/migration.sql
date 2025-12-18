/*
  Warnings:

  - You are about to drop the column `region` on the `School` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[supabaseUserId]` on the table `Teacher` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Teacher` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "School" DROP COLUMN "region",
ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "municipality" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "certificateUrl" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasCompletedTraining" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "supabaseUserId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "verificationExpires" TIMESTAMP(3),
ADD COLUMN     "verificationToken" TEXT;

-- AlterTable
ALTER TABLE "TrainingSession" ADD COLUMN     "cycle" TEXT,
ADD COLUMN     "groupId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_supabaseUserId_key" ON "Teacher"("supabaseUserId");

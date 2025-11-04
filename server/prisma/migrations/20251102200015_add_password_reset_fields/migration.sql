-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN "resetPasswordExpires" DATETIME;
ALTER TABLE "Teacher" ADD COLUMN "resetPasswordToken" TEXT;

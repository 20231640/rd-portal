/*
  Warnings:

  - You are about to drop the `Kit` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Kit";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "KitRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "teacherId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    "kitType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" DATETIME,
    "shippedAt" DATETIME,
    "deliveredAt" DATETIME,
    "adminNotes" TEXT,
    CONSTRAINT "KitRequest_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "KitRequest_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

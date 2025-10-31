/*
  Warnings:

  - You are about to drop the `_TeacherTrainings` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `teacherId` to the `TrainingSession` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "_TeacherTrainings_B_index";

-- DropIndex
DROP INDEX "_TeacherTrainings_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_TeacherTrainings";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TrainingSession" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" DATETIME NOT NULL,
    "zoomLink" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "teacherId" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "certificateUrl" TEXT,
    CONSTRAINT "TrainingSession_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TrainingSession" ("createdAt", "date", "description", "id", "title", "zoomLink") SELECT "createdAt", "date", "description", "id", "title", "zoomLink" FROM "TrainingSession";
DROP TABLE "TrainingSession";
ALTER TABLE "new_TrainingSession" RENAME TO "TrainingSession";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

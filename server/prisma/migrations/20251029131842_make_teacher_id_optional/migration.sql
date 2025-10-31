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
    "teacherId" INTEGER,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "certificateUrl" TEXT,
    CONSTRAINT "TrainingSession_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TrainingSession" ("certificateUrl", "completed", "createdAt", "date", "description", "id", "teacherId", "title", "zoomLink") SELECT "certificateUrl", "completed", "createdAt", "date", "description", "id", "teacherId", "title", "zoomLink" FROM "TrainingSession";
DROP TABLE "TrainingSession";
ALTER TABLE "new_TrainingSession" RENAME TO "TrainingSession";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

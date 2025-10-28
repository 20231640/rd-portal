/*
  Warnings:

  - You are about to drop the column `address` on the `School` table. All the data in the column will be lost.
  - You are about to drop the column `lat` on the `School` table. All the data in the column will be lost.
  - You are about to drop the column `lng` on the `School` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_School" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "region" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_School" ("approved", "code", "createdAt", "id", "name", "region") SELECT "approved", "code", "createdAt", "id", "name", "region" FROM "School";
DROP TABLE "School";
ALTER TABLE "new_School" RENAME TO "School";
CREATE UNIQUE INDEX "School_name_key" ON "School"("name");
CREATE UNIQUE INDEX "School_code_key" ON "School"("code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateTable
CREATE TABLE "KitReport" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "requestId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "teacherName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" DATETIME,
    CONSTRAINT "KitReport_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "KitRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

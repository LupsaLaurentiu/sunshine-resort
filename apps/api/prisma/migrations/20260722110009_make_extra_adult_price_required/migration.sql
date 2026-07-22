/*
  Warnings:

  - Made the column `extraAdultPrice` on table `RoomType` required. This step will fail if there are existing NULL values in that column.

*/

-- Înlocuiește toate valorile NULL existente
UPDATE "RoomType"
SET "extraAdultPrice" = 0
WHERE "extraAdultPrice" IS NULL;

-- AlterTable
ALTER TABLE "RoomType"
ALTER COLUMN "extraAdultPrice" SET NOT NULL,
ALTER COLUMN "extraAdultPrice" SET DEFAULT 0;
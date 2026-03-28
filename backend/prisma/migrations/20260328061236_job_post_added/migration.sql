/*
  Warnings:

  - You are about to drop the column `department` on the `JobPost` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "JobPost" DROP COLUMN "department";

-- Add updatedAt to EmployerProfile with default for existing rows
ALTER TABLE "EmployerProfile" ADD COLUMN "updatedAt" TIMESTAMP(3);
UPDATE "EmployerProfile" SET "updatedAt" = NOW() WHERE "updatedAt" IS NULL;
ALTER TABLE "EmployerProfile" ALTER COLUMN "updatedAt" SET NOT NULL;

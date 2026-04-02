/*
  Warnings:

  - You are about to drop the column `additionalInformation` on the `JobPost` table. All the data in the column will be lost.
  - You are about to drop the column `skills` on the `JobPost` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "JobPost" DROP COLUMN "additionalInformation",
DROP COLUMN "skills";

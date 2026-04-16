/*
  Warnings:

  - You are about to drop the column `cvText` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `cvText` on the `CandidateProfile` table. All the data in the column will be lost.
  - You are about to drop the column `skills` on the `JobPost` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Application" DROP COLUMN "cvText";

-- AlterTable
ALTER TABLE "CandidateProfile" DROP COLUMN "cvText",
ADD COLUMN     "lastRecommendedAt" TIMESTAMP(3),
ADD COLUMN     "recommendationCache" JSONB;

-- AlterTable
ALTER TABLE "JobPost" DROP COLUMN "skills";

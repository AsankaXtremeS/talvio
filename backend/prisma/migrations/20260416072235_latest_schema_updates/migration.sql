/*
  Warnings:

  - You are about to drop the column `cvText` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `cvText` on the `CandidateProfile` table. All the data in the column will be lost.
  - You are about to drop the column `skills` on the `JobPost` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Application" DROP COLUMN IF EXISTS "cvText";

-- AlterTable
ALTER TABLE "CandidateProfile"
DROP COLUMN IF EXISTS "cvText",
ADD COLUMN IF NOT EXISTS "lastRecommendedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "recommendationCache" JSONB;

-- AlterTable
ALTER TABLE "JobPost" DROP COLUMN IF EXISTS "skills";

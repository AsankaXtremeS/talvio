/*
  Warnings:

  - Made the column `summaryScore` on table `CvSuggestion` required. This step will fail if there are existing NULL values in that column.
  - Made the column `skillsScore` on table `CvSuggestion` required. This step will fail if there are existing NULL values in that column.
  - Made the column `experienceScore` on table `CvSuggestion` required. This step will fail if there are existing NULL values in that column.
  - Made the column `educationScore` on table `CvSuggestion` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Application" ALTER COLUMN "matchedSkills" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "missingSkills" SET DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "CandidateProfile" ALTER COLUMN "skills" SET DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "CvSuggestion" ALTER COLUMN "summaryScore" SET NOT NULL,
ALTER COLUMN "summaryFeedback" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "skillsScore" SET NOT NULL,
ALTER COLUMN "skillsFeedback" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "experienceScore" SET NOT NULL,
ALTER COLUMN "experienceFeedback" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "educationScore" SET NOT NULL,
ALTER COLUMN "educationFeedback" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "missingKeywords" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "strengthsToHighlight" SET DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE INDEX "Application_aiScore_idx" ON "Application"("aiScore");

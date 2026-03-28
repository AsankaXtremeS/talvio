/*
  Warnings:

  - The `requirements` column on the `JobPost` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT');

-- CreateEnum
CREATE TYPE "WorkMode" AS ENUM ('REMOTE', 'HYBRID', 'ON_SITE');

-- CreateEnum
CREATE TYPE "StipendType" AS ENUM ('PAID', 'UNPAID', 'NEGOTIABLE');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('ENTRY', 'MID', 'SENIOR');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'REVIEWED', 'SHORTLISTED', 'REJECTED', 'HIRED');

-- AlterTable
ALTER TABLE "EmployerProfile" ADD COLUMN     "companyDescription" TEXT,
ADD COLUMN     "companyLocation" TEXT,
ADD COLUMN     "companyLogoUrl" TEXT,
ADD COLUMN     "companyWebsite" TEXT;

-- AlterTable
ALTER TABLE "JobPost" ADD COLUMN     "duration" TEXT,
ADD COLUMN     "employmentType" "EmploymentType",
ADD COLUMN     "experienceLevel" "ExperienceLevel",
ADD COLUMN     "location" TEXT,
ADD COLUMN     "responsibilities" TEXT[],
ADD COLUMN     "skillsRequired" TEXT[],
ADD COLUMN     "stipendType" "StipendType",
ADD COLUMN     "workMode" "WorkMode",
DROP COLUMN "requirements",
ADD COLUMN     "requirements" TEXT[];

-- CreateTable
CREATE TABLE "CandidateProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "headline" TEXT,
    "location" TEXT,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "bio" TEXT,
    "linkedinUrl" TEXT,
    "githubUrl" TEXT,
    "portfolioUrl" TEXT,
    "cvPath" TEXT,
    "cvFileName" TEXT,
    "cvText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "candidateProfileId" TEXT NOT NULL,
    "jobPostId" TEXT NOT NULL,
    "cvPath" TEXT NOT NULL,
    "cvFileName" TEXT,
    "cvText" TEXT,
    "coverLetter" TEXT,
    "aiScore" INTEGER,
    "skillsMatchScore" INTEGER,
    "experienceMatchScore" INTEGER,
    "educationMatchScore" INTEGER,
    "keywordsMatchScore" INTEGER,
    "matchedSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "missingSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "aiSummary" TEXT,
    "applicationStatus" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "scoredAt" TIMESTAMP(3),
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CvSuggestion" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "summaryScore" INTEGER NOT NULL,
    "summaryFeedback" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "skillsScore" INTEGER NOT NULL,
    "skillsFeedback" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "experienceScore" INTEGER NOT NULL,
    "experienceFeedback" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "educationScore" INTEGER NOT NULL,
    "educationFeedback" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "missingKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "strengthsToHighlight" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CvSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedCoverLetter" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneratedCoverLetter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CandidateProfile_userId_key" ON "CandidateProfile"("userId");

-- CreateIndex
CREATE INDEX "Application_jobPostId_aiScore_idx" ON "Application"("jobPostId", "aiScore");

-- CreateIndex
CREATE INDEX "Application_aiScore_idx" ON "Application"("aiScore");

-- CreateIndex
CREATE INDEX "Application_candidateProfileId_appliedAt_idx" ON "Application"("candidateProfileId", "appliedAt");

-- CreateIndex
CREATE INDEX "Application_applicationStatus_idx" ON "Application"("applicationStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Application_candidateProfileId_jobPostId_key" ON "Application"("candidateProfileId", "jobPostId");

-- CreateIndex
CREATE UNIQUE INDEX "CvSuggestion_applicationId_key" ON "CvSuggestion"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "GeneratedCoverLetter_applicationId_key" ON "GeneratedCoverLetter"("applicationId");

-- CreateIndex
CREATE INDEX "JobPost_status_createdAt_idx" ON "JobPost"("status", "createdAt");

-- CreateIndex
CREATE INDEX "JobPost_workMode_type_idx" ON "JobPost"("workMode", "type");

-- AddForeignKey
ALTER TABLE "CandidateProfile" ADD CONSTRAINT "CandidateProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_candidateProfileId_fkey" FOREIGN KEY ("candidateProfileId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobPostId_fkey" FOREIGN KEY ("jobPostId") REFERENCES "JobPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CvSuggestion" ADD CONSTRAINT "CvSuggestion_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedCoverLetter" ADD CONSTRAINT "GeneratedCoverLetter_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

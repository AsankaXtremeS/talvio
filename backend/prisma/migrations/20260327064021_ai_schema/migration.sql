/*
  Warnings:

  - Added the required column `updatedAt` to the `EmployerProfile` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('JOB', 'INTERNSHIP');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'ACTIVE', 'CLOSED');

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
ADD COLUMN     "companyWebsite" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "JobPost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "JobType" NOT NULL,
    "description" TEXT,
    "requirements" TEXT[],
    "responsibilities" TEXT[],
    "skillsRequired" TEXT[],
    "workMode" "WorkMode",
    "employmentType" "EmploymentType",
    "stipendType" "StipendType",
    "location" TEXT,
    "duration" TEXT,
    "experienceLevel" "ExperienceLevel",
    "closingDate" TIMESTAMP(3),
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "employerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "headline" TEXT,
    "location" TEXT,
    "skills" TEXT[],
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
    "matchedSkills" TEXT[],
    "missingSkills" TEXT[],
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
    "summaryScore" INTEGER,
    "summaryFeedback" TEXT[],
    "skillsScore" INTEGER,
    "skillsFeedback" TEXT[],
    "experienceScore" INTEGER,
    "experienceFeedback" TEXT[],
    "educationScore" INTEGER,
    "educationFeedback" TEXT[],
    "missingKeywords" TEXT[],
    "strengthsToHighlight" TEXT[],
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
CREATE INDEX "JobPost_employerId_idx" ON "JobPost"("employerId");

-- CreateIndex
CREATE INDEX "JobPost_status_idx" ON "JobPost"("status");

-- CreateIndex
CREATE INDEX "JobPost_status_createdAt_idx" ON "JobPost"("status", "createdAt");

-- CreateIndex
CREATE INDEX "JobPost_workMode_type_idx" ON "JobPost"("workMode", "type");

-- CreateIndex
CREATE UNIQUE INDEX "CandidateProfile_userId_key" ON "CandidateProfile"("userId");

-- CreateIndex
CREATE INDEX "Application_jobPostId_aiScore_idx" ON "Application"("jobPostId", "aiScore");

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

-- AddForeignKey
ALTER TABLE "JobPost" ADD CONSTRAINT "JobPost_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "EmployerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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

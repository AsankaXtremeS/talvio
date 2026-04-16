-- CreateEnum
CREATE TYPE "InterviewMeetingType" AS ENUM ('ONLINE', 'ONSITE', 'PHONE');

-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'CANCELLED', 'COMPLETED');

-- CreateTable
CREATE TABLE "Interview" (
    "id" TEXT NOT NULL,
    "employerId" TEXT NOT NULL,
    "candidateProfileId" TEXT NOT NULL,
    "jobPostId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "meetingType" "InterviewMeetingType" NOT NULL,
    "status" "InterviewStatus" NOT NULL DEFAULT 'DRAFT',
    "location" TEXT,
    "meetingLink" TEXT,
    "additionalInfo" TEXT,
    "emailBody" TEXT,
    "googleCalendarEventId" TEXT,
    "googleCalendarLink" TEXT,
    "candidateEmail" TEXT NOT NULL,
    "emailSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Interview_employerId_idx" ON "Interview"("employerId");

-- CreateIndex
CREATE INDEX "Interview_employerId_status_idx" ON "Interview"("employerId", "status");

-- CreateIndex
CREATE INDEX "Interview_employerId_scheduledAt_idx" ON "Interview"("employerId", "scheduledAt");

-- CreateIndex
CREATE INDEX "Interview_candidateProfileId_idx" ON "Interview"("candidateProfileId");

-- CreateIndex
CREATE INDEX "Interview_jobPostId_idx" ON "Interview"("jobPostId");

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "EmployerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_candidateProfileId_fkey" FOREIGN KEY ("candidateProfileId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_jobPostId_fkey" FOREIGN KEY ("jobPostId") REFERENCES "JobPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('JOB', 'INTERNSHIP');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'ACTIVE', 'CLOSED');

-- CreateTable
CREATE TABLE "JobPost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "type" "JobType" NOT NULL,
    "description" TEXT,
    "requirements" TEXT,
    "closedDate" TIMESTAMP(3),
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "employerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JobPost_employerId_idx" ON "JobPost"("employerId");

-- CreateIndex
CREATE INDEX "JobPost_status_idx" ON "JobPost"("status");

-- AddForeignKey
ALTER TABLE "JobPost" ADD CONSTRAINT "JobPost_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "EmployerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

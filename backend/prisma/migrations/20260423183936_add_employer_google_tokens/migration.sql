-- AlterTable
ALTER TABLE "EmployerProfile" ADD COLUMN     "googleAccessToken" TEXT,
ADD COLUMN     "googleCalendarConnected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "googleRefreshToken" TEXT,
ADD COLUMN     "googleTokenExpiry" BIGINT;

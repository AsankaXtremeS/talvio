-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "isReviewed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isShortlisted" BOOLEAN NOT NULL DEFAULT false;

-- Add cancellation tracking fields to Interview table
ALTER TABLE "Interview" ADD COLUMN "cancelledAt" TIMESTAMP(3),
ADD COLUMN "cancellationReason" TEXT;

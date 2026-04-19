-- Add reschedule tracking fields to Interview
ALTER TABLE "Interview" ADD COLUMN "rescheduledFromId" TEXT;
ALTER TABLE "Interview" ADD COLUMN "rescheduledToId" TEXT;
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_rescheduledFromId_fkey" FOREIGN KEY ("rescheduledFromId") REFERENCES "Interview"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_rescheduledToId_fkey" FOREIGN KEY ("rescheduledToId") REFERENCES "Interview"("id") ON DELETE SET NULL ON UPDATE CASCADE;

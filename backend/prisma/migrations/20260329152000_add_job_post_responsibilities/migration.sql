-- Add dedicated responsibilities field for employer job posts.
ALTER TABLE "JobPost"
  ADD COLUMN IF NOT EXISTS "responsibilities" TEXT;

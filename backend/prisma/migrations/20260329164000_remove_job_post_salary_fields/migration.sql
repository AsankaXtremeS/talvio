-- Remove salary fields from employer job posts.
ALTER TABLE "JobPost"
  DROP COLUMN IF EXISTS "salaryMin",
  DROP COLUMN IF EXISTS "salaryMax";

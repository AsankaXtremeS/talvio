-- Persist extended job post fields used by employer create/edit flows.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EmploymentType') THEN
    CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'WorkMode') THEN
    CREATE TYPE "WorkMode" AS ENUM ('ON_SITE', 'REMOTE', 'HYBRID');
  END IF;
END $$;

ALTER TABLE "JobPost"
  ADD COLUMN IF NOT EXISTS "additionalInformation" TEXT,
  ADD COLUMN IF NOT EXISTS "skills" TEXT,
  ADD COLUMN IF NOT EXISTS "workMode" "WorkMode",
  ADD COLUMN IF NOT EXISTS "employmentType" "EmploymentType",
  ADD COLUMN IF NOT EXISTS "location" TEXT,
  ADD COLUMN IF NOT EXISTS "salaryMin" INTEGER,
  ADD COLUMN IF NOT EXISTS "salaryMax" INTEGER;

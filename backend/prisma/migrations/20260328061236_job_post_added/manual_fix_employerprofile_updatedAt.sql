-- Manually fix: Add updatedAt to EmployerProfile with default value for existing rows
ALTER TABLE "EmployerProfile" ADD COLUMN "updatedAt" TIMESTAMP(3);
UPDATE "EmployerProfile" SET "updatedAt" = NOW() WHERE "updatedAt" IS NULL;
ALTER TABLE "EmployerProfile" ALTER COLUMN "updatedAt" SET NOT NULL;
-- Add trigger to auto-update updatedAt on row update (optional, for Postgres)
CREATE OR REPLACE FUNCTION update_updatedAt_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW."updatedAt" = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_updatedAt_on_employerprofile ON "EmployerProfile";
CREATE TRIGGER set_updatedAt_on_employerprofile
BEFORE UPDATE ON "EmployerProfile"
FOR EACH ROW EXECUTE PROCEDURE update_updatedAt_column();

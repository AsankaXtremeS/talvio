DO $$
BEGIN
	IF EXISTS (
		SELECT 1
		FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'JobPost'
			AND column_name = 'closedDate'
	) THEN
		ALTER TABLE "JobPost" RENAME COLUMN "closedDate" TO "closingDate";
	END IF;
END $$;

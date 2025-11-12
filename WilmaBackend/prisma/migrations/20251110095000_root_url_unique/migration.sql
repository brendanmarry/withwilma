-- Ensure existing rows have a rootUrl; if not, set to placeholder based on id
UPDATE "Organisation"
SET "rootUrl" = CONCAT('https://', COALESCE(NULLIF(TRIM(BOTH FROM "name"), ''), 'organisation'), '.local')
WHERE "rootUrl" IS NULL;

ALTER TABLE "Organisation"
  ALTER COLUMN "rootUrl" SET NOT NULL;

CREATE UNIQUE INDEX "Organisation_rootUrl_key" ON "Organisation"("rootUrl");



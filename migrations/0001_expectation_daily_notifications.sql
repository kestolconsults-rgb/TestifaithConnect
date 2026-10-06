ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "notify_expectation_daily" boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS "expectation_reminder_hour" integer DEFAULT 9 NOT NULL,
  ADD COLUMN IF NOT EXISTS "expectation_timezone" varchar(64) DEFAULT 'UTC' NOT NULL,
  ADD COLUMN IF NOT EXISTS "last_expectation_reminder_date" varchar(10);

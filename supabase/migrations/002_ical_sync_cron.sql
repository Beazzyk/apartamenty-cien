-- =============================================================
-- Migration 002: iCal sync cron job
--
-- RUN THIS AFTER DEPLOYING EDGE FUNCTIONS.
-- Replace the two placeholders below with your actual values:
--   1. YOUR_PROJECT_REF  -> your Supabase project ref (e.g. abcdefghijkl)
--   2. YOUR_SERVICE_ROLE_KEY -> your service_role key (starts with eyJ...)
--
-- You can also set this up via Supabase Dashboard > Database > Cron Jobs.
-- =============================================================

SELECT cron.schedule(
  'sync-booking-ical',
  '*/30 * * * *',
  $$
    SELECT net.http_post(
      url     := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/sync-ical',
      headers := jsonb_build_object(
        'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY',
        'Content-Type',  'application/json'
      ),
      body    := '{}'::jsonb
    );
  $$
);

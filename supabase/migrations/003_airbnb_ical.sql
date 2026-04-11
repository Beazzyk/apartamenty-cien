-- Airbnb iCal URL (secret token in URL — set only in DB / dashboard, never commit).
INSERT INTO settings (key, value) VALUES ('airbnb_ical_url', '')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE blocked_dates DROP CONSTRAINT IF EXISTS blocked_dates_source_check;
ALTER TABLE blocked_dates ADD CONSTRAINT blocked_dates_source_check
  CHECK (source IN ('direct', 'booking_import', 'manual', 'airbnb_import'));

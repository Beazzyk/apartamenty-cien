-- =============================================================
-- Migration 001: Initial schema for booking system
-- =============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "btree_gist";
CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- =============================================================
-- Tables
-- =============================================================

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO settings (key, value) VALUES
  ('price_per_night', '450'),
  ('currency', 'PLN'),
  ('apartment_name', 'Cień Ducha Gór'),
  ('owner_email', ''),
  ('booking_ical_url', ''),
  ('max_guests', '6')
ON CONFLICT (key) DO NOTHING;

-- ----- bookings -----
CREATE TABLE IF NOT EXISTS bookings (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_name        TEXT        NOT NULL,
  guest_email       TEXT        NOT NULL,
  guest_phone       TEXT,
  check_in          DATE        NOT NULL,
  check_out         DATE        NOT NULL,
  guests_count      INTEGER     NOT NULL DEFAULT 2,
  total_price       NUMERIC(10, 2) NOT NULL,
  status            TEXT        NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'confirmed', 'cancelled', 'expired')),
  stripe_session_id TEXT,
  source            TEXT        NOT NULL DEFAULT 'direct'
                      CHECK (source IN ('direct', 'booking_import')),
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT valid_dates   CHECK (check_out > check_in),
  CONSTRAINT valid_guests  CHECK (guests_count BETWEEN 1 AND 6),

  -- Race-condition killer: Postgres blocks overlapping date ranges at DB level.
  -- Uses '[)' = inclusive check_in, exclusive check_out (hotel convention).
  CONSTRAINT no_overlapping_bookings
    EXCLUDE USING gist (
      daterange(check_in, check_out, '[)') WITH &&
    ) WHERE (status IN ('pending', 'confirmed'))
);

-- ----- blocked_dates (from Booking.com iCal import) -----
CREATE TABLE IF NOT EXISTS blocked_dates (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date       DATE NOT NULL,
  source     TEXT NOT NULL DEFAULT 'booking_import'
               CHECK (source IN ('direct', 'booking_import', 'manual')),
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  summary    TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT unique_date_source UNIQUE (date, source)
);

-- ----- webhook_events (Stripe idempotency) -----
CREATE TABLE IF NOT EXISTS webhook_events (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_event_id TEXT NOT NULL UNIQUE,
  event_type      TEXT NOT NULL,
  booking_id      UUID REFERENCES bookings(id),
  processed_at    TIMESTAMPTZ DEFAULT now()
);

-- ----- system_logs (audit + debug) -----
CREATE TABLE IF NOT EXISTS system_logs (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  level      TEXT NOT NULL CHECK (level IN ('info', 'warn', 'error')),
  source     TEXT NOT NULL,
  message    TEXT NOT NULL,
  metadata   JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================
-- Indexes
-- =============================================================

CREATE INDEX IF NOT EXISTS idx_bookings_status         ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates          ON bookings(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_bookings_stripe_session ON bookings(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_date      ON blocked_dates(date);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_source    ON blocked_dates(source);
CREATE INDEX IF NOT EXISTS idx_webhook_events_sid      ON webhook_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_created     ON system_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_level       ON system_logs(level);

-- =============================================================
-- Row Level Security  (block ALL public access)
-- Edge Functions use service_role key which bypasses RLS.
-- =============================================================

ALTER TABLE bookings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates  ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings       ENABLE ROW LEVEL SECURITY;

-- =============================================================
-- pg_cron: expire pending bookings every 5 minutes
-- =============================================================

SELECT cron.schedule(
  'expire-pending-bookings',
  '*/5 * * * *',
  $$
    UPDATE bookings
    SET status = 'expired', updated_at = now()
    WHERE status = 'pending'
      AND created_at < now() - INTERVAL '15 minutes';
  $$
);

-- =============================================================
-- pg_cron: clean system_logs older than 30 days (daily at 3 AM)
-- =============================================================

SELECT cron.schedule(
  'clean-old-logs',
  '0 3 * * *',
  $$
    DELETE FROM system_logs
    WHERE created_at < now() - INTERVAL '30 days';
  $$
);

-- =============================================================
-- Migration 004: Add management_token to bookings
--
-- Secure one-click confirm/reject links in owner notification emails.
-- Each booking gets a unique UUID token embedded in the email links.
-- =============================================================

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS management_token UUID DEFAULT gen_random_uuid() NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_management_token
  ON bookings(management_token);

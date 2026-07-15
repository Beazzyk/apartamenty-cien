-- =============================================================
-- Migration 010: Guest address fields on bookings
-- =============================================================

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS guest_address     TEXT,
  ADD COLUMN IF NOT EXISTS guest_postal_code TEXT,
  ADD COLUMN IF NOT EXISTS guest_city        TEXT;

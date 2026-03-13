-- =============================================================
-- Migration 003: Update booking expiry for manual booking flow
--
-- Changes expire-pending-bookings cron from 15 minutes (Stripe)
-- to 7 days (manual contact process).
-- =============================================================

SELECT cron.unschedule('expire-pending-bookings');

SELECT cron.schedule(
  'expire-pending-bookings',
  '0 9 * * *',  -- daily at 9 AM
  $$
    UPDATE bookings
    SET status = 'expired', updated_at = now()
    WHERE status = 'pending'
      AND source = 'direct'
      AND created_at < now() - INTERVAL '7 days';
  $$
);

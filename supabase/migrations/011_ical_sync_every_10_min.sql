-- Pull the Booking.com calendar every 10 minutes instead of 30, so cleaning days
-- after new Booking.com stays reach our outgoing feed sooner.
SELECT cron.alter_job(
  (SELECT jobid FROM cron.job WHERE jobname = 'sync-booking-ical'),
  schedule := '*/10 * * * *'
);

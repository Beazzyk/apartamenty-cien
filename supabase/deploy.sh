#!/bin/bash
# =============================================================
# Deploy script for Supabase Edge Functions + secrets
#
# Prerequisites:
#   1. Install Supabase CLI: npm install -g supabase
#   2. Login: supabase login
#   3. Link project: supabase link --project-ref YOUR_PROJECT_REF
#   4. Run migration: supabase db push
# =============================================================

set -e

echo "=== Setting Supabase Secrets ==="
echo "Paste your values when prompted (or set them in Supabase Dashboard > Settings > Edge Functions):"

# Uncomment and fill in your values, then run this script:
# supabase secrets set \
#   STRIPE_SECRET_KEY=sk_test_... \
#   STRIPE_WEBHOOK_SECRET=whsec_... \
#   RESEND_API_KEY=re_... \
#   BOOKING_ICAL_URL=https://admin.booking.com/... \
#   SITE_URL=https://your-domain.com \
#   OWNER_EMAIL=your@email.com

echo ""
echo "=== Deploying Edge Functions ==="

# Public functions (no JWT required - called from frontend)
supabase functions deploy check-availability --no-verify-jwt
supabase functions deploy create-booking --no-verify-jwt
supabase functions deploy ical-feed --no-verify-jwt

# Stripe webhook (no JWT - verifies Stripe signature instead)
supabase functions deploy stripe-webhook --no-verify-jwt

# Internal function (requires JWT - called by pg_cron with service_role)
supabase functions deploy sync-ical

echo ""
echo "=== Deployment complete ==="
echo ""
echo "Next steps:"
echo "  1. Set Stripe webhook URL in Stripe Dashboard:"
echo "     https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook"
echo "     Events: checkout.session.completed, checkout.session.expired"
echo ""
echo "  2. Set iCal feed URL in Booking.com Extranet (Sync calendars):"
echo "     https://YOUR_PROJECT_REF.supabase.co/functions/v1/ical-feed"
echo ""
echo "  3. Run migration 002_ical_sync_cron.sql with your actual project ref"
echo "     and service_role key to enable automatic iCal sync every 30 minutes."
echo ""
echo "  4. Update VITE_SUPABASE_FUNCTIONS_URL in your frontend .env.local:"
echo "     https://YOUR_PROJECT_REF.supabase.co/functions/v1"

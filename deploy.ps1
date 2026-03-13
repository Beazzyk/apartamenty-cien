# =============================================================
# Wdrożenie systemu rezerwacji - Apartament Cień Ducha Gór
# Uruchom po zalogowaniu na supabase.com i stripe.com
# =============================================================

$supabaseBin = "$env:USERPROFILE\AppData\Local\supabase\supabase.exe"

function Check-CLI {
    $cmd = Get-Command supabase -ErrorAction SilentlyContinue
    if ($cmd) { return "supabase" }
    if (Test-Path $supabaseBin) { return $supabaseBin }
    Write-Host "[BLAD] Supabase CLI nie znaleziony." -ForegroundColor Red
    Write-Host "Pobierz ze: https://github.com/supabase/cli/releases/latest" -ForegroundColor Yellow
    exit 1
}

$supabase = Check-CLI
Write-Host "[OK] Supabase CLI: $(&$supabase --version)" -ForegroundColor Green

# --- Krok 1: Dane konfiguracyjne ---
Write-Host ""
Write-Host "=== KONFIGURACJA ===" -ForegroundColor Cyan
Write-Host "Potrzebne do konfiguracji:"
Write-Host "  - Supabase: https://supabase.com (Dashboard > Settings > General)"
Write-Host "  - Stripe: https://dashboard.stripe.com/apikeys"
Write-Host ""

$ProjectRef = Read-Host "Supabase Project Ref (np. abcdefghijkl)"
$StripeSecretKey = Read-Host "Stripe Secret Key (sk_live_... lub sk_test_...)"
$StripeWebhookSecret = Read-Host "Stripe Webhook Secret (whsec_...) [Enter jeśli nie masz jeszcze - ustaw po deploymencie]"
$SiteUrl = Read-Host "URL Twojej strony (np. https://cienduchgor.pl)"
$OwnerEmail = Read-Host "Twój e-mail (do powiadomień o rezerwacjach)"
$ResendApiKey = Read-Host "Resend API Key dla emaili (re_...) [Enter aby pominąć - emaile nie będą wysyłane]"

if (-not $ProjectRef -or $ProjectRef -eq "YOUR_PROJECT_REF") {
    Write-Host "[BLAD] Musisz podać poprawny Project Ref z Supabase Dashboard." -ForegroundColor Red
    exit 1
}

# --- Krok 2: Zaktualizuj .env.local ---
Write-Host ""
Write-Host "=== AKTUALIZACJA .env.local ===" -ForegroundColor Cyan
$envContent = "VITE_SUPABASE_FUNCTIONS_URL=https://$ProjectRef.supabase.co/functions/v1`n"
Set-Content -Path ".env.local" -Value $envContent
Write-Host "[OK] .env.local zaktualizowany" -ForegroundColor Green

# --- Krok 3: Zaktualizuj supabase/config.toml ---
(Get-Content "supabase\config.toml") -replace 'YOUR_PROJECT_REF', $ProjectRef | Set-Content "supabase\config.toml"
Write-Host "[OK] supabase/config.toml zaktualizowany" -ForegroundColor Green

# --- Krok 4: Login i linkowanie ---
Write-Host ""
Write-Host "=== LOGOWANIE DO SUPABASE ===" -ForegroundColor Cyan
Write-Host "Otworzy się przeglądarka - zaloguj się do Supabase..."
& $supabase login

Write-Host ""
Write-Host "=== LINKOWANIE PROJEKTU ===" -ForegroundColor Cyan
& $supabase link --project-ref $ProjectRef

# --- Krok 5: Migracja bazy danych ---
Write-Host ""
Write-Host "=== MIGRACJA BAZY DANYCH ===" -ForegroundColor Cyan
Write-Host "Uruchamianie migracji 001_initial_schema..."
& $supabase db push --project-ref $ProjectRef
Write-Host "[OK] Schemat bazy danych zainstalowany" -ForegroundColor Green

# --- Krok 6: Sekrety ---
Write-Host ""
Write-Host "=== USTAWIANIE SEKRETOW ===" -ForegroundColor Cyan

$secretArgs = @(
    "SUPABASE_URL=https://$ProjectRef.supabase.co",
    "STRIPE_SECRET_KEY=$StripeSecretKey",
    "SITE_URL=$SiteUrl",
    "OWNER_EMAIL=$OwnerEmail"
)
if ($StripeWebhookSecret) { $secretArgs += "STRIPE_WEBHOOK_SECRET=$StripeWebhookSecret" }
if ($ResendApiKey)         { $secretArgs += "RESEND_API_KEY=$ResendApiKey" }

& $supabase secrets set @secretArgs --project-ref $ProjectRef
Write-Host "[OK] Sekrety ustawione" -ForegroundColor Green

# --- Krok 7: Wdrożenie funkcji ---
Write-Host ""
Write-Host "=== WDROZENIE EDGE FUNCTIONS ===" -ForegroundColor Cyan

& $supabase functions deploy check-availability --no-verify-jwt --project-ref $ProjectRef
& $supabase functions deploy create-booking     --no-verify-jwt --project-ref $ProjectRef
& $supabase functions deploy ical-feed          --no-verify-jwt --project-ref $ProjectRef
& $supabase functions deploy stripe-webhook     --no-verify-jwt --project-ref $ProjectRef
& $supabase functions deploy sync-ical          --project-ref $ProjectRef

Write-Host "[OK] Wszystkie funkcje wdrożone" -ForegroundColor Green

# --- Podsumowanie ---
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  SYSTEM REZERWACJI WDROŻONY POMYŚLNIE!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "WYMAGANE DZIAŁANIA RĘCZNE:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. STRIPE - ustaw webhook:" -ForegroundColor White
Write-Host "   Stripe Dashboard > Developers > Webhooks > Add endpoint" -ForegroundColor Gray
Write-Host "   URL: https://$ProjectRef.supabase.co/functions/v1/stripe-webhook" -ForegroundColor Cyan
Write-Host "   Zdarzenia: checkout.session.completed, checkout.session.expired" -ForegroundColor Gray
if (-not $StripeWebhookSecret) {
    Write-Host "   Po stworzeniu webhoooka skopiuj 'Signing secret' i uruchom:" -ForegroundColor Gray
    Write-Host "   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_... --project-ref $ProjectRef" -ForegroundColor Cyan
    Write-Host "   supabase functions deploy stripe-webhook --no-verify-jwt --project-ref $ProjectRef" -ForegroundColor Cyan
}
Write-Host ""
Write-Host "2. GOOGLE CALENDAR (opcjonalnie) - subskrypcja kalendarza:" -ForegroundColor White
Write-Host "   Google Calendar > + > Z adresu URL > wklej:" -ForegroundColor Gray
Write-Host "   https://$ProjectRef.supabase.co/functions/v1/ical-feed" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. HOSTING - dodaj zmienną środowiskową:" -ForegroundColor White
Write-Host "   VITE_SUPABASE_FUNCTIONS_URL=https://$ProjectRef.supabase.co/functions/v1" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. BOOKING.COM (gdy założysz konto):" -ForegroundColor White
Write-Host "   - Skopiuj URL iCal z Extranet > Kalendarze > Eksport" -ForegroundColor Gray
Write-Host "   - W Supabase SQL Editor wykonaj:" -ForegroundColor Gray
Write-Host "     UPDATE settings SET value = 'TWOJ_ICAL_URL' WHERE key = 'booking_ical_url';" -ForegroundColor Cyan
Write-Host "   - Uruchom supabase/migrations/002_ical_sync_cron.sql (uzupełnij PROJECT_REF i SERVICE_ROLE_KEY)" -ForegroundColor Gray
Write-Host ""

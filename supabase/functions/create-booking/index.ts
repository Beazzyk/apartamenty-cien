import { supabaseAdmin } from "../_shared/supabase.ts";
import { normalizeDateOnly } from "../_shared/date.ts";
import { corsResponse, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { log } from "../_shared/logger.ts";
import { expandDateRange } from "../_shared/ical-parser.ts";
import { fetchMergedExternalIcalDates } from "../_shared/external-ical.ts";
import { fetchPricingFromDb } from "../_shared/pricing.ts";
import { computeStayPriceBreakdown, getSeasonConfig } from "../_shared/seasons.ts";

// ── Escape HTML — prevents XSS in email templates ────────────────────────────
function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** W atrybucie href surowe „&” w query psuje HTML w wielu klientach pocztowych (obcinana treść, brak przycisków). */
function hrefAmp(url: string): string {
  return url.replace(/&/g, "&amp;");
}

const SITE_BASE = (Deno.env.get("SITE_URL") ?? "https://cienduchagor.pl").replace(/\/$/, "");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse(req);

  try {
    const body = await req.json();
    const { guest_name, guest_email, guest_phone, check_in, check_out, guests_count } = body;

    // --- Validation ---
    if (!guest_name?.trim() || !guest_email?.trim() || !check_in || !check_out) {
      return errorResponse("Wymagane pola: imię, e-mail, data przyjazdu, data wyjazdu", req, 400);
    }

    // Length limits (M-1)
    if (guest_name.trim().length > 200) {
      return errorResponse("Imię i nazwisko jest zbyt długie.", req, 400);
    }
    if (guest_email.trim().length > 254) {
      return errorResponse("Adres e-mail jest zbyt długi.", req, 400);
    }
    if (guest_phone && guest_phone.length > 30) {
      return errorResponse("Numer telefonu jest zbyt długi.", req, 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guest_email)) {
      return errorResponse("Nieprawidłowy adres e-mail", req, 400);
    }

    // Phone format (L-3)
    const phoneRegex = /^\+?[\d\s\-(). ]{7,20}$/;
    if (guest_phone?.trim() && !phoneRegex.test(guest_phone.trim())) {
      return errorResponse("Nieprawidłowy format numeru telefonu.", req, 400);
    }

    const checkInNorm = normalizeDateOnly(check_in);
    const checkOutNorm = normalizeDateOnly(check_out);
    const checkInDate  = new Date(checkInNorm  + "T00:00:00Z");
    const checkOutDate = new Date(checkOutNorm + "T00:00:00Z");
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return errorResponse("Nieprawidłowy format daty.", req, 400);
    }
    if (checkOutDate <= checkInDate) {
      return errorResponse("Data wyjazdu musi być po dacie przyjazdu", req, 400);
    }
    if (checkInDate < today) {
      return errorResponse("Nie można rezerwować dat z przeszłości", req, 400);
    }

    // Max 2 years in future (M-1)
    const maxFuture = new Date();
    maxFuture.setFullYear(maxFuture.getFullYear() + 2);
    if (checkInDate > maxFuture) {
      return errorResponse("Data przyjazdu nie może być odleglejsza niż 2 lata.", req, 400);
    }

    // Rate limiting: max 3 pending bookings per email per 24h (H-2)
    const oneDayAgo = new Date(Date.now() - 86_400_000).toISOString();
    const { count: pendingCount } = await supabaseAdmin
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("guest_email", guest_email.trim().toLowerCase())
      .eq("status", "pending")
      .gte("created_at", oneDayAgo);
    if ((pendingCount ?? 0) >= 3) {
      return errorResponse("Zbyt wiele zapytań z tego adresu e-mail. Spróbuj ponownie po 24 godzinach.", req, 429);
    }

    const guestCount = Math.min(Math.max(parseInt(guests_count) || 2, 1), 6);

    // --- Fresh iCal check (Booking.com + Airbnb when URLs configured) ---
    const icalBlocked = await fetchMergedExternalIcalDates(
      supabaseAdmin,
      checkInNorm,
      checkOutNorm,
      3000,
    );
    if (icalBlocked.length > 0) {
      const requestedDates = new Set(expandDateRange(checkInNorm, checkOutNorm));
      const conflict = icalBlocked.find((d) => requestedDates.has(d));
      if (conflict) {
        return errorResponse("Wybrane daty są już zajęte. Proszę wybrać inny termin.", req, 409);
      }
    }

    // --- Season: validate minimum nights and calculate price (rates from settings) ---
    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / 86_400_000,
    );

    const pricing = await fetchPricingFromDb(supabaseAdmin);
    const season = getSeasonConfig(checkInNorm, checkOutNorm, pricing);
    const priceBreakdown = computeStayPriceBreakdown(checkInNorm, checkOutNorm, pricing);
    const estimatedPrice = Math.round(priceBreakdown.total * 100) / 100;

    if (nights < season.minNights) {
      return errorResponse(
        `Dla wybranego terminu (${season.label}) wymagane są minimum ${season.minNights} ${season.minNights < 5 ? "noce" : "nocy"}.`,
        req,
        400,
      );
    }

    // --- Insert booking — fetch management_token too ---
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .insert({
        guest_name: guest_name.trim(),
        guest_email: guest_email.trim().toLowerCase(),
        guest_phone: guest_phone?.trim() || null,
        check_in: checkInNorm,
        check_out: checkOutNorm,
        guests_count: guestCount,
        total_price: estimatedPrice,
        status: "pending",
        source: "direct",
      })
      .select("id, management_token")
      .single();

    if (bookingError) {
      if (bookingError.code === "23P01") {
        return errorResponse("Wybrane daty nie są już dostępne. Proszę wybrać inny termin.", req, 409);
      }
      throw bookingError;
    }

    // --- Send email notifications ---
    await sendNotifications({
      bookingId: booking.id,
      managementToken: booking.management_token,
      guestName: guest_name.trim(),
      guestEmail: guest_email.trim().toLowerCase(),
      guestPhone: guest_phone?.trim() || null,
      checkIn: checkInNorm,
      checkOut: checkOutNorm,
      guestsCount: guestCount,
      nights,
      estimatedPrice,
    });

    await log("info", "booking", `Inquiry received: ${booking.id}`, {
      booking_id: booking.id,
      check_in: checkInNorm,
      check_out: checkOutNorm,
      nights,
      guests_count: guestCount,
      total_price: estimatedPrice,
      rates: {
        off: pricing.price_per_night_offseason,
        peak: pricing.price_per_night_peak,
        holiday: pricing.price_per_night_holiday,
      },
      breakdown_lines: priceBreakdown.lines.map((l) => ({
        tier: l.tier,
        n: l.nights,
        unit: l.unitPrice,
      })),
    });

    return jsonResponse({
      success: true,
      booking_id: booking.id,
      total_price: estimatedPrice,
      breakdown: priceBreakdown.lines.map((l) => ({
        tier: l.tier,
        nights: l.nights,
        unit_price: l.unitPrice,
        subtotal: l.subtotal,
      })),
    }, req);
  } catch (error) {
    await log("error", "booking", `Create booking failed: ${error.message}`, {
      error: String(error),
    });
    console.error("[create-booking]", error);
    return errorResponse("Nie udało się wysłać zapytania. Spróbuj ponownie lub skontaktuj się bezpośrednio.", req, 500);
  }
});

// ---- Email helpers ----

interface NotificationData {
  bookingId: string;
  managementToken: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string | null;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  nights: number;
  estimatedPrice: number;
}

async function sendNotifications(data: NotificationData): Promise<void> {
  const resendKey = Deno.env.get("RESEND_API_KEY");
  const ownerEmail = Deno.env.get("OWNER_EMAIL");
  const fromEmail = Deno.env.get("FROM_EMAIL") ?? "Cień Ducha Gór <onboarding@resend.dev>";

  if (!resendKey) {
    await log("warn", "email", "RESEND_API_KEY not configured – emails not sent");
    return;
  }

  const nightsLabel = data.nights === 1 ? "noc" : data.nights < 5 ? "noce" : "nocy";
  const phoneText   = data.guestPhone || "nie podano";

  // Escape all user-supplied fields before HTML insertion (H-4)
  const safeName   = esc(data.guestName);
  const safeEmail  = esc(data.guestEmail);
  const safePhone  = esc(phoneText);
  const safeIn     = esc(data.checkIn);
  const safeOut    = esc(data.checkOut);
  const safeNights = esc(data.nights);
  const safeNLabel = esc(nightsLabel);
  const safeGuests = esc(data.guestsCount);
  const safePrice  = esc(data.estimatedPrice);
  const safeId     = esc(data.bookingId);

  const tokenEnc = encodeURIComponent(String(data.managementToken ?? ""));
  const viewUrlPlain = `${SITE_BASE}/rezerwacja/zarzadzaj?token=${tokenEnc}`;
  const viewHref = hrefAmp(viewUrlPlain);

  // --- Email do właściciela: jeden przycisk → strona z potwierdzeniem / odrzuceniem ---
  if (ownerEmail) {
    const ownerText =
      `Nowe zapytanie o rezerwację — Apartament Cień Ducha Gór\n\n` +
      `Termin: ${data.checkIn} → ${data.checkOut}\n` +
      `Noce: ${data.nights} ${nightsLabel}\n` +
      `Goście: ${data.guestsCount}\n` +
      `Szac. cena: ${data.estimatedPrice} PLN\n\n` +
      `Gość: ${data.guestName}\n` +
      `E-mail: ${data.guestEmail}\n` +
      `Telefon: ${phoneText}\n\n` +
      `Otwórz stronę z rezerwacją (skopiuj do przeglądarki):\n${viewUrlPlain}\n\n` +
      `Na stronie możesz potwierdzić lub odrzucić zapytanie.\n\n` +
      `ID: ${data.bookingId}`;

    const ownerInner = `
<div style="font-family:Georgia,serif;max-width:620px;margin:0 auto;background:#FDFBF7;padding:40px;border-radius:12px;border:1px solid #D2B48C;">
  <h1 style="color:#3D352F;font-size:22px;margin:0 0 4px;">Nowe zapytanie o rezerwację</h1>
  <p style="color:#A68A64;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 24px;">Apartament Cień Ducha Gór</p>
  <hr style="border:none;border-top:1px solid #D2B48C;margin:0 0 24px;">

  <table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px;">
    <tr style="background:#F5F0E8;">
      <td colspan="2" style="padding:8px 12px;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#A68A64;font-weight:bold;">Termin pobytu</td>
    </tr>
    <tr>
      <td style="padding:8px 12px;color:#666;">Przyjazd</td>
      <td style="padding:8px 12px;font-weight:bold;color:#3D352F;">${safeIn}</td>
    </tr>
    <tr style="background:#FDFBF7;">
      <td style="padding:8px 12px;color:#666;">Wyjazd</td>
      <td style="padding:8px 12px;font-weight:bold;color:#3D352F;">${safeOut}</td>
    </tr>
    <tr>
      <td style="padding:8px 12px;color:#666;">Liczba nocy</td>
      <td style="padding:8px 12px;font-weight:bold;color:#3D352F;">${safeNights} ${safeNLabel}</td>
    </tr>
    <tr style="background:#FDFBF7;">
      <td style="padding:8px 12px;color:#666;">Goście</td>
      <td style="padding:8px 12px;font-weight:bold;color:#3D352F;">${safeGuests}</td>
    </tr>
    <tr>
      <td style="padding:8px 12px;color:#666;">Szac. cena</td>
      <td style="padding:8px 12px;font-weight:bold;color:#A68A64;font-size:16px;">${safePrice} PLN</td>
    </tr>
    <tr style="background:#F5F0E8;">
      <td colspan="2" style="padding:8px 12px;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#A68A64;font-weight:bold;">Dane gościa</td>
    </tr>
    <tr style="background:#FDFBF7;">
      <td style="padding:8px 12px;color:#666;">Imię i nazwisko</td>
      <td style="padding:8px 12px;font-weight:bold;color:#3D352F;">${safeName}</td>
    </tr>
    <tr>
      <td style="padding:8px 12px;color:#666;">E-mail</td>
      <td style="padding:8px 12px;"><a href="mailto:${safeEmail}" style="color:#A68A64;font-weight:bold;">${safeEmail}</a></td>
    </tr>
    <tr style="background:#FDFBF7;">
      <td style="padding:8px 12px;color:#666;">Telefon</td>
      <td style="padding:8px 12px;font-weight:bold;color:#3D352F;">${safePhone}</td>
    </tr>
  </table>

  <hr style="border:none;border-top:1px solid #D2B48C;margin:28px 0 24px;">

  <p style="color:#3D352F;font-size:14px;font-weight:bold;text-align:center;margin:0 0 8px;">Zobacz zapytanie i podejmij decyzję</p>
  <p style="color:#666;font-size:12px;text-align:center;line-height:1.5;margin:0 0 20px;">Na stronie apartamentu potwierdzisz lub odrzucisz rezerwację — obie opcje są widoczne po kliknięciu.</p>

  <table role="presentation" style="width:100%;border-collapse:collapse;">
    <tr>
      <td style="padding:0;text-align:center;">
        <a href="${viewHref}" style="display:inline-block;background:#3D352F;color:#FDFBF7;text-align:center;padding:16px 32px;border-radius:50px;text-decoration:none;font-size:15px;font-weight:bold;font-family:Arial,sans-serif;line-height:1.3;">ZOBACZ REZERWACJĘ</a>
      </td>
    </tr>
  </table>

  <p style="color:#666;font-size:12px;line-height:1.5;margin:20px 0 8px;">Jeśli przycisk nie działa, skopiuj link do przeglądarki:</p>
  <p style="color:#3D352F;font-size:11px;word-break:break-all;margin:0 0 20px;"><a href="${viewHref}" style="color:#A68A64;">${esc(viewUrlPlain)}</a></p>

  <hr style="border:none;border-top:1px solid #D2B48C;margin:0 0 16px;">
  <p style="color:#888;font-size:11px;text-align:center;margin:0;">ID: ${safeId}</p>
</div>`;

    const ownerHtml = `<!DOCTYPE html>
<html lang="pl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nowe zapytanie</title></head>
<body style="margin:0;padding:24px 12px;background:#F5F0E8;">${ownerInner}
</body>
</html>`;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: fromEmail,
        to: [ownerEmail],
        subject: `[Nowe zapytanie] ${data.guestName} | ${data.checkIn} → ${data.checkOut} | ${data.estimatedPrice} PLN`,
        html: ownerHtml,
        text: ownerText,
      }),
    }).catch((e) => console.error("[email] owner notification failed:", e));
  }

  // --- Auto-odpowiedź do gościa ---
  const guestHtml = `
<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#FDFBF7;padding:40px;border-radius:12px;border:1px solid #D2B48C;">
  <h1 style="color:#3D352F;font-size:22px;margin:0 0 4px;">Dziękujemy za zapytanie!</h1>
  <p style="color:#A68A64;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 24px;">Apartament Cień Ducha Gór · Szklarska Poręba</p>
  <hr style="border:none;border-top:1px solid #D2B48C;margin:0 0 24px;">
  <p style="color:#3D352F;font-size:15px;">Drogi/Droga <strong>${safeName}</strong>,</p>
  <p style="color:#3D352F;font-size:15px;line-height:1.7;">
    Otrzymaliśmy Twoje zapytanie o rezerwację. Odezwiemy się do Ciebie <strong>w ciągu 24 godzin</strong>,
    aby potwierdzić dostępność i omówić szczegóły.
  </p>
  <div style="background:#F5F0E8;border-radius:8px;padding:20px;margin:24px 0;">
    <p style="color:#A68A64;font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:bold;margin:0 0 12px;">Szczegóły Twojego zapytania</p>
    <p style="color:#3D352F;font-size:14px;margin:4px 0;"><strong>Przyjazd:</strong> ${safeIn}</p>
    <p style="color:#3D352F;font-size:14px;margin:4px 0;"><strong>Wyjazd:</strong> ${safeOut}</p>
    <p style="color:#3D352F;font-size:14px;margin:4px 0;"><strong>Noce:</strong> ${safeNights} ${safeNLabel}</p>
    <p style="color:#3D352F;font-size:14px;margin:4px 0;"><strong>Goście:</strong> ${safeGuests}</p>
    <p style="color:#A68A64;font-size:16px;font-weight:bold;margin:12px 0 0;"><strong>Szacunkowa cena:</strong> ${safePrice} PLN</p>
  </div>
  <p style="color:#888;font-size:13px;line-height:1.6;">
    Termin zostanie oficjalnie zarezerwowany po potwierdzeniu przez nas i uregulowaniu zaliczki.
  </p>
  <hr style="border:none;border-top:1px solid #D2B48C;margin:24px 0;">
  <p style="color:#3D352F;font-size:14px;margin:0;">Do zobaczenia w Szklarskiej Porębie!</p>
  <p style="color:#A68A64;font-size:13px;font-style:italic;margin:4px 0 0;">Apartament Cień Ducha Gór</p>
</div>`;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: fromEmail,
      to: [data.guestEmail],
      subject: `Potwierdzenie zapytania – ${data.checkIn} → ${data.checkOut}`,
      html: guestHtml,
    }),
  }).catch((e) => console.error("[email] guest reply failed:", e));

  await log("info", "email", `Notifications sent for inquiry ${data.bookingId}`);
}

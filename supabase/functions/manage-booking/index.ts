import { supabaseAdmin } from "../_shared/supabase.ts";
import { log } from "../_shared/logger.ts";

const SITE_URL   = Deno.env.get("SITE_URL") ?? "https://cienduchagor.pl";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "Cień Ducha Gór <onboarding@resend.dev>";
const RESEND_KEY = Deno.env.get("RESEND_API_KEY");
const TOKEN_TTL_DAYS = 7;

// ── Escape HTML — prevents XSS from user-supplied data ──────────────────────
function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ── Router ───────────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "GET") {
    const url    = new URL(req.url);
    const action = url.searchParams.get("action");
    const token  = url.searchParams.get("token");
    return await handleGet(action, token);
  }

  if (req.method === "POST") {
    const ct = req.headers.get("content-type") ?? "";
    let action: string | null = null;
    let token:  string | null = null;

    if (ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data")) {
      const form = await req.formData();
      action = form.get("action") as string | null;
      token  = form.get("token")  as string | null;
    } else {
      try {
        const body = await req.json();
        action = body.action;
        token  = body.token;
      } catch { /* ignore */ }
    }
    return await handlePost(action, token);
  }

  return htmlPage("Niedozwolona metoda", "Użyj przeglądarki, aby otworzyć ten link.", "error");
});

// ── GET: show branded confirmation page (no action performed yet) ─────────────
async function handleGet(action: string | null, token: string | null): Promise<Response> {
  if (!token || (action !== "confirm" && action !== "cancel")) {
    return htmlPage("Nieprawidłowy link", "Brakuje wymaganych parametrów lub link jest niepoprawny.", "error");
  }

  const booking = await fetchBooking(token);
  if (!booking) {
    return htmlPage("Nieznaleziono rezerwacji", "Link jest nieprawidłowy. Sprawdź skrzynkę odbiorczą ponownie.", "error");
  }

  if (booking.status !== "pending") {
    return renderAlreadyProcessed(booking);
  }

  if (isTokenExpired(booking.created_at)) {
    return htmlPage("Link wygasł", `Ten link zarządzania wygasł. Linki są ważne ${TOKEN_TTL_DAYS} dni od daty zapytania.`, "error");
  }

  return renderConfirmPage(booking, action, token);
}

// ── POST: perform the actual action ──────────────────────────────────────────
async function handlePost(action: string | null, token: string | null): Promise<Response> {
  if (!token || (action !== "confirm" && action !== "cancel")) {
    return htmlPage("Nieprawidłowy link", "Brakuje wymaganych parametrów.", "error");
  }

  const booking = await fetchBooking(token);
  if (!booking) {
    return htmlPage("Nieznaleziono rezerwacji", "Link jest nieprawidłowy lub wygasł.", "error");
  }

  if (booking.status !== "pending") {
    return renderAlreadyProcessed(booking);
  }

  if (isTokenExpired(booking.created_at)) {
    return htmlPage("Link wygasł", `Ten link zarządzania wygasł. Linki są ważne ${TOKEN_TTL_DAYS} dni.`, "error");
  }

  const newStatus = action === "confirm" ? "confirmed" : "cancelled";

  const { error: updateErr } = await supabaseAdmin
    .from("bookings")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", booking.id)
    .eq("status", "pending");

  if (updateErr) {
    await log("error", "manage-booking", `Update failed for ${booking.id}`, { error: String(updateErr) });
    return htmlPage("Błąd serwera", "Nie udało się zaktualizować rezerwacji. Spróbuj ponownie.", "error");
  }

  await log("info", "manage-booking", `Booking ${booking.id} → ${newStatus}`, { booking_id: booking.id, action });
  await sendGuestEmail(booking, newStatus);

  if (action === "confirm") {
    return htmlPage(
      "Rezerwacja potwierdzona ✓",
      `Rezerwacja dla <strong>${esc(booking.guest_name)}</strong>
       (${esc(booking.check_in)} – ${esc(booking.check_out)}, ${esc(booking.guests_count)} os.)
       została <strong>potwierdzona</strong>.<br><br>
       Gość otrzymał e-mail z potwierdzeniem.`,
      "success",
    );
  } else {
    return htmlPage(
      "Rezerwacja anulowana",
      `Rezerwacja dla <strong>${esc(booking.guest_name)}</strong>
       (${esc(booking.check_in)} – ${esc(booking.check_out)})
       została <strong>anulowana</strong>.<br><br>
       Gość otrzymał e-mail z informacją.`,
      "info",
    );
  }
}

// ── DB helpers ────────────────────────────────────────────────────────────────
interface BookingRow {
  id: string;
  status: string;
  guest_name: string;
  guest_email: string;
  check_in: string;
  check_out: string;
  guests_count: number;
  total_price: number;
  created_at: string;
}

async function fetchBooking(token: string): Promise<BookingRow | null> {
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select("id, status, guest_name, guest_email, check_in, check_out, guests_count, total_price, created_at")
    .eq("management_token", token)
    .single();
  if (error || !data) return null;
  return data as BookingRow;
}

function isTokenExpired(createdAt: string): boolean {
  const expiry = new Date(createdAt);
  expiry.setDate(expiry.getDate() + TOKEN_TTL_DAYS);
  return new Date() > expiry;
}

function renderAlreadyProcessed(booking: BookingRow): Response {
  const labels: Record<string, string> = {
    confirmed: "potwierdzona ✓",
    cancelled: "anulowana",
    expired:   "wygasła",
  };
  const label = labels[booking.status] ?? booking.status;
  return htmlPage(
    "Rezerwacja już przetworzona",
    `Rezerwacja dla <strong>${esc(booking.guest_name)}</strong>
     (${esc(booking.check_in)} – ${esc(booking.check_out)})
     jest już <strong>${esc(label)}</strong>.`,
    booking.status === "confirmed" ? "success" : "info",
  );
}

// ── Confirmation landing page (GET) — no action performed here ───────────────
function renderConfirmPage(booking: BookingRow, action: string, token: string): Response {
  const isConfirm  = action === "confirm";
  const btnLabel   = isConfirm ? "✓ POTWIERDŹ REZERWACJĘ" : "✕ ODRZUĆ REZERWACJĘ";
  const btnColor   = isConfirm ? "#22C55E" : "#EF4444";
  const heading    = isConfirm ? "Potwierdzenie rezerwacji" : "Odrzucenie rezerwacji";
  const description = isConfirm
    ? "Czy na pewno chcesz <strong>potwierdzić</strong> tę rezerwację? Gość otrzyma e-mail z potwierdzeniem."
    : "Czy na pewno chcesz <strong>odrzucić</strong> tę rezerwację? Gość otrzyma e-mail z informacją.";

  const body = `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(heading)} – Cień Ducha Gór</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Georgia, serif; background: #F5F0E8; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .card { background: #FDFBF7; border: 1px solid #D2B48C; border-radius: 16px; padding: 48px 40px; max-width: 520px; width: 100%; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.08); }
    .label { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #A68A64; margin-bottom: 8px; font-family: sans-serif; }
    h1 { font-size: 22px; color: #3D352F; margin-bottom: 16px; line-height: 1.3; }
    .desc { font-size: 15px; color: #3D352F; line-height: 1.7; margin-bottom: 24px; }
    .details { background: #F5F0E8; border-radius: 8px; padding: 16px 20px; margin: 0 0 28px; text-align: left; font-size: 14px; color: #3D352F; line-height: 2; }
    .btn { display: block; width: 100%; padding: 16px; border: none; border-radius: 50px; font-size: 15px; font-weight: bold; font-family: sans-serif; cursor: pointer; color: #fff; background: ${btnColor}; margin-bottom: 12px; }
    .btn:hover { opacity: 0.9; }
    .btn-back { display: inline-block; padding: 12px 24px; border-radius: 50px; font-size: 13px; font-family: sans-serif; color: #3D352F; background: #F5F0E8; border: 1px solid #D2B48C; text-decoration: none; }
    .btn-back:hover { background: #D2B48C; }
  </style>
</head>
<body>
  <div class="card">
    <div class="label">Apartament Cień Ducha Gór</div>
    <h1>${esc(heading)}</h1>
    <p class="desc">${description}</p>
    <div class="details">
      <strong>Gość:</strong> ${esc(booking.guest_name)}<br>
      <strong>Termin:</strong> ${esc(booking.check_in)} – ${esc(booking.check_out)}<br>
      <strong>Osób:</strong> ${esc(booking.guests_count)}<br>
      <strong>Kwota:</strong> ${esc(booking.total_price)} PLN
    </div>
    <form method="POST">
      <input type="hidden" name="action" value="${esc(action)}">
      <input type="hidden" name="token" value="${esc(token)}">
      <button type="submit" class="btn">${btnLabel}</button>
    </form>
    <a href="${esc(SITE_URL)}" class="btn-back">Wróć na stronę</a>
  </div>
</body>
</html>`;

  return new Response(body, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
}

// ── Email to guest ────────────────────────────────────────────────────────────
async function sendGuestEmail(booking: BookingRow, status: "confirmed" | "cancelled"): Promise<void> {
  if (!RESEND_KEY) {
    await log("warn", "manage-booking", "RESEND_API_KEY not set – guest email skipped");
    return;
  }

  const nights = Math.ceil(
    (new Date(booking.check_out).getTime() - new Date(booking.check_in).getTime()) / 86_400_000,
  );
  const nightsLabel = nights === 1 ? "noc" : nights < 5 ? "noce" : "nocy";
  const isConfirm   = status === "confirmed";

  const subject = isConfirm
    ? `Rezerwacja potwierdzona – ${booking.check_in} – ${booking.check_out}`
    : `Informacja o rezerwacji – ${booking.check_in} – ${booking.check_out}`;

  // All user-supplied fields are escaped before insertion into HTML
  const safeName   = esc(booking.guest_name);
  const safeIn     = esc(booking.check_in);
  const safeOut    = esc(booking.check_out);
  const safeGuests = esc(booking.guests_count);
  const safePrice  = esc(booking.total_price);
  const safeNights = esc(nights);
  const safeLabel  = esc(nightsLabel);

  const bodyHtml = isConfirm
    ? `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#FDFBF7;padding:40px;border-radius:12px;border:1px solid #D2B48C;">
  <h1 style="color:#3D352F;font-size:22px;margin:0 0 4px;">Twoja rezerwacja jest potwierdzona!</h1>
  <p style="color:#A68A64;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 24px;">Apartament Cień Ducha Gór · Szklarska Poręba</p>
  <hr style="border:none;border-top:1px solid #D2B48C;margin:0 0 24px;">
  <p style="color:#3D352F;font-size:15px;">Drogi/Droga <strong>${safeName}</strong>,</p>
  <p style="color:#3D352F;font-size:15px;line-height:1.7;">Z przyjemnością potwierdzamy Twoją rezerwację. Wkrótce prześlemy szczegóły dotyczące płatności.</p>
  <div style="background:#F5F0E8;border-radius:8px;padding:20px;margin:24px 0;">
    <p style="color:#A68A64;font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:bold;margin:0 0 12px;">Szczegóły rezerwacji</p>
    <p style="color:#3D352F;font-size:14px;margin:4px 0;"><strong>Przyjazd:</strong> ${safeIn} od 14:00</p>
    <p style="color:#3D352F;font-size:14px;margin:4px 0;"><strong>Wyjazd:</strong> ${safeOut} do 12:00</p>
    <p style="color:#3D352F;font-size:14px;margin:4px 0;"><strong>Liczba nocy:</strong> ${safeNights} ${safeLabel}</p>
    <p style="color:#3D352F;font-size:14px;margin:4px 0;"><strong>Goście:</strong> ${safeGuests}</p>
    <p style="color:#A68A64;font-size:16px;font-weight:bold;margin:12px 0 0;"><strong>Kwota:</strong> ${safePrice} PLN</p>
  </div>
  <p style="color:#888;font-size:13px;line-height:1.6;">Adres: ul. Dworcowa 1, 58-580 Szklarska Poręba<br>Kaucja zwrotna: 500 PLN (pobierana przy zameldowaniu)</p>
  <hr style="border:none;border-top:1px solid #D2B48C;margin:24px 0;">
  <p style="color:#3D352F;font-size:14px;margin:0;">Do zobaczenia!</p>
  <p style="color:#A68A64;font-size:13px;font-style:italic;margin:4px 0 0;">Apartament Cień Ducha Gór</p>
</div>`
    : `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#FDFBF7;padding:40px;border-radius:12px;border:1px solid #D2B48C;">
  <h1 style="color:#3D352F;font-size:22px;margin:0 0 4px;">Informacja o Twoim zapytaniu</h1>
  <p style="color:#A68A64;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 24px;">Apartament Cień Ducha Gór · Szklarska Poręba</p>
  <hr style="border:none;border-top:1px solid #D2B48C;margin:0 0 24px;">
  <p style="color:#3D352F;font-size:15px;">Drogi/Droga <strong>${safeName}</strong>,</p>
  <p style="color:#3D352F;font-size:15px;line-height:1.7;">Niestety, wybrany termin <strong>${safeIn} – ${safeOut}</strong> nie jest już dostępny. Przepraszamy za niedogodności.</p>
  <p style="color:#3D352F;font-size:15px;line-height:1.7;">Zapraszamy do sprawdzenia innych dostępnych terminów na naszej stronie.</p>
  <div style="text-align:center;margin:32px 0;">
    <a href="${esc(SITE_URL)}/#rezerwacja" style="background:#3D352F;color:#FDFBF7;padding:14px 32px;border-radius:50px;text-decoration:none;font-size:14px;font-weight:bold;">
      Sprawdź dostępne terminy
    </a>
  </div>
  <hr style="border:none;border-top:1px solid #D2B48C;margin:24px 0;">
  <p style="color:#A68A64;font-size:13px;font-style:italic;margin:0;">Apartament Cień Ducha Gór</p>
</div>`;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM_EMAIL, to: [booking.guest_email], subject, html: bodyHtml }),
  }).catch((err) => console.error("[manage-booking] guest email failed:", err));
}

// ── Generic branded HTML page ─────────────────────────────────────────────────
function htmlPage(title: string, message: string, variant: "success" | "info" | "error"): Response {
  const c = {
    success: { bg: "#F0FDF4", border: "#86EFAC", icon: "✓", iconBg: "#22C55E", iconColor: "#fff" },
    info:    { bg: "#FDFBF7", border: "#D2B48C", icon: "i", iconBg: "#A68A64", iconColor: "#fff" },
    error:   { bg: "#FFF5F5", border: "#FCA5A5", icon: "!", iconBg: "#EF4444", iconColor: "#fff" },
  }[variant];

  const body = `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)} – Cień Ducha Gór</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Georgia, serif; background: #F5F0E8; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .card { background: ${c.bg}; border: 1px solid ${c.border}; border-radius: 16px; padding: 48px 40px; max-width: 520px; width: 100%; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.08); }
    .icon { width: 64px; height: 64px; background: ${c.iconBg}; color: ${c.iconColor}; border-radius: 50%; font-size: 28px; font-weight: bold; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
    .label { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #A68A64; margin-bottom: 8px; }
    h1 { font-size: 24px; color: #3D352F; margin-bottom: 16px; line-height: 1.3; }
    p { font-size: 15px; color: #3D352F; line-height: 1.7; }
    .back { display: inline-block; margin-top: 32px; padding: 12px 28px; background: #3D352F; color: #FDFBF7; border-radius: 50px; text-decoration: none; font-size: 13px; font-family: sans-serif; }
    .back:hover { background: #A68A64; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${c.icon}</div>
    <div class="label">Apartament Cień Ducha Gór</div>
    <h1>${esc(title)}</h1>
    <p>${message}</p>
    <a href="${esc(SITE_URL)}" class="back">Wróć na stronę</a>
  </div>
</body>
</html>`;

  return new Response(body, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
}

import { supabaseAdmin } from "../_shared/supabase.ts";
import { log } from "../_shared/logger.ts";

const SITE_URL = Deno.env.get("SITE_URL") ?? "https://cienduchgor.pl";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "Cień Ducha Gór <onboarding@resend.dev>";
const RESEND_KEY = Deno.env.get("RESEND_API_KEY");

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const action = url.searchParams.get("action");
  const token  = url.searchParams.get("token");

  if (!token || (action !== "confirm" && action !== "cancel")) {
    return html(
      "Nieprawidłowy link",
      "Brakuje wymaganych parametrów lub link jest niepoprawny.",
      "error",
    );
  }

  // --- Fetch booking by management token ---
  const { data: booking, error: fetchErr } = await supabaseAdmin
    .from("bookings")
    .select("id, status, guest_name, guest_email, check_in, check_out, guests_count, total_price")
    .eq("management_token", token)
    .single();

  if (fetchErr || !booking) {
    return html(
      "Nieznaleziono rezerwacji",
      "Link jest nieprawidłowy lub wygasł. Sprawdź skrzynkę odbiorczą ponownie.",
      "error",
    );
  }

  // --- Already processed ---
  if (booking.status !== "pending") {
    const labels: Record<string, string> = {
      confirmed: "potwierdzona ✓",
      cancelled: "anulowana",
      expired:   "wygasła",
    };
    const label = labels[booking.status] ?? booking.status;
    return html(
      "Rezerwacja już przetworzona",
      `Rezerwacja dla <strong>${booking.guest_name}</strong> 
       (${booking.check_in} → ${booking.check_out}) 
       jest już <strong>${label}</strong>.`,
      booking.status === "confirmed" ? "success" : "info",
    );
  }

  // --- Update status ---
  const newStatus = action === "confirm" ? "confirmed" : "cancelled";

  const { error: updateErr } = await supabaseAdmin
    .from("bookings")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", booking.id)
    .eq("status", "pending");

  if (updateErr) {
    await log("error", "manage-booking", `Update failed for ${booking.id}`, { error: String(updateErr) });
    return html("Błąd serwera", "Nie udało się zaktualizować rezerwacji. Spróbuj ponownie.", "error");
  }

  await log("info", "manage-booking", `Booking ${booking.id} → ${newStatus}`, {
    booking_id: booking.id,
    action,
  });

  // --- Send email to guest ---
  await sendGuestEmail(booking, newStatus);

  // --- Return branded HTML page ---
  if (action === "confirm") {
    return html(
      "Rezerwacja potwierdzona ✓",
      `Rezerwacja dla <strong>${booking.guest_name}</strong> 
       (${booking.check_in} → ${booking.check_out}, ${booking.guests_count} os.) 
       została <strong>potwierdzona</strong>.<br><br>
       Gość otrzymał e-mail z potwierdzeniem.`,
      "success",
    );
  } else {
    return html(
      "Rezerwacja anulowana",
      `Rezerwacja dla <strong>${booking.guest_name}</strong> 
       (${booking.check_in} → ${booking.check_out}) 
       została <strong>anulowana</strong>.<br><br>
       Gość otrzymał e-mail z informacją o anulowaniu.`,
      "info",
    );
  }
});

// ---- Email to guest ----

interface BookingRow {
  id: string;
  guest_name: string;
  guest_email: string;
  check_in: string;
  check_out: string;
  guests_count: number;
  total_price: number;
}

async function sendGuestEmail(booking: BookingRow, status: "confirmed" | "cancelled"): Promise<void> {
  if (!RESEND_KEY) {
    await log("warn", "manage-booking", "RESEND_API_KEY not set – guest email skipped");
    return;
  }

  const nights = Math.ceil(
    (new Date(booking.check_out).getTime() - new Date(booking.check_in).getTime()) / 86_400_000,
  );
  const nightsLabel = nights === 1 ? "noc" : nights < 5 ? "noce" : "nocy";

  const isConfirm = status === "confirmed";

  const subject = isConfirm
    ? `Rezerwacja potwierdzona – ${booking.check_in} → ${booking.check_out}`
    : `Informacja o rezerwacji – ${booking.check_in} → ${booking.check_out}`;

  const bodyHtml = isConfirm
    ? `
<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#FDFBF7;padding:40px;border-radius:12px;border:1px solid #D2B48C;">
  <h1 style="color:#3D352F;font-size:22px;margin:0 0 4px;">Twoja rezerwacja jest potwierdzona!</h1>
  <p style="color:#A68A64;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 24px;">Apartament Cień Ducha Gór · Szklarska Poręba</p>
  <hr style="border:none;border-top:1px solid #D2B48C;margin:0 0 24px;">
  <p style="color:#3D352F;font-size:15px;">Drogi/Droga <strong>${booking.guest_name}</strong>,</p>
  <p style="color:#3D352F;font-size:15px;line-height:1.7;">
    Z przyjemnością potwierdzamy Twoją rezerwację. Wkrótce prześlemy szczegóły dotyczące płatności.
  </p>
  <div style="background:#F5F0E8;border-radius:8px;padding:20px;margin:24px 0;">
    <p style="color:#A68A64;font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:bold;margin:0 0 12px;">Szczegóły rezerwacji</p>
    <p style="color:#3D352F;font-size:14px;margin:4px 0;"><strong>Przyjazd:</strong> ${booking.check_in} od 15:00</p>
    <p style="color:#3D352F;font-size:14px;margin:4px 0;"><strong>Wyjazd:</strong> ${booking.check_out} do 11:00</p>
    <p style="color:#3D352F;font-size:14px;margin:4px 0;"><strong>Liczba nocy:</strong> ${nights} ${nightsLabel}</p>
    <p style="color:#3D352F;font-size:14px;margin:4px 0;"><strong>Goście:</strong> ${booking.guests_count}</p>
    <p style="color:#A68A64;font-size:16px;font-weight:bold;margin:12px 0 0;"><strong>Kwota:</strong> ${booking.total_price} PLN</p>
  </div>
  <p style="color:#888;font-size:13px;line-height:1.6;">
    Adres: ul. Dworcowa, 58-580 Szklarska Poręba<br>
    Kaucja zwrotna: 500 PLN (pobierana przy zameldowaniu)
  </p>
  <hr style="border:none;border-top:1px solid #D2B48C;margin:24px 0;">
  <p style="color:#3D352F;font-size:14px;margin:0;">Do zobaczenia!</p>
  <p style="color:#A68A64;font-size:13px;font-style:italic;margin:4px 0 0;">Apartament Cień Ducha Gór</p>
</div>`
    : `
<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#FDFBF7;padding:40px;border-radius:12px;border:1px solid #D2B48C;">
  <h1 style="color:#3D352F;font-size:22px;margin:0 0 4px;">Informacja o Twoim zapytaniu</h1>
  <p style="color:#A68A64;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 24px;">Apartament Cień Ducha Gór · Szklarska Poręba</p>
  <hr style="border:none;border-top:1px solid #D2B48C;margin:0 0 24px;">
  <p style="color:#3D352F;font-size:15px;">Drogi/Droga <strong>${booking.guest_name}</strong>,</p>
  <p style="color:#3D352F;font-size:15px;line-height:1.7;">
    Niestety, wybrany termin <strong>${booking.check_in} → ${booking.check_out}</strong> 
    nie jest już dostępny. Przepraszamy za niedogodności.
  </p>
  <p style="color:#3D352F;font-size:15px;line-height:1.7;">
    Zapraszamy do sprawdzenia innych dostępnych terminów na naszej stronie.
  </p>
  <div style="text-align:center;margin:32px 0;">
    <a href="${SITE_URL}/#rezerwacja" 
       style="background:#3D352F;color:#FDFBF7;padding:14px 32px;border-radius:50px;text-decoration:none;font-size:14px;font-weight:bold;">
      Sprawdź dostępne terminy
    </a>
  </div>
  <hr style="border:none;border-top:1px solid #D2B48C;margin:24px 0;">
  <p style="color:#A68A64;font-size:13px;font-style:italic;margin:0;">Apartament Cień Ducha Gór</p>
</div>`;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [booking.guest_email],
      subject,
      html: bodyHtml,
    }),
  }).catch((e) => console.error("[manage-booking] guest email failed:", e));
}

// ---- HTML response page (shown in browser when owner clicks link) ----

function html(title: string, message: string, variant: "success" | "info" | "error"): Response {
  const colors = {
    success: { bg: "#F0FDF4", border: "#86EFAC", icon: "✓", iconBg: "#22C55E", iconColor: "#fff" },
    info:    { bg: "#FDFBF7", border: "#D2B48C", icon: "i", iconBg: "#A68A64", iconColor: "#fff" },
    error:   { bg: "#FFF5F5", border: "#FCA5A5", icon: "!", iconBg: "#EF4444", iconColor: "#fff" },
  }[variant];

  const body = `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} – Cień Ducha Gór</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Georgia, serif; background: #F5F0E8; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .card { background: ${colors.bg}; border: 1px solid ${colors.border}; border-radius: 16px; padding: 48px 40px; max-width: 520px; width: 100%; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.08); }
    .icon { width: 64px; height: 64px; background: ${colors.iconBg}; color: ${colors.iconColor}; border-radius: 50%; font-size: 28px; font-weight: bold; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
    .label { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #A68A64; margin-bottom: 8px; }
    h1 { font-size: 24px; color: #3D352F; margin-bottom: 16px; line-height: 1.3; }
    p { font-size: 15px; color: #3D352F; line-height: 1.7; }
    .back { display: inline-block; margin-top: 32px; padding: 12px 28px; background: #3D352F; color: #FDFBF7; border-radius: 50px; text-decoration: none; font-size: 13px; font-family: sans-serif; }
    .back:hover { background: #A68A64; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${colors.icon}</div>
    <div class="label">Apartament Cień Ducha Gór</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="${SITE_URL}" class="back">Wróć na stronę</a>
  </div>
</body>
</html>`;

  return new Response(body, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

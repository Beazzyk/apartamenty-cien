import Stripe from "stripe";
import { supabaseAdmin } from "../_shared/supabase.ts";
import { log } from "../_shared/logger.ts";

// ── Escape HTML — prevents XSS in email templates ────────────────────────────
function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!);

Deno.serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  const body = await req.text();

  // --- Verify Stripe signature ---
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!,
    );
  } catch (err) {
    await log("error", "webhook", "Signature verification failed", {
      error: String(err),
    });
    return new Response("Invalid signature", { status: 400 });
  }

  // --- Idempotency: check if event already processed ---
  const { data: existing } = await supabaseAdmin
    .from("webhook_events")
    .select("id")
    .eq("stripe_event_id", event.id)
    .maybeSingle();

  if (existing) {
    return jsonOk({ received: true, duplicate: true });
  }

  // --- Record event BEFORE processing (deduplication key) ---
  const bookingId =
    (event.data.object as Record<string, unknown>)?.metadata &&
    ((event.data.object as Record<string, unknown>).metadata as Record<string, string>)
      ?.booking_id;

  await supabaseAdmin.from("webhook_events").insert({
    stripe_event_id: event.id,
    event_type: event.type,
    booking_id: bookingId ?? null,
  });

  // --- Handle checkout.session.completed ---
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bId = session.metadata?.booking_id;

    if (!bId) {
      await log("error", "webhook", "No booking_id in session metadata", {
        session_id: session.id,
      });
      return jsonOk({ received: true, error: "no_booking_id" });
    }

    // Skip if already confirmed
    const { data: booking } = await supabaseAdmin
      .from("bookings")
      .select("status, guest_name, guest_email, check_in, check_out, guests_count, total_price")
      .eq("id", bId)
      .single();

    if (!booking) {
      await log("error", "webhook", `Booking not found: ${bId}`);
      return jsonOk({ received: true, error: "booking_not_found" });
    }

    if (booking.status === "confirmed") {
      return jsonOk({ received: true, already_confirmed: true });
    }

    // Confirm the booking
    const { error: updateErr } = await supabaseAdmin
      .from("bookings")
      .update({ status: "confirmed", updated_at: new Date().toISOString() })
      .eq("id", bId)
      .eq("status", "pending");

    if (updateErr) {
      await log("error", "webhook", `Failed to confirm booking ${bId}`, {
        error: String(updateErr),
      });
      return jsonOk({ received: true, error: "update_failed" });
    }

    await log("info", "webhook", `Booking confirmed: ${bId}`, {
      booking_id: bId,
      stripe_session_id: session.id,
    });

    // --- Send confirmation email (inline, Resend is fast <500ms) ---
    await sendConfirmationEmail({
      id: bId,
      guest_name: booking.guest_name,
      guest_email: booking.guest_email,
      check_in: booking.check_in,
      check_out: booking.check_out,
      guests_count: booking.guests_count,
      total_price: booking.total_price,
    });
  }

  // --- Handle checkout.session.expired ---
  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bId = session.metadata?.booking_id;

    if (bId) {
      await supabaseAdmin
        .from("bookings")
        .update({ status: "expired", updated_at: new Date().toISOString() })
        .eq("id", bId)
        .eq("status", "pending");

      await log("info", "webhook", `Checkout expired, booking expired: ${bId}`);
    }
  }

  return jsonOk({ received: true });
});

// ----- Helpers -----

function jsonOk(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

interface BookingInfo {
  id: string;
  guest_name: string;
  guest_email: string;
  check_in: string;
  check_out: string;
  guests_count: number;
  total_price: number;
}

async function sendConfirmationEmail(booking: BookingInfo): Promise<void> {
  const resendKey = Deno.env.get("RESEND_API_KEY");
  const ownerEmail = Deno.env.get("OWNER_EMAIL");

  if (!resendKey) {
    await log("warn", "webhook", "RESEND_API_KEY not configured, skipping email");
    return;
  }

  const nights = Math.ceil(
    (new Date(booking.check_out).getTime() -
      new Date(booking.check_in).getTime()) /
      86_400_000,
  );

  // Escape all user-supplied fields before HTML insertion (H-4)
  const safeName   = esc(booking.guest_name);
  const safeIn     = esc(booking.check_in);
  const safeOut    = esc(booking.check_out);
  const safeGuests = esc(booking.guests_count);
  const safePrice  = esc(booking.total_price);
  const safeNights = esc(nights);
  const safeId     = esc(booking.id);

  const guestHtml = `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #FDFBF7; padding: 40px; border-radius: 12px;">
      <h1 style="font-family: 'Playfair Display', serif; color: #3D352F; margin-bottom: 8px;">Potwierdzenie rezerwacji</h1>
      <p style="color: #A68A64; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Apartament Cień Ducha Gór</p>
      <hr style="border: none; border-top: 1px solid #D2B48C; margin: 24px 0;">
      <p style="color: #3D352F;">Drogi/Droga <strong>${safeName}</strong>,</p>
      <p style="color: #3D352F;">Twoja rezerwacja została potwierdzona! Oto szczegóły:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr><td style="padding: 8px 0; color: #666;">Data przyjazdu</td><td style="padding: 8px 0; font-weight: 600; color: #3D352F;">${safeIn}</td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Data wyjazdu</td><td style="padding: 8px 0; font-weight: 600; color: #3D352F;">${safeOut}</td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Liczba nocy</td><td style="padding: 8px 0; font-weight: 600; color: #3D352F;">${safeNights}</td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Goście</td><td style="padding: 8px 0; font-weight: 600; color: #3D352F;">${safeGuests}</td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Kwota</td><td style="padding: 8px 0; font-weight: 600; color: #A68A64; font-size: 18px;">${safePrice} PLN</td></tr>
      </table>
      <hr style="border: none; border-top: 1px solid #D2B48C; margin: 24px 0;">
      <p style="color: #666; font-size: 13px;">Doba hotelowa: zameldowanie od 14:00, wymeldowanie do 12:00.</p>
      <p style="color: #3D352F;">Do zobaczenia w Szklarskiej Porębie!</p>
    </div>
  `;

  try {
    // Email to guest
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Cień Ducha Gór <rezerwacje@resend.dev>",
        to: [booking.guest_email],
        subject: `Potwierdzenie rezerwacji – ${booking.check_in} → ${booking.check_out}`,
        html: guestHtml,
      }),
    });

    // Email to owner
    if (ownerEmail) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "System rezerwacji <rezerwacje@resend.dev>",
          to: [ownerEmail],
          subject: `Nowa rezerwacja: ${booking.guest_name} | ${booking.check_in} → ${booking.check_out}`,
          html: `<p>Nowa potwierdzona rezerwacja:</p>
            <ul>
              <li><strong>Gość:</strong> ${safeName} (${esc(booking.guest_email)})</li>
              <li><strong>Termin:</strong> ${safeIn} – ${safeOut} (${safeNights} nocy)</li>
              <li><strong>Goście:</strong> ${safeGuests}</li>
              <li><strong>Kwota:</strong> ${safePrice} PLN</li>
              <li><strong>ID:</strong> ${safeId}</li>
            </ul>`,
        }),
      });
    }

    await log("info", "email", `Confirmation sent for booking ${booking.id}`);
  } catch (err) {
    await log("error", "email", `Email send failed for ${booking.id}`, {
      error: String(err),
    });
  }
}

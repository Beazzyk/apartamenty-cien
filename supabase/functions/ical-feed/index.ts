import { supabaseAdmin } from "../_shared/supabase.ts";
import { log } from "../_shared/logger.ts";

Deno.serve(async () => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    // Bez PII: kalendarz synchronizowany z zewnętrznymi usługami nie może ujawniać imion gości.
    const { data: bookings, error } = await supabaseAdmin
      .from("bookings")
      .select("id, check_in, check_out, status")
      .in("status", ["pending", "confirmed"])
      .gte("check_out", today)
      .order("check_in", { ascending: true });

    if (error) throw error;

    const ical = generateICal(bookings ?? []);

    return new Response(ical, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": 'attachment; filename="cienduchgor.ics"',
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    await log("error", "ical-feed", `iCal export failed: ${error.message}`);
    console.error("[ical-feed]", error);
    return new Response("Internal Server Error", { status: 500 });
  }
});

interface Booking {
  id: string;
  check_in: string;
  check_out: string;
  status: "pending" | "confirmed";
}

/** RFC 5545 TEXT escaping for SUMMARY / DESCRIPTION. */
function icalEsc(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/** RFC 5545 UTC date-time for DTSTAMP (must end with exactly one Z — double Z breaks Airbnb parsers). */
function utcDtStamp(): string {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function generateICal(bookings: Booking[]): string {
  const dtStamp = utcDtStamp();

  // All-day events: DTSTART/DTEND use VALUE=DATE only (no TZID). CALSCALE early — some OTA importers expect it.
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "PRODID:-//CienDuchaGor//Booking//PL",
    "X-WR-CALNAME:Apartament Cień Ducha Gór",
  ];

  for (const b of bookings) {
    const dtstart = b.check_in.replace(/-/g, "");
    const dtend = b.check_out.replace(/-/g, "");

    const isPending = b.status === "pending";

    // pending   → STATUS:TENTATIVE  (Google Calendar shows hatched/striped pattern)
    // confirmed → STATUS:CONFIRMED  (normal solid event)
    const icalStatus = isPending ? "TENTATIVE" : "CONFIRMED";
    const summary = isPending
      ? "⏳ Apartament · termin zajęty (oczekuje na potwierdzenie)"
      : "✓ Apartament · rezerwacja potwierdzona";
    const description = isPending
      ? "Zapytanie bezpośrednie – szczegóły tylko w panelu rezerwacji."
      : "Rezerwacja potwierdzona – szczegóły tylko w panelu rezerwacji.";

    lines.push(
      "BEGIN:VEVENT",
      `DTSTAMP:${dtStamp}`,
      `UID:${b.id}@cienduchgor`,
      `DTSTART;VALUE=DATE:${dtstart}`,
      `DTEND;VALUE=DATE:${dtend}`,
      `SUMMARY:${icalEsc(summary)}`,
      `DESCRIPTION:${icalEsc(description)}`,
      `STATUS:${icalStatus}`,
      `TRANSP:OPAQUE`,
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

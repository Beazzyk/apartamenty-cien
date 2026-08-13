import { addDaysStr, normalizeDateOnly } from "./date.ts";

export interface ICalEvent {
  dtstart: string;
  dtend: string;
  summary: string;
}

export function parseICalEvents(icalText: string): ICalEvent[] {
  const events: ICalEvent[] = [];
  const blocks = icalText.split("BEGIN:VEVENT");

  for (const block of blocks.slice(1)) {
    const endBlock = block.split("END:VEVENT")[0];

    const dtstart = endBlock.match(/DTSTART[^:]*:(\d{8})/)?.[1];
    const dtend = endBlock.match(/DTEND[^:]*:(\d{8})/)?.[1];
    const summary =
      endBlock.match(/SUMMARY[^:]*:(.*)/)?.[1]?.trim() ?? "Blocked";

    if (dtstart && dtend) {
      events.push({
        dtstart: formatICalDate(dtstart),
        dtend: formatICalDate(dtend),
        summary,
      });
    }
  }

  return events;
}

function formatICalDate(raw: string): string {
  return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
}

/**
 * Every day a stay makes unavailable: all its nights *plus* the check-out day.
 * The guest leaves in the morning but cleaning and turnaround take the rest of
 * that day, so the next arrival can only be the day after check-out.
 *
 * `checkOut` here is the iCal DTEND / booking `check_out` — i.e. the exclusive
 * end of the nights. This returns `[checkIn, checkOut]` inclusive.
 */
export function expandStayRange(checkIn: string, checkOut: string): string[] {
  return expandDateRange(checkIn, addDaysStr(checkOut, 1));
}

/** Expand a [start, end) date range into individual YYYY-MM-DD strings. */
export function expandDateRange(start: string, end: string): string[] {
  const s = normalizeDateOnly(start);
  const e = normalizeDateOnly(end);
  const dates: string[] = [];
  const cursor = new Date(s + "T00:00:00Z");
  const endDate = new Date(e + "T00:00:00Z");

  while (cursor < endDate) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return dates;
}

/** Filter dates to those within [rangeStart, rangeEnd] inclusive. */
export function filterDatesInRange(
  dates: string[],
  rangeStart: string,
  rangeEnd: string,
): string[] {
  return dates.filter((d) => d >= rangeStart && d <= rangeEnd);
}

/** Fetch and parse iCal with a timeout. Returns empty array on failure. */
export async function fetchICalDates(
  url: string,
  rangeStart: string,
  rangeEnd: string,
  timeoutMs = 3000,
): Promise<string[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    const text = await res.text();
    const events = parseICalEvents(text);
    const allDates: string[] = [];

    for (const ev of events) {
      allDates.push(...expandStayRange(ev.dtstart, ev.dtend));
    }

    return filterDatesInRange(
      allDates,
      normalizeDateOnly(rangeStart),
      normalizeDateOnly(rangeEnd),
    );
  } catch {
    clearTimeout(timer);
    return [];
  }
}

export interface FeedBooking {
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

/** RFC 5545 UTC form `YYYYMMDDTHHMMSSZ` — always exactly one trailing Z (some stacks produced `ZZ`). */
function utcDtStamp(): string {
  const compact = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
  return `${compact.replace(/Z+$/i, "")}Z`;
}

/** Generate the VCALENDAR we publish for Booking.com / Airbnb to subscribe to. */
export function generateICal(bookings: FeedBooking[]): string {
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
    const dtstart = normalizeDateOnly(b.check_in).replace(/-/g, "");
    // DTEND is exclusive, so push it one day past check-out: partners importing
    // this feed must hold the cleaning day too, not just the nights.
    const dtend = addDaysStr(b.check_out, 1).replace(/-/g, "");

    const isPending = b.status === "pending";

    // pending   → STATUS:TENTATIVE  (Google Calendar shows hatched/striped pattern)
    // confirmed → STATUS:CONFIRMED  (normal solid event)
    const icalStatus = isPending ? "TENTATIVE" : "CONFIRMED";
    // Bez emoji i „długiego” myślnika — importery OTA bywają kapryśne; UTF-8 (ąęł…) jest OK.
    const summary = isPending
      ? "Apartament - termin zajęty (oczekuje na potwierdzenie)"
      : "Apartament - rezerwacja potwierdzona";
    const description = isPending
      ? "Zapytanie bezpośrednie - szczegóły tylko w panelu rezerwacji."
      : "Rezerwacja potwierdzona - szczegóły tylko w panelu rezerwacji.";

    lines.push(
      "BEGIN:VEVENT",
      `DTSTAMP:${dtStamp}`,
      `UID:${b.id}@cienduchgor`,
      `SEQUENCE:0`,
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
  return `${lines.join("\r\n")}\r\n`;
}

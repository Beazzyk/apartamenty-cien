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

/** Expand a [start, end) date range into individual YYYY-MM-DD strings. */
export function expandDateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const cursor = new Date(start + "T00:00:00Z");
  const endDate = new Date(end + "T00:00:00Z");

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
      allDates.push(...expandDateRange(ev.dtstart, ev.dtend));
    }

    return filterDatesInRange(allDates, rangeStart, rangeEnd);
  } catch {
    clearTimeout(timer);
    return [];
  }
}

/** Generate a VCALENDAR string from a list of booked date ranges. */
export function generateICal(
  bookings: Array<{ id: string; check_in: string; check_out: string }>,
  calendarName = "Apartament Cień Ducha Gór",
): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CienDuchaGor//Booking//PL",
    `X-WR-CALNAME:${calendarName}`,
  ];

  for (const b of bookings) {
    const dtstart = b.check_in.replace(/-/g, "");
    const dtend = b.check_out.replace(/-/g, "");
    lines.push(
      "BEGIN:VEVENT",
      `DTSTART;VALUE=DATE:${dtstart}`,
      `DTEND;VALUE=DATE:${dtend}`,
      `UID:${b.id}@cienduchgor`,
      `SUMMARY:Rezerwacja bezpośrednia`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

/**
 * Pure occupancy logic shared by check-availability.
 *
 * Kept free of Deno/Supabase imports so it can be unit-tested directly.
 *
 * Date semantics (must match `create-booking`): a stay occupies
 * `[check_in, check_out]` inclusive — every night, plus the check-out day
 * itself, which goes to cleaning and turnaround. The next guest can only
 * arrive the day after check-out. See `expandStayRange`.
 */
import { expandStayRange } from "./ical-parser.ts";
import type { SeasonPricing } from "./pricing.ts";
import { getPriceTierForNight, type Season } from "./seasons.ts";

export { addDaysStr } from "./date.ts";

export interface BookingRange {
  check_in: string;
  check_out: string;
}

export interface OccupancyInput {
  /** Bookings with status 'pending'. */
  pending: BookingRange[];
  /** Bookings with status 'confirmed'. */
  confirmed: BookingRange[];
  /** Dates from the `blocked_dates` table. */
  blocked: string[];
  /** Dates from freshly fetched external iCal feeds. */
  ical: string[];
  /** Inclusive lower bound of the padded window. */
  from: string;
  /** Inclusive upper bound of the padded window. */
  to: string;
}

export interface OccupancySets {
  pending: Set<string>;
  confirmed: Set<string>;
  blocked: Set<string>;
}

/** Normalize a DB date (YYYY-MM-DD or ISO string) to YYYY-MM-DD. */
export function toDateOnly(s: string | null | undefined): string {
  if (!s || typeof s !== "string") return "";
  const i = s.indexOf("T");
  return i >= 0 ? s.slice(0, i) : s;
}

function minNightsForTier(tier: Season, pricing: SeasonPricing): number {
  switch (tier) {
    case "holiday":
      return pricing.min_nights_holiday;
    case "peak":
      return pricing.min_nights_peak;
    default:
      return pricing.min_nights_offseason;
  }
}

/**
 * A free gap fully sandwiched between two occupied stretches that's shorter
 * than the min-stay for its season can never actually be filled by a guest.
 *
 * These days stay *free*, though — the host wants to see them on the calendar
 * (they're the windows for maintenance, cleaning, their own use), so
 * check-availability reports them in their own `unbookable_gap_dates` field
 * rather than folding them into `blocked_dates`. The calendar keeps painting
 * them green; only the booking form refuses to submit a stay landing there,
 * on the season's min-nights rule.
 *
 * Only gaps fully bounded by occupied days *within* `allDates` are judged —
 * gaps touching either edge are left alone since we can't see far enough
 * past the edge to know they're actually enclosed.
 */
export function findUnbookableGapDates(
  allDates: string[],
  occupied: Set<string>,
  pricing: SeasonPricing,
): Set<string> {
  const result = new Set<string>();
  let i = 0;
  while (i < allDates.length) {
    if (occupied.has(allDates[i])) {
      i++;
      continue;
    }
    let j = i;
    while (j < allDates.length && !occupied.has(allDates[j])) j++;
    const runEnd = j - 1;
    const isEnclosed = i > 0 && runEnd < allDates.length - 1;
    if (isEnclosed) {
      const runLength = runEnd - i + 1;
      // A stay filling the run arrives on its first day and checks out on its
      // last (which goes to cleaning), so it's one night shorter than the run.
      const bookableNights = runLength - 1;
      const tier = getPriceTierForNight(allDates[i]);
      const minNights = minNightsForTier(tier, pricing);
      if (bookableNights < minNights) {
        for (let k = i; k <= runEnd; k++) result.add(allDates[k]);
      }
    }
    i = j;
  }
  return result;
}

/**
 * Turn raw booking rows and blocked-date lists into per-status date sets,
 * clipped to `[from, to]`. Confirmed wins over pending on overlap.
 */
export function buildOccupancySets(input: OccupancyInput): OccupancySets {
  const { from, to } = input;
  const inWindow = (d: string) => d >= from && d <= to;

  const pending = new Set<string>();
  const confirmed = new Set<string>();
  const blocked = new Set<string>();

  for (const b of input.pending) {
    const ci = toDateOnly(b.check_in);
    const co = toDateOnly(b.check_out);
    if (!ci || !co) continue;
    for (const d of expandStayRange(ci, co)) {
      if (inWindow(d)) pending.add(d);
    }
  }

  for (const b of input.confirmed) {
    const ci = toDateOnly(b.check_in);
    const co = toDateOnly(b.check_out);
    if (!ci || !co) continue;
    for (const d of expandStayRange(ci, co)) {
      if (inWindow(d)) {
        confirmed.add(d);
        pending.delete(d); // confirmed takes priority
      }
    }
  }

  for (const d of input.blocked) {
    const n = toDateOnly(d);
    if (n) blocked.add(n);
  }

  for (const d of input.ical) {
    blocked.add(d);
  }

  return { pending, confirmed, blocked };
}

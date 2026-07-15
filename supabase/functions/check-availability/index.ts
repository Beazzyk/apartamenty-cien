import { supabaseAdmin } from "../_shared/supabase.ts";
import {
  corsResponse,
  jsonResponse,
  errorResponse,
} from "../_shared/cors.ts";
import { normalizeDateOnly } from "../_shared/date.ts";
import { expandDateRange } from "../_shared/ical-parser.ts";
import { fetchMergedExternalIcalDates } from "../_shared/external-ical.ts";
import { fetchPricingFromDb, type SeasonPricing } from "../_shared/pricing.ts";
import { getPriceTierForNight, type Season } from "../_shared/seasons.ts";

/** Normalize DB date (YYYY-MM-DD or ISO string) to YYYY-MM-DD for consistent API response. */
function toDateOnly(s: string | null | undefined): string {
  if (!s || typeof s !== "string") return "";
  const i = s.indexOf("T");
  return i >= 0 ? s.slice(0, i) : s;
}

function addDaysStr(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
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
 * than the min-stay for its season can never actually be booked by anyone —
 * showing it as plain "available" is misleading and (aesthetically) leaves
 * odd single free-looking days next to solid booked blocks. Mark those days
 * as unavailable too, same as the response's `blocked_dates`.
 *
 * Only gaps fully bounded by occupied days *within* `allDates` are judged —
 * gaps touching either edge are left alone since we can't see far enough
 * past the edge to know they're actually enclosed.
 */
function findUnbookableGapDates(
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
      const tier = getPriceTierForNight(allDates[i]);
      const minNights = minNightsForTier(tier, pricing);
      if (runLength < minNights) {
        for (let k = i; k <= runEnd; k++) result.add(allDates[k]);
      }
    }
    i = j;
  }
  return result;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse(req);

  try {
    const url = new URL(req.url);
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");

    if (!from || !to) {
      return errorResponse("Parameters 'from' and 'to' required (YYYY-MM-DD)", req, 400);
    }

    const fromN = normalizeDateOnly(from);
    const toN = normalizeDateOnly(to);

    // Padded beyond [fromN, toN] so we can tell whether a free run right at
    // the edge of the requested range is actually enclosed by bookings just
    // outside it (needed to judge unbookably-short gaps below).
    const PADDING_DAYS = 6;
    const extFrom = addDaysStr(fromN, -PADDING_DAYS);
    const extTo = addDaysStr(toN, PADDING_DAYS);

    // Run DB queries, pricing, and fresh iCal fetch concurrently
    const [pendingResult, confirmedResult, blockedResult, icalDates, pricing] =
      await Promise.all([
        supabaseAdmin
          .from("bookings")
          .select("check_in, check_out")
          .eq("status", "pending")
          .lte("check_in", extTo)
          .gte("check_out", extFrom),

        supabaseAdmin
          .from("bookings")
          .select("check_in, check_out")
          .eq("status", "confirmed")
          .lte("check_in", extTo)
          .gte("check_out", extFrom),

        supabaseAdmin
          .from("blocked_dates")
          .select("date")
          .gte("date", extFrom)
          .lte("date", extTo),

        fetchMergedExternalIcalDates(supabaseAdmin, extFrom, extTo, 3000),

        fetchPricingFromDb(supabaseAdmin),
      ]);

    const extPendingSet   = new Set<string>();
    const extConfirmedSet = new Set<string>();
    const extBlockedSet   = new Set<string>();

    for (const b of pendingResult.data ?? []) {
      const ci = toDateOnly(b.check_in);
      const co = toDateOnly(b.check_out);
      if (!ci || !co) continue;
      for (const d of expandDateRange(ci, co)) {
        if (d >= extFrom && d <= extTo) extPendingSet.add(d);
      }
      if (co >= extFrom && co <= extTo) extPendingSet.add(co);
    }

    for (const b of confirmedResult.data ?? []) {
      const ci = toDateOnly(b.check_in);
      const co = toDateOnly(b.check_out);
      if (!ci || !co) continue;
      for (const d of expandDateRange(ci, co)) {
        if (d >= extFrom && d <= extTo) {
          extConfirmedSet.add(d);
          extPendingSet.delete(d); // confirmed takes priority
        }
      }
      if (co >= extFrom && co <= extTo) {
        extConfirmedSet.add(co);
        extPendingSet.delete(co);
      }
    }

    for (const b of blockedResult.data ?? []) {
      const d = toDateOnly(b.date);
      if (d) extBlockedSet.add(d);
    }

    for (const d of icalDates) {
      extBlockedSet.add(d);
    }

    const occupied = new Set<string>([
      ...extPendingSet,
      ...extConfirmedSet,
      ...extBlockedSet,
    ]);
    const allExtDates = expandDateRange(extFrom, addDaysStr(extTo, 1));
    const gapBlocked = findUnbookableGapDates(allExtDates, occupied, pricing);

    const inRange = (d: string) => d >= fromN && d <= toN;
    const pendingSet   = new Set([...extPendingSet].filter(inRange));
    const confirmedSet = new Set([...extConfirmedSet].filter(inRange));
    const blockedSet   = new Set(
      [...extBlockedSet, ...gapBlocked].filter(inRange),
    );

    return jsonResponse({
      pending_dates:   [...pendingSet].sort(),
      confirmed_dates: [...confirmedSet].sort(),
      blocked_dates:   [...blockedSet].sort(),
      price_per_night: pricing.price_per_night_offseason,
      pricing,
    }, req);
  } catch (error) {
    console.error("[check-availability]", error);
    return errorResponse("Internal server error", req, 500);
  }
});


import { supabaseAdmin } from "../_shared/supabase.ts";
import {
  corsResponse,
  jsonResponse,
  errorResponse,
} from "../_shared/cors.ts";
import { normalizeDateOnly } from "../_shared/date.ts";
import { expandDateRange } from "../_shared/ical-parser.ts";
import { fetchMergedExternalIcalDates } from "../_shared/external-ical.ts";
import { fetchPricingFromDb } from "../_shared/pricing.ts";
import {
  addDaysStr,
  buildOccupancySets,
  findUnbookableGapDates,
} from "../_shared/availability.ts";

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

    const {
      pending: extPendingSet,
      confirmed: extConfirmedSet,
      blocked: extBlockedSet,
    } = buildOccupancySets({
      pending: pendingResult.data ?? [],
      confirmed: confirmedResult.data ?? [],
      blocked: (blockedResult.data ?? []).map((b) => b.date),
      ical: icalDates,
      from: extFrom,
      to: extTo,
    });

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

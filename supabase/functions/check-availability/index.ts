import { supabaseAdmin } from "../_shared/supabase.ts";
import {
  corsResponse,
  jsonResponse,
  errorResponse,
} from "../_shared/cors.ts";
import { fetchICalDates, expandDateRange } from "../_shared/ical-parser.ts";

/** Normalize DB date (YYYY-MM-DD or ISO string) to YYYY-MM-DD for consistent API response. */
function toDateOnly(s: string | null | undefined): string {
  if (!s || typeof s !== "string") return "";
  const i = s.indexOf("T");
  return i >= 0 ? s.slice(0, i) : s;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse();

  try {
    const url = new URL(req.url);
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");

    if (!from || !to) {
      return errorResponse("Parameters 'from' and 'to' required (YYYY-MM-DD)", 400);
    }

    // Run DB queries and fresh iCal fetch concurrently
    const [pendingResult, confirmedResult, blockedResult, icalDates, priceResult] =
      await Promise.all([
        supabaseAdmin
          .from("bookings")
          .select("check_in, check_out")
          .eq("status", "pending")
          .lte("check_in", to)
          .gte("check_out", from),

        supabaseAdmin
          .from("bookings")
          .select("check_in, check_out")
          .eq("status", "confirmed")
          .lte("check_in", to)
          .gte("check_out", from),

        supabaseAdmin
          .from("blocked_dates")
          .select("date")
          .gte("date", from)
          .lte("date", to),

        fetchICalFromSettings(from, to),

        supabaseAdmin
          .from("settings")
          .select("value")
          .eq("key", "price_per_night")
          .single(),
      ]);

    const pendingSet   = new Set<string>();
    const confirmedSet = new Set<string>();
    const blockedSet   = new Set<string>();

    for (const b of pendingResult.data ?? []) {
      const ci = toDateOnly(b.check_in);
      const co = toDateOnly(b.check_out);
      if (!ci || !co) continue;
      for (const d of expandDateRange(ci, co)) {
        if (d >= from && d <= to) pendingSet.add(d);
      }
      if (co >= from && co <= to) pendingSet.add(co);
    }

    for (const b of confirmedResult.data ?? []) {
      const ci = toDateOnly(b.check_in);
      const co = toDateOnly(b.check_out);
      if (!ci || !co) continue;
      for (const d of expandDateRange(ci, co)) {
        if (d >= from && d <= to) {
          confirmedSet.add(d);
          pendingSet.delete(d); // confirmed takes priority
        }
      }
      if (co >= from && co <= to) {
        confirmedSet.add(co);
        pendingSet.delete(co);
      }
    }

    for (const b of blockedResult.data ?? []) {
      const d = toDateOnly(b.date);
      if (d) blockedSet.add(d);
    }

    for (const d of icalDates) {
      blockedSet.add(d);
    }

    return jsonResponse({
      pending_dates:   [...pendingSet].sort(),
      confirmed_dates: [...confirmedSet].sort(),
      blocked_dates:   [...blockedSet].sort(),
      price_per_night: parseInt(priceResult.data?.value ?? "450"),
    });
  } catch (error) {
    console.error("[check-availability]", error);
    return errorResponse("Internal server error");
  }
});

async function fetchICalFromSettings(
  from: string,
  to: string,
): Promise<string[]> {
  try {
    const { data } = await supabaseAdmin
      .from("settings")
      .select("value")
      .eq("key", "booking_ical_url")
      .single();

    if (!data?.value) return [];
    return await fetchICalDates(data.value, from, to, 3000);
  } catch {
    return [];
  }
}

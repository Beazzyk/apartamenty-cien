import { supabaseAdmin } from "../_shared/supabase.ts";
import {
  corsResponse,
  jsonResponse,
  errorResponse,
} from "../_shared/cors.ts";
import { fetchICalDates, expandDateRange } from "../_shared/ical-parser.ts";

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
    const [bookingsResult, blockedResult, icalDates, priceResult] =
      await Promise.all([
        supabaseAdmin
          .from("bookings")
          .select("check_in, check_out")
          .in("status", ["pending", "confirmed"])
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

    const unavailable = new Set<string>();

    for (const b of bookingsResult.data ?? []) {
      for (const d of expandDateRange(b.check_in, b.check_out)) {
        if (d >= from && d <= to) unavailable.add(d);
      }
    }

    for (const b of blockedResult.data ?? []) {
      unavailable.add(b.date);
    }

    for (const d of icalDates) {
      unavailable.add(d);
    }

    return jsonResponse({
      unavailable_dates: [...unavailable].sort(),
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

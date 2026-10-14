import { supabaseAdmin } from "../_shared/supabase.ts";
import { log } from "../_shared/logger.ts";
import { generateICal, TURNOVER_SUMMARY } from "../_shared/ical-parser.ts";

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

    // Booking.com sells its own check-out days; send them back closed for cleaning.
    // Read from the cron-synced table so a failed fetch never reopens those days.
    const { data: cleaning, error: cleaningError } = await supabaseAdmin
      .from("blocked_dates")
      .select("date")
      .eq("source", "booking_import")
      .eq("summary", TURNOVER_SUMMARY)
      .gte("date", today)
      .order("date", { ascending: true });

    if (cleaningError) throw cleaningError;

    const ical = generateICal(bookings ?? [], (cleaning ?? []).map((r) => r.date));

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

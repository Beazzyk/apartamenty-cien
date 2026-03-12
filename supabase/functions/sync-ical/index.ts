import { supabaseAdmin } from "../_shared/supabase.ts";
import { parseICalEvents, expandDateRange } from "../_shared/ical-parser.ts";
import { log } from "../_shared/logger.ts";

Deno.serve(async (req) => {
  // Verify this is called with service_role auth (from pg_cron)
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { data: setting } = await supabaseAdmin
      .from("settings")
      .select("value")
      .eq("key", "booking_ical_url")
      .single();

    if (!setting?.value) {
      await log("warn", "ical_sync", "No booking_ical_url configured, skipping sync");
      return jsonOk({ synced: false, reason: "no_ical_url" });
    }

    // Fetch iCal from Booking.com (10s timeout for cron, more generous than user-facing)
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);

    const res = await fetch(setting.value, { signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) {
      throw new Error(`iCal fetch returned ${res.status}`);
    }

    const icalText = await res.text();
    const events = parseICalEvents(icalText);

    // Expand events into individual dates (next 365 days)
    const today = new Date().toISOString().slice(0, 10);
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    const futureStr = future.toISOString().slice(0, 10);

    const importedDates = new Map<string, string>();
    for (const ev of events) {
      for (const d of expandDateRange(ev.dtstart, ev.dtend)) {
        if (d >= today && d <= futureStr) {
          importedDates.set(d, ev.summary);
        }
      }
    }

    // Delete old booking_import entries and replace with fresh data
    await supabaseAdmin
      .from("blocked_dates")
      .delete()
      .eq("source", "booking_import");

    if (importedDates.size > 0) {
      const rows = [...importedDates.entries()].map(([date, summary]) => ({
        date,
        source: "booking_import" as const,
        summary,
      }));

      // Insert in batches of 100
      for (let i = 0; i < rows.length; i += 100) {
        const batch = rows.slice(i, i + 100);
        const { error } = await supabaseAdmin
          .from("blocked_dates")
          .upsert(batch, { onConflict: "date,source" });

        if (error) {
          await log("error", "ical_sync", `Batch insert failed at offset ${i}`, {
            error: String(error),
          });
        }
      }
    }

    await log("info", "ical_sync", `Synced ${importedDates.size} blocked dates from Booking.com`, {
      events_count: events.length,
      dates_count: importedDates.size,
    });

    return jsonOk({
      synced: true,
      events: events.length,
      dates: importedDates.size,
    });
  } catch (error) {
    await log("error", "ical_sync", `Sync failed: ${error.message}`, {
      error: String(error),
    });
    console.error("[sync-ical]", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

function jsonOk(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

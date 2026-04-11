import { supabaseAdmin } from "../_shared/supabase.ts";
import { parseICalEvents, expandDateRange } from "../_shared/ical-parser.ts";
import { log } from "../_shared/logger.ts";

const FEEDS = [
  { settingKey: "booking_ical_url", source: "booking_import" as const },
  { settingKey: "airbnb_ical_url", source: "airbnb_import" as const },
];

Deno.serve(async (req) => {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const keys = FEEDS.map((f) => f.settingKey);
    const { data: settings } = await supabaseAdmin
      .from("settings")
      .select("key, value")
      .in("key", keys);

    const byKey = new Map((settings ?? []).map((s) => [s.key, s.value as string]));

    const results: Record<string, { synced: boolean; dates?: number; events?: number; error?: string }> =
      {};
    let anyUrlConfigured = false;

    for (const { settingKey, source } of FEEDS) {
      const url = byKey.get(settingKey)?.trim();
      if (!url) {
        await supabaseAdmin.from("blocked_dates").delete().eq("source", source);
        results[settingKey] = { synced: false };
        continue;
      }

      anyUrlConfigured = true;

      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 10_000);
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timer);

        if (!res.ok) {
          throw new Error(`iCal fetch returned ${res.status}`);
        }

        const icalText = await res.text();
        const events = parseICalEvents(icalText);

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

        await supabaseAdmin.from("blocked_dates").delete().eq("source", source);

        if (importedDates.size > 0) {
          const rows = [...importedDates.entries()].map(([date, summary]) => ({
            date,
            source,
            summary,
          }));

          for (let i = 0; i < rows.length; i += 100) {
            const batch = rows.slice(i, i + 100);
            const { error } = await supabaseAdmin
              .from("blocked_dates")
              .upsert(batch, { onConflict: "date,source" });

            if (error) {
              await log("error", "ical_sync", `Batch insert failed at offset ${i}`, {
                source,
                error: String(error),
              });
            }
          }
        }

        await log("info", "ical_sync", `Synced ${importedDates.size} blocked dates`, {
          source,
          events_count: events.length,
          dates_count: importedDates.size,
        });

        results[settingKey] = {
          synced: true,
          events: events.length,
          dates: importedDates.size,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await log("error", "ical_sync", `Sync failed for ${settingKey}: ${message}`, {
          source,
        });
        console.error("[sync-ical]", settingKey, error);
        results[settingKey] = { synced: false, error: message };
      }
    }

    if (!anyUrlConfigured) {
      await log("warn", "ical_sync", "No external iCal URLs configured, skipping sync");
      return jsonOk({ synced: false, reason: "no_ical_url", feeds: results });
    }

    return jsonOk({ synced: true, feeds: results });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await log("error", "ical_sync", `Sync failed: ${message}`, {
      error: String(error),
    });
    console.error("[sync-ical]", error);
    return new Response(JSON.stringify({ error: message }), {
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

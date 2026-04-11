import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchICalDates } from "./ical-parser.ts";

/** Settings keys for subscribed external calendars (Booking.com, Airbnb). */
export const EXTERNAL_ICAL_SETTING_KEYS = [
  "booking_ical_url",
  "airbnb_ical_url",
] as const;

export type ExternalIcalSettingKey = (typeof EXTERNAL_ICAL_SETTING_KEYS)[number];

/** Merge blocked nights from all configured external iCal feeds. */
export async function fetchMergedExternalIcalDates(
  client: SupabaseClient,
  from: string,
  to: string,
  timeoutMs: number,
): Promise<string[]> {
  try {
    const { data } = await client
      .from("settings")
      .select("value")
      .in("key", [...EXTERNAL_ICAL_SETTING_KEYS]);

    const urls = (data ?? [])
      .map((row) => (row as { value: string }).value?.trim())
      .filter((v): v is string => Boolean(v));

    const merged = new Set<string>();
    await Promise.all(
      urls.map(async (url) => {
        const dates = await fetchICalDates(url, from, to, timeoutMs);
        for (const d of dates) merged.add(d);
      }),
    );
    return [...merged];
  } catch {
    return [];
  }
}

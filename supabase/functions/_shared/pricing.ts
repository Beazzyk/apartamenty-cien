import type { SupabaseClient } from "@supabase/supabase-js";

/** Seasonal rates + min nights — mirror of `public.settings` keys. */
export interface SeasonPricing {
  price_per_night_offseason: number;
  price_per_night_peak: number;
  price_per_night_holiday: number;
  min_nights_offseason: number;
  min_nights_peak: number;
  min_nights_holiday: number;
}

export const DEFAULT_SEASON_PRICING: SeasonPricing = {
  price_per_night_offseason: 350,
  price_per_night_peak: 490,
  price_per_night_holiday: 890,
  min_nights_offseason: 3,
  min_nights_peak: 4,
  min_nights_holiday: 5,
};

const SETTINGS_KEYS = [
  "price_per_night_offseason",
  "price_per_night_peak",
  "price_per_night_holiday",
  "min_nights_offseason",
  "min_nights_peak",
  "min_nights_holiday",
  "price_per_night",
] as const;

function parseIntSafe(s: string | undefined, fallback: number): number {
  const n = parseInt(s ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** PLN z `settings.value` (tekst lub liczba z przecinkiem). */
function parsePricePln(s: string | undefined, fallback: number): number {
  const raw = String(s ?? "").trim().replace(",", ".");
  const n = parseFloat(raw);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.round(n * 100) / 100;
}

/**
 * Build pricing from settings rows. Falls back to `DEFAULT_SEASON_PRICING`.
 * Legacy `price_per_night` is used when `price_per_night_offseason` is absent.
 */
export function parsePricingRows(rows: Record<string, string>): SeasonPricing {
  const d = DEFAULT_SEASON_PRICING;
  const offPrice = rows["price_per_night_offseason"] ?? rows["price_per_night"];
  return {
    price_per_night_offseason: parsePricePln(offPrice, d.price_per_night_offseason),
    price_per_night_peak: parsePricePln(rows["price_per_night_peak"], d.price_per_night_peak),
    price_per_night_holiday: parsePricePln(rows["price_per_night_holiday"], d.price_per_night_holiday),
    min_nights_offseason: parseIntSafe(rows["min_nights_offseason"], d.min_nights_offseason),
    min_nights_peak: parseIntSafe(rows["min_nights_peak"], d.min_nights_peak),
    min_nights_holiday: parseIntSafe(rows["min_nights_holiday"], d.min_nights_holiday),
  };
}

export async function fetchPricingFromDb(supabase: SupabaseClient): Promise<SeasonPricing> {
  const { data, error } = await supabase
    .from("settings")
    .select("key, value")
    .in("key", [...SETTINGS_KEYS]);

  if (error) {
    console.error("[pricing] settings fetch:", error.message);
    return { ...DEFAULT_SEASON_PRICING };
  }

  const rows: Record<string, string> = {};
  for (const row of data ?? []) {
    if (row.key && row.value != null) rows[row.key] = String(row.value);
  }
  return parsePricingRows(rows);
}

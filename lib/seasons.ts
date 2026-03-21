export type Season = 'holiday' | 'peak' | 'offseason';

/** Wartości z `public.settings` — zsynchronizowane z API check-availability. */
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
  price_per_night_peak: 500,
  price_per_night_holiday: 900,
  min_nights_offseason: 2,
  min_nights_peak: 4,
  min_nights_holiday: 5,
};

export interface SeasonConfig {
  season: Season;
  label: string;
  pricePerNight: number;
  minNights: number;
}

export const SEASON_CONFIGS: Record<Season, SeasonConfig> = {
  holiday: {
    season: 'holiday',
    label: 'Święta / sylwester',
    pricePerNight: 900,
    minNights: 5,
  },
  peak: {
    season: 'peak',
    label: 'Sezon',
    pricePerNight: 500,
    minNights: 4,
  },
  offseason: {
    season: 'offseason',
    label: 'Poza sezonem',
    pricePerNight: 350,
    minNights: 2,
  },
};

// Easter Sundays – extend when needed
const EASTER_SUNDAYS: Record<number, string> = {
  2026: '2026-04-05',
  2027: '2027-03-28',
  2028: '2028-04-16',
  2029: '2029-04-01',
  2030: '2030-04-21',
};

function addDaysUTC(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function isHolidayDate(date: string): boolean {
  const [y, m, d] = date.split('-').map(Number);

  // Christmas / New Year: Dec 22 – Jan 6
  if (m === 12 && d >= 22) return true;
  if (m === 1 && d <= 6) return true;

  // May long weekend: Apr 30 – May 4
  if (m === 4 && d === 30) return true;
  if (m === 5 && d <= 4) return true;

  // Easter: Wednesday before (−4) to Tuesday after (+2)
  const easter = EASTER_SUNDAYS[y];
  if (easter) {
    for (let offset = -4; offset <= 2; offset++) {
      if (addDaysUTC(easter, offset) === date) return true;
    }
  }

  return false;
}

function isPeakDate(date: string): boolean {
  const [, m, d] = date.split('-').map(Number);

  // Summer: Jun 20 – Sep 14
  if ((m === 6 && d >= 20) || m === 7 || m === 8 || (m === 9 && d <= 14)) return true;

  // Winter school break (ferie zimowe Dolnośląskie): Feb 1–22
  if (m === 2 && d >= 1 && d <= 22) return true;

  return false;
}

/**
 * Returns the highest-priority season for a stay [checkIn, checkOut).
 * Priority: holiday > peak > offseason.
 * The most expensive season that ANY night falls in determines the whole stay.
 */
export function getSeasonForStay(checkIn: string, checkOut: string): Season {
  const cursor = new Date(checkIn + 'T00:00:00Z');
  const end = new Date(checkOut + 'T00:00:00Z');
  let hasPeak = false;

  while (cursor < end) {
    const d = cursor.toISOString().slice(0, 10);
    if (isHolidayDate(d)) return 'holiday'; // short-circuit on first holiday night
    if (isPeakDate(d)) hasPeak = true;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return hasPeak ? 'peak' : 'offseason';
}

export function getSeasonConfig(
  checkIn: string,
  checkOut: string,
  pricing?: SeasonPricing | null,
): SeasonConfig {
  const season = getSeasonForStay(checkIn, checkOut);
  const base = SEASON_CONFIGS[season];
  if (pricing == null) return base;
  const map: Record<Season, { price: number; min: number }> = {
    holiday: {
      price: pricing.price_per_night_holiday,
      min: pricing.min_nights_holiday,
    },
    peak: {
      price: pricing.price_per_night_peak,
      min: pricing.min_nights_peak,
    },
    offseason: {
      price: pricing.price_per_night_offseason,
      min: pricing.min_nights_offseason,
    },
  };
  const m = map[season];
  return { ...base, pricePerNight: m.price, minNights: m.min };
}

/** Polish plural for nights: 1 noc / 2-4 noce / 5+ nocy */
export function nightsPL(n: number): string {
  if (n === 1) return 'noc';
  if (n <= 4) return 'noce';
  return 'nocy';
}

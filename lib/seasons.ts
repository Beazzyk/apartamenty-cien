import { normalizeDateOnly } from './date';

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
  price_per_night_peak: 490,
  price_per_night_holiday: 890,
  min_nights_offseason: 3,
  min_nights_peak: 4,
  min_nights_holiday: 5,
};

export interface SeasonConfig {
  season: Season;
  label: string;
  /** Najniższa stawka w wybranym pobycie (do „cena od”) lub jedyna stawka przy jednym poziomie. */
  pricePerNight: number;
  minNights: number;
}

export const SEASON_CONFIGS: Record<Season, SeasonConfig> = {
  holiday: {
    season: 'holiday',
    label: 'Święta / sylwester',
    pricePerNight: 890,
    minNights: 5,
  },
  peak: {
    season: 'peak',
    label: 'Sezon',
    pricePerNight: 490,
    minNights: 4,
  },
  offseason: {
    season: 'offseason',
    label: 'Poza sezonem',
    pricePerNight: 350,
    minNights: 3,
  },
};

export interface StayPriceLine {
  tier: Season;
  nights: number;
  unitPrice: number;
  subtotal: number;
}

export interface StayPriceBreakdown {
  total: number;
  lines: StayPriceLine[];
}

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

/** Jedyny okres po stawcie „świątecznej” (890): Boże Narodzenie / Sylwester. */
function isChristmasNewYearHolidayDate(date: string): boolean {
  const [, m, d] = date.split('-').map(Number);
  if (m === 12 && d >= 22) return true;
  if (m === 1 && d <= 6) return true;
  return false;
}

function isEasterWeekDate(date: string): boolean {
  const [y] = date.split('-').map(Number);
  const easter = EASTER_SUNDAYS[y];
  if (!easter) return false;
  for (let offset = -4; offset <= 2; offset++) {
    if (addDaysUTC(easter, offset) === date) return true;
  }
  return false;
}

function isMajowkaDate(date: string): boolean {
  const [, m, d] = date.split('-').map(Number);
  if (m === 4 && d === 30) return true;
  if (m === 5 && d <= 4) return true;
  return false;
}

function isCorpusChristiLongWeekend(date: string): boolean {
  const [y] = date.split('-').map(Number);
  const easter = EASTER_SUNDAYS[y];
  if (!easter) return false;
  for (let offset = 0; offset <= 3; offset++) {
    if (addDaysUTC(easter, 60 + offset) === date) return true;
  }
  return false;
}

/**
 * Sezon (490): lato, ferie, Wielkanoc, majówka, Boże Ciało itd.
 * Stawka wyższa (890) tylko w `isChristmasNewYearHolidayDate`.
 */
function isPeakDate(date: string): boolean {
  if (isEasterWeekDate(date)) return true;
  if (isMajowkaDate(date)) return true;
  if (isCorpusChristiLongWeekend(date)) return true;

  const [, m, d] = date.split('-').map(Number);

  // Summer: Jun 20 – Sep 14
  if ((m === 6 && d >= 20) || m === 7 || m === 8 || (m === 9 && d <= 14)) return true;

  // Winter school break (ferie zimowe Dolnośląskie): Feb 1–22
  if (m === 2 && d >= 1 && d <= 22) return true;

  return false;
}

/**
 * Stawka za jedną noc: 890 tylko 22.12–06.01; pozostałe święta / długie weekendy jak sezon (490).
 */
export function getPriceTierForNight(date: string): Season {
  if (isChristmasNewYearHolidayDate(date)) return 'holiday';
  if (isPeakDate(date)) return 'peak';
  return 'offseason';
}

function tierUnitPrice(tier: Season, pricing: SeasonPricing): number {
  switch (tier) {
    case 'holiday':
      return pricing.price_per_night_holiday;
    case 'peak':
      return pricing.price_per_night_peak;
    default:
      return pricing.price_per_night_offseason;
  }
}

/**
 * Suma cen noc po nocy; linie w kolejności chronologicznej (łączone są sąsiednie noce po tej samej stawce).
 */
export function computeStayPriceBreakdown(
  checkIn: string,
  checkOut: string,
  pricing: SeasonPricing,
): StayPriceBreakdown {
  const checkInN = normalizeDateOnly(checkIn);
  const checkOutN = normalizeDateOnly(checkOut);
  const lines: StayPriceLine[] = [];
  const cursor = new Date(checkInN + 'T00:00:00Z');
  const end = new Date(checkOutN + 'T00:00:00Z');

  while (cursor < end) {
    const d = cursor.toISOString().slice(0, 10);
    const tier = getPriceTierForNight(d);
    const unitPrice = tierUnitPrice(tier, pricing);
    const last = lines[lines.length - 1];
    if (last && last.tier === tier && last.unitPrice === unitPrice) {
      last.nights += 1;
      last.subtotal = last.nights * last.unitPrice;
    } else {
      lines.push({ tier, nights: 1, unitPrice, subtotal: unitPrice });
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  const total = lines.reduce((s, l) => s + l.subtotal, 0);
  return { total, lines };
}

/**
 * Najsilniejszy sezon w pobycie — minimum nocy i etykieta.
 * Pierwsza noc w tierze „holiday” (tylko BN/Sylwester) → reguły min. świątecznych.
 */
export function getSeasonForStay(checkIn: string, checkOut: string): Season {
  const checkInN = normalizeDateOnly(checkIn);
  const checkOutN = normalizeDateOnly(checkOut);
  const cursor = new Date(checkInN + 'T00:00:00Z');
  const end = new Date(checkOutN + 'T00:00:00Z');
  let hasPeak = false;

  while (cursor < end) {
    const d = cursor.toISOString().slice(0, 10);
    const tier = getPriceTierForNight(d);
    if (tier === 'holiday') return 'holiday';
    if (tier === 'peak') hasPeak = true;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return hasPeak ? 'peak' : 'offseason';
}

function dominantSeasonForBadge(breakdown: StayPriceBreakdown): Season {
  if (breakdown.lines.some((l) => l.tier === 'holiday')) return 'holiday';
  if (breakdown.lines.some((l) => l.tier === 'peak')) return 'peak';
  return 'offseason';
}

/** Peak inne niż majówka (Wielkanoc, BC, lato, ferie) → min. 4; sama majówka → min. 3 (jak poza sezonem). */
function isNonMajowkaPeakNight(date: string): boolean {
  return getPriceTierForNight(date) === 'peak' && !isMajowkaDate(date);
}

function stayIncludesNonMajowkaPeakNight(checkIn: string, checkOut: string): boolean {
  const checkInN = normalizeDateOnly(checkIn);
  const checkOutN = normalizeDateOnly(checkOut);
  const cursor = new Date(checkInN + 'T00:00:00Z');
  const end = new Date(checkOutN + 'T00:00:00Z');
  while (cursor < end) {
    const d = cursor.toISOString().slice(0, 10);
    if (isNonMajowkaPeakNight(d)) return true;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return false;
}

export function getSeasonConfig(
  checkIn: string,
  checkOut: string,
  pricing?: SeasonPricing | null,
): SeasonConfig {
  const p = pricing ?? DEFAULT_SEASON_PRICING;
  const breakdown = computeStayPriceBreakdown(checkIn, checkOut, p);
  const multipleRates = breakdown.lines.length > 1;

  const seasonFromStay = getSeasonForStay(checkIn, checkOut);
  const base = SEASON_CONFIGS[seasonFromStay];

  const map: Record<Season, { price: number; min: number }> = {
    holiday: {
      price: p.price_per_night_holiday,
      min: p.min_nights_holiday,
    },
    peak: {
      price: p.price_per_night_peak,
      min: p.min_nights_peak,
    },
    offseason: {
      price: p.price_per_night_offseason,
      min: p.min_nights_offseason,
    },
  };
  const m = map[seasonFromStay];

  /** BN/Sylwester → min 5; peak z Wielkanocy/BC/lata/ferii → min 4; sama majówka (30.04–04.05) lub poza sezonem → min 3. */
  const minNights =
    seasonFromStay === 'holiday'
      ? p.min_nights_holiday
      : stayIncludesNonMajowkaPeakNight(checkIn, checkOut)
        ? p.min_nights_peak
        : p.min_nights_offseason;

  const season = multipleRates ? dominantSeasonForBadge(breakdown) : seasonFromStay;

  const pricePerNight = multipleRates
    ? Math.min(...breakdown.lines.map((l) => l.unitPrice))
    : (breakdown.lines[0]?.unitPrice ?? m.price);

  return {
    season,
    label: base.label,
    pricePerNight,
    minNights,
  };
}

/** Polish plural for nights: 1 noc / 2-4 noce / 5+ nocy */
export function nightsPL(n: number): string {
  if (n === 1) return 'noc';
  if (n <= 4) return 'noce';
  return 'nocy';
}

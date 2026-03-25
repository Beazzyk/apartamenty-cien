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
  min_nights_offseason: 2,
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

/** Etykieta przy cenie świątecznej, gdy min. nocy jak poza sezonem (majówka, Boże Ciało). */
export const RELAXED_HOLIDAY_LABEL = 'Majówka / Boże Ciało';

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
    minNights: 2,
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

/** Sylwester/Boże Narodzenie, Wielkanoc — stawka świąteczna i minimum 5 nocy. */
function isStrictHolidayDate(date: string): boolean {
  const [y, m, d] = date.split('-').map(Number);

  // Christmas / New Year: Dec 22 – Jan 6
  if (m === 12 && d >= 22) return true;
  if (m === 1 && d <= 6) return true;

  // Easter: Wednesday before (−4) to Tuesday after (+2)
  const easter = EASTER_SUNDAYS[y];
  if (easter) {
    for (let offset = -4; offset <= 2; offset++) {
      if (addDaysUTC(easter, offset) === date) return true;
    }
  }

  return false;
}

/** Majówka i Boże Ciało — stawka świąteczna, ale minimum jak poza sezonem (2 noce). */
function isRelaxedHolidayPriceDate(date: string): boolean {
  const [y, m, d] = date.split('-').map(Number);

  // May long weekend: Apr 30 – May 4
  if (m === 4 && d === 30) return true;
  if (m === 5 && d <= 4) return true;

  // Boże Ciało (czwartek = Wielkanoc + 60 dni): czw.–niedz.
  const easter = EASTER_SUNDAYS[y];
  if (easter) {
    for (let offset = 0; offset <= 3; offset++) {
      if (addDaysUTC(easter, 60 + offset) === date) return true;
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
 * Stawka za jedną noc (check-in tego dnia do następnego dnia).
 * Święta ścisłe (BN, Wielkanoc) — zawsze stawka świąteczna.
 * Majówka / Boże Ciało: jeśli ten sam dzień wpada też w sezon (lato, ferie) — liczy się **sezon**, żeby nie dublować „święta + peak”.
 */
export function getPriceTierForNight(date: string): Season {
  if (isStrictHolidayDate(date)) return 'holiday';
  if (isRelaxedHolidayPriceDate(date) && isPeakDate(date)) return 'peak';
  if (isRelaxedHolidayPriceDate(date)) return 'holiday';
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
  const lines: StayPriceLine[] = [];
  const cursor = new Date(checkIn + 'T00:00:00Z');
  const end = new Date(checkOut + 'T00:00:00Z');

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
 * Najsilniejszy sezon w pobycie (wg faktycznej stawki za noc) — minimum nocy i etykieta.
 * Pierwsza noc w tierze „holiday” → cały pobyt traktowany jako holiday do reguł min.
 */
export function getSeasonForStay(checkIn: string, checkOut: string): Season {
  const cursor = new Date(checkIn + 'T00:00:00Z');
  const end = new Date(checkOut + 'T00:00:00Z');
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

/** Czy któraś noc pobytu wpada w okres z minimum 5 nocy (święta „ściśle”). */
function stayIncludesStrictHolidayNight(checkIn: string, checkOut: string): boolean {
  const cursor = new Date(checkIn + 'T00:00:00Z');
  const end = new Date(checkOut + 'T00:00:00Z');
  while (cursor < end) {
    const d = cursor.toISOString().slice(0, 10);
    if (isStrictHolidayDate(d)) return true;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return false;
}

function dominantSeasonForBadge(breakdown: StayPriceBreakdown): Season {
  if (breakdown.lines.some((l) => l.tier === 'holiday')) return 'holiday';
  if (breakdown.lines.some((l) => l.tier === 'peak')) return 'peak';
  return 'offseason';
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

  const relaxedHolidayMin =
    seasonFromStay === 'holiday' && !stayIncludesStrictHolidayNight(checkIn, checkOut);

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
  const minNights = relaxedHolidayMin ? p.min_nights_offseason : m.min;

  let label = base.label;
  if (relaxedHolidayMin && !multipleRates) {
    label = RELAXED_HOLIDAY_LABEL;
  }

  const season = multipleRates ? dominantSeasonForBadge(breakdown) : seasonFromStay;

  const pricePerNight = multipleRates
    ? Math.min(...breakdown.lines.map((l) => l.unitPrice))
    : (breakdown.lines[0]?.unitPrice ?? m.price);

  return {
    season,
    label,
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

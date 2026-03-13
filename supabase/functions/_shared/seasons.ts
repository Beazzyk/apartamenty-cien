export type Season = "holiday" | "peak" | "offseason";

export interface SeasonConfig {
  season: Season;
  pricePerNight: number;
  minNights: number;
}

export const SEASON_CONFIGS: Record<Season, SeasonConfig> = {
  holiday:  { season: "holiday",  pricePerNight: 900, minNights: 5 },
  peak:     { season: "peak",     pricePerNight: 600, minNights: 4 },
  offseason:{ season: "offseason",pricePerNight: 450, minNights: 2 },
};

// Easter Sundays – extend when needed
const EASTER_SUNDAYS: Record<number, string> = {
  2026: "2026-04-05",
  2027: "2027-03-28",
  2028: "2028-04-16",
  2029: "2029-04-01",
  2030: "2030-04-21",
};

function addDaysUTC(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function isHolidayDate(date: string): boolean {
  const parts = date.split("-").map(Number);
  const y = parts[0], m = parts[1], d = parts[2];

  // Christmas / New Year: Dec 22 – Jan 6
  if (m === 12 && d >= 22) return true;
  if (m === 1  && d <= 6)  return true;

  // May long weekend: Apr 30 – May 4
  if (m === 4 && d === 30) return true;
  if (m === 5 && d <= 4)   return true;

  // Easter: Maundy Thursday (−3) to Easter Monday (+1)
  const easter = EASTER_SUNDAYS[y];
  if (easter) {
    for (let offset = -3; offset <= 1; offset++) {
      if (addDaysUTC(easter, offset) === date) return true;
    }
  }

  return false;
}

function isPeakDate(date: string): boolean {
  const parts = date.split("-").map(Number);
  const m = parts[1], d = parts[2];

  // Summer: Jun 20 – Sep 14
  if ((m === 6 && d >= 20) || m === 7 || m === 8 || (m === 9 && d <= 14)) return true;

  // Winter school break (ferie zimowe Dolnośląskie): Feb 1–22
  if (m === 2 && d >= 1 && d <= 22) return true;

  return false;
}

/**
 * Returns the highest-priority season for a stay [checkIn, checkOut).
 * Priority: holiday > peak > offseason.
 * The most expensive season that ANY night falls in wins.
 */
export function getSeasonForStay(checkIn: string, checkOut: string): Season {
  const cursor = new Date(checkIn  + "T00:00:00Z");
  const end    = new Date(checkOut + "T00:00:00Z");
  let hasPeak  = false;

  while (cursor < end) {
    const d = cursor.toISOString().slice(0, 10);
    if (isHolidayDate(d)) return "holiday";
    if (isPeakDate(d))    hasPeak = true;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return hasPeak ? "peak" : "offseason";
}

export function getSeasonConfig(checkIn: string, checkOut: string): SeasonConfig {
  return SEASON_CONFIGS[getSeasonForStay(checkIn, checkOut)];
}

/**
 * Stay pricing and iCal use calendar nights in YYYY-MM-DD.
 * Strips time/zone from ISO strings so we never do `iso + "T00:00:00Z"` (invalid).
 */
/** Shift a YYYY-MM-DD date by whole days, staying in UTC. */
export function addDaysStr(dateStr: string, days: number): string {
  const d = new Date(normalizeDateOnly(dateStr) + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function normalizeDateOnly(input: string): string {
  const s = String(input).trim();
  if (!s) return s;
  const dm = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (dm) return dm[1];
  const t = Date.parse(s);
  if (!Number.isNaN(t)) return new Date(t).toISOString().slice(0, 10);
  return s;
}

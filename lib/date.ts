/**
 * Stay pricing uses calendar nights YYYY-MM-DD (same rules as Edge Functions).
 */
export function normalizeDateOnly(input: string): string {
  const s = String(input).trim();
  if (!s) return s;
  const dm = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (dm) return dm[1];
  const t = Date.parse(s);
  if (!Number.isNaN(t)) return new Date(t).toISOString().slice(0, 10);
  return s;
}

/**
 * Każdy dzień pobytu od przyjazdu do wyjazdu włącznie — dzień wyjazdu też
 * jest zajęty (sprzątanie), tak samo jak `expandStayRange` w Edge Functions.
 */
export function eachDayInclusive(from: string, to: string): string[] {
  const days: string[] = [];
  const cursor = new Date(normalizeDateOnly(from) + 'T00:00:00Z');
  const end = new Date(normalizeDateOnly(to) + 'T00:00:00Z');
  while (cursor <= end) {
    days.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}

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

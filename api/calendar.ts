/**
 * Vercel: GET /api/calendar oraz /calendar.ics (rewrite) → treść iCal z Supabase `ical-feed`.
 * Ustaw w Vercel → Environment Variables: ICAL_FEED_URL (pełny URL do ical-feed).
 */

export const config = { runtime: "edge" };

export default async function handler(_req: Request): Promise<Response> {
  const upstream = process.env.ICAL_FEED_URL?.trim();
  if (!upstream) {
    return new Response("ICAL_FEED_URL is not configured", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  let res: Response;
  try {
    res = await fetch(upstream, {
      headers: { Accept: "text/calendar, application/octet-stream, */*" },
      cache: "no-store",
    });
  } catch {
    return new Response("Upstream fetch failed", { status: 502 });
  }

  if (!res.ok) {
    return new Response("Upstream returned error", { status: 502 });
  }

  const body = await res.text();
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      // inline: przeglądarka może pokazać tekst; Airbnb i tak pobiera po HTTP
      "Content-Disposition": 'inline; filename="cienduchagor.ics"',
    },
  });
}

// CORS: odpowiadaj nagłówkiem zgodnym z Origin (localhost na devie + produkcyjne domeny).
const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const isLocal = supabaseUrl.includes("127.0.0.1") || supabaseUrl.includes("localhost");

const SITE_ORIGINS = new Set([
  "https://cienduchagor.pl",
  "https://www.cienduchagor.pl",
  "https://cienduchagor.com",
  "https://www.cienduchagor.com",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

export function corsHeadersForRequest(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin");
  let allow: string;
  if (isLocal) {
    allow = origin && SITE_ORIGINS.has(origin) ? origin : "*";
  } else {
    allow = origin && SITE_ORIGINS.has(origin) ? origin : "https://www.cienduchagor.pl";
  }
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };
}

export function corsResponse(req: Request): Response {
  return new Response(null, { status: 204, headers: corsHeadersForRequest(req) });
}

export function jsonResponse(data: unknown, req: Request, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeadersForRequest(req), "Content-Type": "application/json" },
  });
}

/** Alias — to samo co jsonResponse (dla funkcji z jawnym „with CORS”). */
export function jsonResponseWithCors(
  data: unknown,
  req: Request,
  status = 200,
): Response {
  return jsonResponse(data, req, status);
}

export function errorResponse(message: string, req: Request, status = 500): Response {
  return jsonResponse({ error: message }, req, status);
}

// Allow localhost in local Supabase dev, production domain everywhere else
const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const isLocal = supabaseUrl.includes("127.0.0.1") || supabaseUrl.includes("localhost");
const allowedOrigin = isLocal ? "*" : "https://www.cienduchagor.pl";

export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

export function corsResponse(): Response {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export function jsonResponse(
  data: unknown,
  status = 200,
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function errorResponse(
  message: string,
  status = 500,
): Response {
  return jsonResponse({ error: message }, status);
}

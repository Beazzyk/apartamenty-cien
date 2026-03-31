declare global {
  interface ImportMeta {
    env: Record<string, string>;
  }
}

const FUNCTIONS_URL = import.meta.env?.VITE_SUPABASE_FUNCTIONS_URL || "";
const ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY?.trim() ?? "";

function functionsConfigured(): boolean {
  return Boolean(FUNCTIONS_URL) && !FUNCTIONS_URL.includes("YOUR_PROJECT_REF");
}

/** Nagłówki jak w kliencie Supabase — pozwalają przejść verify_jwt na Edge Functions bez wyłączania JWT (klucz anon jest publiczny). */
function supabaseAuthHeaders(): HeadersInit {
  if (!ANON_KEY) return {};
  return {
    Authorization: `Bearer ${ANON_KEY}`,
    apikey: ANON_KEY,
  };
}

async function readHttpError(res: Response): Promise<string> {
  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    const j = (await res.json().catch(() => ({}))) as { message?: string; error?: string; msg?: string };
    return j.message ?? j.error ?? j.msg ?? `Błąd HTTP ${res.status}`;
  }
  const t = await res.text();
  return t.trim().slice(0, 280) || `Błąd HTTP ${res.status}`;
}

export interface ManageBookingGuestPreview {
  guest_name: string;
  check_in: string;
  check_out: string;
  guests_count: number;
  total_price: number;
}

export type ManageBookingGetJson =
  | {
      ok: true;
      state: "pending";
      booking: ManageBookingGuestPreview;
    }
  | {
      ok: true;
      state: "already_processed";
      status: string;
      booking: ManageBookingGuestPreview;
    }
  | { ok: false; error: string; message?: string };

export type ManageBookingPostJson =
  | {
      ok: true;
      result: "confirmed" | "cancelled" | "already_processed";
      title: string;
      message: string;
      variant: "success" | "info";
      status?: string;
    }
  | { ok: false; error: string; message?: string };

export async function fetchManageBookingPreview(token: string): Promise<ManageBookingGetJson> {
  if (!functionsConfigured()) {
    return { ok: false, error: "not_configured", message: "System rezerwacji nie jest skonfigurowany." };
  }
  const url = `${FUNCTIONS_URL}/manage-booking?token=${encodeURIComponent(token)}&format=json`;
  let res: Response;
  try {
    res = await fetch(url, { headers: { ...supabaseAuthHeaders() } });
  } catch {
    return { ok: false, error: "network", message: "network" };
  }
  let data: unknown;
  try {
    data = await res.json();
  } catch {
    return {
      ok: false,
      error: res.status === 401 || res.status === 403 ? "unauthorized" : "parse",
      message: "Nieprawidłowa odpowiedź serwera.",
    };
  }
  const o = data as Record<string, unknown>;
  if (!res.ok) {
    return {
      ok: false,
      error: res.status === 401 || res.status === 403 ? "unauthorized" : String(o.error ?? "http"),
      message: typeof o.message === "string" ? o.message : undefined,
    };
  }
  return data as ManageBookingGetJson;
}

export async function postManageBookingAction(
  action: string,
  token: string,
): Promise<ManageBookingPostJson> {
  if (!functionsConfigured()) {
    return { ok: false, error: "not_configured", message: "System rezerwacji nie jest skonfigurowany." };
  }
  let res: Response;
  try {
    res = await fetch(`${FUNCTIONS_URL}/manage-booking`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...supabaseAuthHeaders(),
      },
      body: JSON.stringify({ action, token }),
    });
  } catch {
    return { ok: false, error: "network", message: "network" };
  }
  let data: unknown;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) {
      const hint = await readHttpError(res).catch(() => `Błąd ${res.status}`);
      return {
        ok: false,
        error: res.status === 401 || res.status === 403 ? "unauthorized" : "parse",
        message: hint,
      };
    }
    return { ok: false, error: "parse", message: "Nieprawidłowa odpowiedź serwera." };
  }
  const o = data as Record<string, unknown>;
  if (!res.ok) {
    return {
      ok: false,
      error: res.status === 401 || res.status === 403 ? "unauthorized" : String(o.error ?? "http"),
      message: typeof o.message === "string" ? o.message : undefined,
    };
  }
  return data as ManageBookingPostJson;
}

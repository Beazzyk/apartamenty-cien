declare global {
  interface ImportMeta {
    env: Record<string, string>;
  }
}

const FUNCTIONS_URL = import.meta.env?.VITE_SUPABASE_FUNCTIONS_URL || "";

function isConfigured(): boolean {
  return Boolean(FUNCTIONS_URL) && !FUNCTIONS_URL.includes("YOUR_PROJECT_REF");
}

export interface AvailabilityResponse {
  unavailable_dates: string[];
  price_per_night: number;
}

export interface CreateBookingRequest {
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  check_in: string;
  check_out: string;
  guests_count: number;
}

export interface CreateBookingResponse {
  booking_id: string;
  success: boolean;
}

export async function checkAvailability(
  from: string,
  to: string,
): Promise<AvailabilityResponse> {
  if (!isConfigured()) {
    return { unavailable_dates: [], price_per_night: 450 };
  }
  const res = await fetch(
    `${FUNCTIONS_URL}/check-availability?from=${from}&to=${to}`,
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Nie udało się sprawdzić dostępności");
  }
  return res.json();
}

export async function createBooking(
  data: CreateBookingRequest,
): Promise<CreateBookingResponse> {
  if (!isConfigured()) {
    throw new Error("System rezerwacji nie jest jeszcze skonfigurowany. Skontaktuj się z właścicielem.");
  }
  const res = await fetch(`${FUNCTIONS_URL}/create-booking`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Nie udało się utworzyć rezerwacji");
  }
  return res.json();
}

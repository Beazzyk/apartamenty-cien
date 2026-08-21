import { DEFAULT_SEASON_PRICING, type SeasonPricing } from "./seasons";

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
  pending_dates: string[];
  confirmed_dates: string[];
  blocked_dates: string[];
  /**
   * Dni faktycznie wolne, ale zamknięte w luce między rezerwacjami krótszej
   * niż minimum nocy — kalendarz pokazuje je na zielono (właściciel chce je
   * widzieć), formularz nie przepuszcza pobytu, który w nie wpada.
   */
  unbookable_gap_dates: string[];
  /** Cena „od …” (poza sezonem) — kompatybilność wsteczna. */
  price_per_night: number;
  /** Pełny zestaw stawek z bazy (create-booking używa tych samych kluczy). */
  pricing: SeasonPricing;
}

export interface CreateBookingRequest {
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  guest_address: string;
  guest_postal_code: string;
  guest_city: string;
  check_in: string;
  check_out: string;
  guests_count: number;
}

export interface CreateBookingPriceLine {
  tier: string;
  nights: number;
  unit_price: number;
  subtotal: number;
}

export interface CreateBookingResponse {
  booking_id: string;
  success: boolean;
  /** Po wdrożeniu create-booking z mieszaną ceną — zgodne z `total_price` w bazie. */
  total_price?: number;
  breakdown?: CreateBookingPriceLine[];
}

export async function checkAvailability(
  from: string,
  to: string,
): Promise<AvailabilityResponse> {
  if (!isConfigured()) {
    return {
      pending_dates: [],
      confirmed_dates: [],
      blocked_dates: [],
      unbookable_gap_dates: [],
      price_per_night: DEFAULT_SEASON_PRICING.price_per_night_offseason,
      pricing: { ...DEFAULT_SEASON_PRICING },
    };
  }
  const res = await fetch(
    `${FUNCTIONS_URL}/check-availability?from=${from}&to=${to}`,
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Nie udało się sprawdzić dostępności");
  }
  const data = await res.json();
  const pricing = data.pricing ?? { ...DEFAULT_SEASON_PRICING };
  return {
    ...data,
    pricing,
    // Starsze wdrożenie check-availability tego pola nie zwraca.
    unbookable_gap_dates: data.unbookable_gap_dates ?? [],
    price_per_night:
      data.price_per_night ?? pricing.price_per_night_offseason,
  };
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

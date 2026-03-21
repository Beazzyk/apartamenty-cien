-- Pełne ceny sezonowe i min. noce — źródło prawdy wraz z edge functions (create-booking, check-availability).
INSERT INTO public.settings (key, value) VALUES
  ('price_per_night_offseason', '350'),
  ('price_per_night_peak', '500'),
  ('price_per_night_holiday', '900'),
  ('min_nights_offseason', '2'),
  ('min_nights_peak', '4'),
  ('min_nights_holiday', '5')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = now();

-- Zachowaj zgodność: legacy `price_per_night` = cena poza sezonem
UPDATE public.settings
SET value = (SELECT value FROM public.settings WHERE key = 'price_per_night_offseason' LIMIT 1),
    updated_at = now()
WHERE key = 'price_per_night';

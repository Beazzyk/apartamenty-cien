-- Ceny i zalecane min. nocy (kwiecień 2026); spójnie z lib/seasons i edge functions
INSERT INTO public.settings (key, value) VALUES
  ('price_per_night_offseason', '300'),
  ('price_per_night_peak', '400'),
  ('price_per_night_holiday', '850')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = now();

UPDATE public.settings
SET value = (SELECT value FROM public.settings WHERE key = 'price_per_night_offseason' LIMIT 1),
    updated_at = now()
WHERE key = 'price_per_night';

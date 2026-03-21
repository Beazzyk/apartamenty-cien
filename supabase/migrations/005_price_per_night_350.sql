-- Aktualizacja domyślnej ceny wyświetlanej w kalendarzu (baza poza sezonem)
UPDATE public.settings
SET value = '350'
WHERE key = 'price_per_night';

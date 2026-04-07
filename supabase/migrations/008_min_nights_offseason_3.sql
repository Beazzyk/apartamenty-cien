-- Minimum pobytu poza sezonem (i majówka — ta sama wartość): 3 noce
UPDATE public.settings
SET value = '3', updated_at = now()
WHERE key = 'min_nights_offseason';

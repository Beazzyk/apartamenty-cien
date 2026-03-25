# Cennik — jak liczone są noce przez cały rok

Źródło reguł: `lib/seasons.ts` i `supabase/functions/_shared/seasons.ts` (muszą być zsynchronizowane).

## Zasada ogólna

- **Każda noc** pobytu (od daty zameldowania do dnia przed wyjazdem) ma przypisaną **jedną** stawkę.
- **Suma** do zapłaty to suma `(liczba nocy × stawka)` dla każdego poziomu — bez „jednej stawki na cały pobyt”.
- **Priorytet** dla pojedynczej nocy: najpierw **święta ścisłe** (BN, Wielkanoc) — zawsze stawka świąteczna; potem **majówka / Boże Ciało**: jeśli ten sam dzień jest też w **sezonie** (lato, ferie), liczy się **sezon** (nie dublować święta + peak); inaczej stawka świąteczna; na końcu **sezon** lub **poza sezonem**.

Stawki z bazy (`public.settings`): domyślnie poza sezonem **350 zł**, sezon **490 zł**, święta **890 zł**.

---

## 1. Stawka świąteczna (890 zł / noc)

### A) Święta „ściśłe” (Sylwester / Boże Narodzenie)

- **22 grudnia – 6 stycznia** (noc z 21/22.12 liczy się jako pierwsza w oknie, itd.).

### B) Wielkanoc

- Dla każdego roku jest wpisana **niedziela wielkanocna** w tabeli `EASTER_SUNDAYS`.
- Cena świąteczna obowiązuje od **środy 4 dni przed** Wielkanocą do **wtorku 2 dni po** (łącznie 7 dób wokół niedzieli).

### C) Majówka

- **30 kwietnia – 4 maja** (stałe daty kalendarzowe).

### D) Boże Ciało

- **Czwartek** = niedziela wielkanocna **+ 60 dni** (liturgiczne Boże Ciało).
- Do ceny świątecznej zaliczamy jeszcze **piątek–niedziela** po tym czwartku (łącznie **4 dni**: czw.–ndz. długi weekend).
- Wymaga wpisu roku w `EASTER_SUNDAYS` (jak przy Wielkanocy).

Jeśli ten sam dzień wypada jednocześnie w oknie **majówki lub Bożego Ciała** i w **sezonie** (np. Boże Ciało i początek lata 20.06), **wygrywa stawka sezonowa** — noce są rozliczane osobno (część po 890 zł, część po 490 zł w ramach jednego pobytu). Świąt **ścisłych** (pkt. A–B) to nie dotyczy — tam nadal obowiązuje wyłącznie stawka świąteczna.

---

## 2. Sezon — „peak” (490 zł / noc)

### Lato

- **20 czerwca – 14 września** (włącznie).

### Ferie zimowe (województwo dolnośląskie)

- **1–22 lutego** (włącznie).

---

## 3. Poza sezonem (350 zł / noc)

Wszystkie noce, które **nie** wpadają ani w święta, ani w okresy peak z pkt. 2.

---

## Minimalna liczba nocy (osobno od stawek)

- Pobyt obejmujący **choć jedną noc** z okresu **ścisłego** (pkt. 1A–1B): minimum **5 nocy** (wartość `min_nights_holiday` z ustawień).
- Pobyt tylko w **majówce / Bożym Ciele** (świąteczna cena, ale bez świąt ścisłych): minimum jak **poza sezonem** (domyślnie **2 noce**).
- Sam **sezon letni / ferie** (bez świąt): minimum **4 noce** (`min_nights_peak`).
- Samo **poza sezonem**: minimum **2 noce** (`min_nights_offseason`).

Reguła „mixed stay”: jeśli w jednym terminie są **różne stawki za noc**, w formularzu pokazuje się **rozbicie** (np. 890 × 4 + 350 × 6) oraz etykieta **„Mieszane stawki”**.

---

## Aktualizacja kalendarza

- **Wielkanoc / Boże Ciało**: co roku dopisać niedzielę wielkanocną do `EASTER_SUNDAYS` w obu plikach `seasons.ts`.
- Zmiana kwot lub minimów: tabela `settings` w Supabase (klucze `price_per_night_*`, `min_nights_*`).

# Cennik — jak liczone są noce przez cały rok

Źródło reguł: `lib/seasons.ts` i `supabase/functions/_shared/seasons.ts` (muszą być zsynchronizowane).

## Zasada ogólna

- **Każda noc** pobytu ma przypisaną **jedną** stawkę; suma to suma po nocach.
- **Stawka wyższa (890 zł)** obowiązuje **wyłącznie** w okresie **22 grudnia – 6 stycznia** (noc z 21/22.12 itd.).
- **Wszystkie pozostałe okresy „świąteczne” / długie weekendy** (Wielkanoc, majówka, Boże Ciało itd.) — **ta sama stawka co sezon** (**490 zł**), tak jak lato czy ferie.

Stawki z bazy (`public.settings`): domyślnie poza sezonem **350 zł**, sezon **490 zł**, święta **890 zł** (tylko okno BN/Sylwester).

---

## 1. Stawka 890 zł / noc — tylko „ścisłe” święta zimowe

- **22–31 grudnia** oraz **1–6 stycznia** (włącznie).

---

## 2. Stawka 490 zł / noc — sezon (peak)

Obejmuje m.in.:

### Lato

- **20 czerwca – 14 września** (włącznie).

### Ferie zimowe (województwo dolnośląskie)

- **1–22 lutego** (włącznie).

### Wielkanoc

- Od **środy 4 dni przed** niedzielą wielkanocną do **wtorku 2 dni po** (wg `EASTER_SUNDAYS`).

### Majówka

- **30 kwietnia – 4 maja** (włącznie).

### Boże Ciało

- **Czwartek** = niedziela wielkanocna **+ 60 dni** oraz **piątek–niedziela** po tym czwartku (łącznie 4 dni).

Wszystkie te daty są w **tej samej** stawce co **sezon** (490 zł), nie jak 890 zł.

---

## 3. Poza sezonem (350 zł / noc)

Noce, które **nie** wpadają w pkt. 1 ani 2.

---

## Minimalna liczba nocy

- Pobyt obejmujący **choć jedną noc** z okresu **22.12–06.01** (stawka 890): minimum **5 nocy** (`min_nights_holiday`).
- Pobyt z choć jedną nocą **sezonową inną niż majówka** (Wielkanoc, Boże Ciało, lato, ferie): minimum **4 noce** (`min_nights_peak`).
- Pobyt **wyłącznie w majówce** (30.04–04.05) ewentualnie z dniami poza sezonem obok — minimum **3 noce** (jak `min_nights_offseason`).
- Samo **poza sezonem** (bez peak): minimum **3 noce** (`min_nights_offseason`).

---

## Aktualizacja kalendarza

- **Wielkanoc / Boże Ciało**: co roku dopisać niedzielę wielkanocną do `EASTER_SUNDAYS` w obu plikach `seasons.ts`.
- Zmiana kwot lub minimów: tabela `settings` w Supabase.

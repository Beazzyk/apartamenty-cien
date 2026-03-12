/**
 * Treść regulaminu – 1:1 z dokumentów.
 * Skopiuj całą treść z każdego pliku i wklej między backtickami.
 * Zachowaj podziały akapitów (pusta linia = nowy akapit).
 * Linie zaczynające się od §, Art., Rozdział, Článek, Article, Kapitola, Kapitel, Section
 * będą wyświetlane jako nagłówki.
 */

export const REGULAMIN_PL = `
REGULAMIN – treść 1:1 z pliku regulamin.docx

Skopiuj tutaj całą treść z regulamin.docx i wklej między backtickami powyżej (zastępując ten akapit).
Zachowaj puste linie między akapitami. Linie typu „§ 1.” lub „Rozdział I” będą automatycznie formatowane jako nagłówki.
`.trim();

export const REGULAMIN_CZ = `
PRAVIDLA – text 1:1 ze souboru regulamin CZ.docs

Sem zkopírujte celý text z regulamin CZ.docs. Zachovejte prázdné řádky mezi odstavci.
`.trim();

export const REGULAMIN_DE = `
NUTZUNGSBEDINGUNGEN – Text 1:1 aus regulamin DE.docs

Kopieren Sie hier den vollständigen Text aus regulamin DE.docs ein. Leerzeilen zwischen Absätzen beibehalten.
`.trim();

export const REGULAMIN_EN = `
TERMS AND CONDITIONS – text 1:1 from regulamin EN.docs

Paste here the full text from regulamin EN.docs. Keep blank lines between paragraphs.
`.trim();

export type RegulaminLang = 'pl' | 'cz' | 'de' | 'en';

export const REGULAMIN: Record<RegulaminLang, string> = {
  pl: REGULAMIN_PL,
  cz: REGULAMIN_CZ,
  de: REGULAMIN_DE,
  en: REGULAMIN_EN,
};

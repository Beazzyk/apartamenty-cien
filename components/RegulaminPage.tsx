import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { REGULAMIN } from '../content/regulaminData';

type Lang = 'pl' | 'cz' | 'de' | 'en';

const LANG_BUTTONS: { lang: Lang; label: string }[] = [
  { lang: 'pl', label: 'PL' },
  { lang: 'de', label: 'DE' },
  { lang: 'en', label: 'EN' },
  { lang: 'cz', label: 'CZ' },
];

// Sekcja: "1. Nazwa" lub "2. Doba pobytowa"
const SECTION_HEADING_REGEX = /^\d+\.\s+.+/;

// Znak bullet (• lub tab na początku po ewentualnych spacjach)
function isBulletLine(line: string): boolean {
  const t = line.trimStart();
  return t.startsWith('•') || t.startsWith('\u2022') || t.startsWith('●') || (t.length > 0 && t.charCodeAt(0) === 8226);
}

function stripBullet(line: string): string {
  const t = line.trimStart();
  if (t.startsWith('•') || t.startsWith('\u2022') || t.startsWith('●')) return t.slice(1).replace(/^\s*\t?/, '').trim();
  if (t.length > 0 && t.charCodeAt(0) === 8226) return t.slice(1).replace(/^\s*\t?/, '').trim();
  return line.trim();
}

function formatRegulamin(text: string): React.ReactNode {
  const lines = text.split(/\r?\n/).map((l) => l.trimEnd());
  const nodes: React.ReactNode[] = [];
  let i = 0;

  // Pierwsza niepusta linia = tytuł główny
  while (i < lines.length && !lines[i].trim()) i++;
  if (i < lines.length) {
    nodes.push(
      <h1 key="title" className="font-serif text-2xl md:text-3xl text-deep-brown mb-2">
        {lines[i]}
      </h1>
    );
    i++;
  }

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }

    // Nagłówek sekcji (np. "1. Rezerwacja i akceptacja regulaminu")
    if (SECTION_HEADING_REGEX.test(line)) {
      nodes.push(
        <h2 key={i} className="font-serif text-xl text-deep-brown mt-8 mb-3 border-b border-cappuccino/20 pb-2 first:mt-6">
          {line}
        </h2>
      );
      i++;
      continue;
    }

    // Lista punktów (• ...)
    if (isBulletLine(line)) {
      const listItems: string[] = [];
      while (i < lines.length && isBulletLine(lines[i])) {
        listItems.push(stripBullet(lines[i]));
        i++;
      }
      nodes.push(
        <ul key={i} className="list-none mb-4 space-y-2 pl-0">
          {listItems.map((item, j) => (
            <li key={j} className="flex gap-2 text-deep-brown/90 leading-relaxed">
              <span className="text-accent-gold mt-1.5 flex-shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Zwykły akapit
    const paragraphLines: string[] = [];
    while (i < lines.length && lines[i].trim()) {
      const l = lines[i];
      if (SECTION_HEADING_REGEX.test(l) || isBulletLine(l)) break;
      paragraphLines.push(l);
      i++;
    }
    if (paragraphLines.length > 0) {
      nodes.push(
        <p key={i} className="mb-4 leading-relaxed text-deep-brown/90">
          {paragraphLines.map((ln, j) => (
            <React.Fragment key={j}>
              {j > 0 && <br />}
              {ln}
            </React.Fragment>
          ))}
        </p>
      );
    }
  }

  return <>{nodes}</>;
}

const RegulaminPage: React.FC = () => {
  const [lang, setLang] = useState<Lang>('pl');
  const content = REGULAMIN[lang];

  return (
    <div className="min-h-screen font-sans selection:bg-cappuccino selection:text-white bg-warm-beige">
      <header className="bg-warm-beige border-b border-cappuccino/20 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-deep-brown hover:text-accent-gold transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Strona główna
          </Link>
          <h1 className="font-serif text-xl md:text-2xl text-deep-brown">Regulamin</h1>
          <span className="w-20" />
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          {LANG_BUTTONS.map(({ lang: l, label }) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              className={`px-5 py-3 rounded-full border-2 transition-all duration-200 font-medium uppercase tracking-wide text-sm ${
                lang === l
                  ? 'border-accent-gold bg-accent-gold/10 text-deep-brown'
                  : 'border-cappuccino/30 text-deep-brown/70 hover:border-cappuccino/60 hover:bg-cappuccino/5'
              }`}
              title={label}
            >
              {label}
            </button>
          ))}
        </div>

        <article className="bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-cappuccino/20 overflow-hidden">
          <div className="p-8 md:p-12 text-base md:text-lg">
            {content ? formatRegulamin(content) : null}
          </div>
        </article>
      </main>
    </div>
  );
};

export default RegulaminPage;

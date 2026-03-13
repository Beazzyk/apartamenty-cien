import React from 'react';
import { Link } from 'react-router-dom';
import { POLITYKA_PRYWATNOSCI } from '../content/privacyPolicy';

// Formatter: dzieli tekst na linie i sekcje, wyróżnia tytuł, nagłówki i sekcję cookies.

function renderPrivacy(): React.ReactNode {
  const lines = POLITYKA_PRYWATNOSCI.split(/\r?\n/);
  const nodes: React.ReactNode[] = [];
  let i = 0;

  const isSectionHeading = (line: string) =>
    /^([IVX]+\.)\s+/.test(line) || /^I+\. ADMINISTRATOR/.test(line) || /^VII\. PLIKI COOKIES/.test(line);

  // Tytuł główny – pierwsze niepuste linie do pierwszej pustej
  const titleLines: string[] = [];
  while (i < lines.length && !lines[i].trim()) i++;
  while (i < lines.length && lines[i].trim()) {
    titleLines.push(lines[i].trim());
    i++;
  }
  if (titleLines.length) {
    nodes.push(
      <header key="pp-title" className="mb-8 text-center">
        <h1 className="font-serif text-2xl md:text-3xl text-deep-brown mb-2 leading-snug">
          {titleLines.map((t, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <br />}
              {t}
            </React.Fragment>
          ))}
        </h1>
      </header>
    );
  }

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trim();
    i++;

    if (!line) continue;

    // Sekcja "VII. PLIKI COOKIES" – dajemy anchor id="cookies"
    if (line.startsWith('VII. PLIKI COOKIES')) {
      nodes.push(
        <h2
          key={`cookies-${i}`}
          id="cookies"
          className="font-serif text-xl text-deep-brown mt-10 mb-4 border-b border-cappuccino/30 pb-2"
        >
          {line}
        </h2>
      );
      continue;
    }

    // Pozostałe nagłówki sekcji
    if (isSectionHeading(line)) {
      nodes.push(
        <h2
          key={`h-${i}`}
          className="font-serif text-xl text-deep-brown mt-10 mb-4 border-b border-cappuccino/30 pb-2"
        >
          {line}
        </h2>
      );
      continue;
    }

    // Zwykły akapit (łączy kolejne niepuste linie aż do pustej / nagłówka)
    const paraLines = [line];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !isSectionHeading(lines[i].trim()) &&
      !lines[i].trim().startsWith('VIII. PLIKI COOKIES')
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }

    nodes.push(
      <p key={`p-${i}`} className="mb-4 leading-relaxed text-deep-brown/90 whitespace-pre-line">
        {paraLines.join('\n')}
      </p>
    );
  }

  return <>{nodes}</>;
}

const PrivacyPolicyPage: React.FC = () => {
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
          <h1 className="font-serif text-xl md:text-2xl text-deep-brown">Polityka prywatności</h1>
          <span className="w-20" />
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <article className="bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-cappuccino/20 overflow-hidden">
          <div className="p-8 md:p-12 text-base md:text-lg">
            {renderPrivacy()}
          </div>
        </article>
      </main>
    </div>
  );
};

export default PrivacyPolicyPage;


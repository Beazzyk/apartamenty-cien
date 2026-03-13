
import React, { useState } from 'react';
import { useTranslation } from '../context/LanguageContext';

const VISIBLE_BY_DEFAULT = 5;

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const { t, lang } = useTranslation();

  const items = t.faq.items;
  const visibleItems = showAll ? items : items.slice(0, VISIBLE_BY_DEFAULT);
  const hiddenCount = items.length - VISIBLE_BY_DEFAULT;

  const showMoreLabel: Record<string, string> = {
    pl: `Pokaż więcej pytań (${hiddenCount})`,
    de: `Mehr Fragen anzeigen (${hiddenCount})`,
    cs: `Zobrazit více otázek (${hiddenCount})`,
    en: `Show more questions (${hiddenCount})`,
  };
  const showLessLabel: Record<string, string> = {
    pl: 'Zwiń',
    de: 'Weniger anzeigen',
    cs: 'Zobrazit méně',
    en: 'Show less',
  };

  return (
    <section
      className="py-24 bg-warm-beige"
      aria-label={t.faq.heading}
      itemScope
      itemType="https://schema.org/FAQPage"
    >
      <div className="container mx-auto px-6 max-w-3xl">
        <h2 className="font-serif text-4xl text-center text-deep-brown mb-16 scroll-reveal">
          {t.faq.heading}
        </h2>

        <div className="space-y-4 transition-all duration-300">
          {visibleItems.map((item, i) => (
            <div
              key={i}
              className="border-b border-cappuccino/30"
              style={i >= VISIBLE_BY_DEFAULT ? { animation: `fadeIn 0.4s ease both`, animationDelay: `${(i - VISIBLE_BY_DEFAULT) * 60}ms` } : undefined}
              itemScope
              itemProp="mainEntity"
              itemType="https://schema.org/Question"
            >
              <button
                className="w-full py-6 flex justify-between items-center text-left focus:outline-none group"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                aria-expanded={openIndex === i}
                aria-controls={`faq-answer-${i}`}
                id={`faq-question-${i}`}
              >
                <span
                  className={`text-lg font-serif transition-colors pr-4 ${openIndex === i ? 'text-accent-gold' : 'text-deep-brown'}`}
                  itemProp="name"
                >
                  {item.q}
                </span>
                <span className="text-accent-gold transform transition-transform duration-300 flex-shrink-0">
                  {openIndex === i ?
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"/></svg> :
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                  }
                </span>
              </button>
              <div
                id={`faq-answer-${i}`}
                role="region"
                aria-labelledby={`faq-question-${i}`}
                className={`overflow-hidden transition-all duration-500 ease-in-out ${openIndex === i ? 'max-h-96 pb-6' : 'max-h-0'}`}
                itemScope
                itemProp="acceptedAnswer"
                itemType="https://schema.org/Answer"
              >
                <p className="text-deep-brown/70 leading-relaxed" itemProp="text">
                  {item.a}
                </p>
              </div>
            </div>
          ))}
        </div>

        {hiddenCount > 0 && (
          <div className="text-center mt-10">
            <button
              onClick={() => { setShowAll(!showAll); setOpenIndex(null); }}
              className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-deep-brown/60 hover:text-accent-gold transition-colors duration-300 font-light"
            >
              <span>{showAll ? showLessLabel[lang] ?? showLessLabel.pl : showMoreLabel[lang] ?? showMoreLabel.pl}</span>
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FAQ;

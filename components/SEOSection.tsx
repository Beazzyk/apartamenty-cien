
import React from 'react';
import { useTranslation } from '../context/LanguageContext';

const SEOSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section id="apartament" className="py-24 px-6 bg-warm-beige" aria-label="O apartamencie Cień Ducha Gór">
      <div className="container mx-auto max-w-4xl scroll-reveal">
        <div className="text-center mb-16">
          <span className="text-accent-gold uppercase tracking-[0.3em] text-sm font-semibold">
            {t.seo.label}
          </span>
          <h2 className="font-serif text-4xl md:text-5xl mt-4 text-deep-brown">
            {t.seo.title}
          </h2>
        </div>

        <div className="prose prose-lg mx-auto text-deep-brown/80 font-light leading-relaxed text-justify">
          <p className="mb-6">{t.seo.p1}</p>
          <p className="mb-6">{t.seo.p2}</p>
          <p className="mb-6">{t.seo.p3}</p>
          <p className="mb-6">{t.seo.p4}</p>
        </div>

        <div className="mt-10 text-center">
          <a
            href="#rezerwacja"
            className="inline-block bg-deep-brown text-warm-beige font-semibold text-sm uppercase tracking-[0.2em] px-10 py-4 rounded-full hover:bg-accent-gold transition-colors duration-300"
          >
            Sprawdź dostępność
          </a>
        </div>
      </div>
    </section>
  );
};

export default SEOSection;

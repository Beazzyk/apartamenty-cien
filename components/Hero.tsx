
import React from 'react';
import { useTranslation } from '../context/LanguageContext';

const Hero: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section
      className="relative min-h-[90vh] w-full flex items-start justify-center pt-24 md:pt-32 overflow-hidden"
      aria-label="Apartament Cień Ducha Gór, Szklarska Poręba"
      itemScope
      itemType="https://schema.org/LodgingBusiness"
    >
      {/* Hidden microdata for SEO */}
      <meta itemProp="name" content="Apartament Cień Ducha Gór" />
      <meta itemProp="description" content="Luksusowy apartament 67 m² z kominkiem w zabytkowej willi XIX wieku w centrum Szklarskiej Poręby. 130 m od szlaku Wysoki Kamień." />
      <meta itemProp="url" content="https://www.cienduchagor.pl/" />
      <meta itemProp="telephone" content="" />
      <span itemProp="address" itemScope itemType="https://schema.org/PostalAddress" className="hidden">
        <meta itemProp="streetAddress" content="ul. Dworcowa 1" />
        <meta itemProp="addressLocality" content="Szklarska Poręba" />
        <meta itemProp="postalCode" content="58-580" />
        <meta itemProp="addressCountry" content="PL" />
      </span>

      <div className="absolute inset-0">
        <img
          src="/11.jpeg"
          alt="Salon z biblioteką i kominkiem w Apartamencie Cień Ducha Gór, Szklarska Poręba"
          className="w-full h-full object-cover scale-105 animate-[zoom_20s_infinite_alternate]"
          width="1920"
          height="1080"
          loading="eager"
          fetchPriority="high"
          itemProp="image"
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-warm-beige via-transparent to-black/20"></div>
      </div>

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto scroll-reveal active">
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-6 leading-tight" itemProp="headline">
          {t.hero.heading1} <br/>
          <span className="italic">{t.hero.heading2}</span>
        </h1>
        <p className="font-sans text-xl md:text-2xl text-paper-white mb-8 font-light tracking-wide max-w-3xl mx-auto drop-shadow-md" itemProp="description">
          {t.hero.sub}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#rezerwacja"
            className="w-full sm:w-auto px-12 py-5 bg-white text-deep-brown font-semibold rounded-full hover:bg-cappuccino hover:text-white transition-all duration-300 shadow-2xl"
            aria-label="Zarezerwuj pobyt w apartamencie Cień Ducha Gór"
          >
            {t.hero.cta1}
          </a>
          <a
            href="#galeria"
            className="w-full sm:w-auto px-12 py-5 border border-white/50 text-white font-medium rounded-full hover:bg-white/10 transition-all duration-300 backdrop-blur-md"
            aria-label="Odkryj wnętrza apartamentu, galeria zdjęć"
          >
            {t.hero.cta2}
          </a>
        </div>
      </div>

      <style>{`
        @keyframes zoom {
          from { transform: scale(1); }
          to { transform: scale(1.1); }
        }
      `}</style>
    </section>
  );
};

export default Hero;

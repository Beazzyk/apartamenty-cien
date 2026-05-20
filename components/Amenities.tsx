import React from 'react';
import { useTranslation } from '../context/LanguageContext';

const Amenities: React.FC = () => {
  const { t } = useTranslation();
  const { categories, massages, heading, massageNote, spaTitle } = t.amenities;

  return (
    <section className="py-24 px-6 bg-paper-white">
      <div className="container mx-auto max-w-6xl">
        <h2 className="font-serif text-4xl text-center text-deep-brown mb-16 scroll-reveal">{heading}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {categories.map((cat, idx) => (
            <div key={idx} className="scroll-reveal" style={{ transitionDelay: `${idx * 150}ms` }}>
              <h3 className="font-serif text-2xl text-accent-gold mb-6 border-b border-cappuccino/30 pb-2">{cat.name}</h3>
              <ul className="space-y-3">
                {cat.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-deep-brown/80 font-light">
                    <span className="mt-2 w-1.5 h-1.5 shrink-0 rounded-full bg-cappuccino" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Nagłówek Strefy SPA – nad sekcją z zdjęciem i masażami */}
        <div className="mt-20 pt-16 border-t border-cappuccino/20 scroll-reveal text-center">
          <h2 className="font-serif text-3xl text-deep-brown mb-2">{spaTitle}</h2>
          <p className="text-deep-brown/70 font-light">{massageNote}</p>
        </div>
      </div>

      {/* Sekcja masaży: desktop – zdjęcie po lewej (1/3); mobile – zdjęcie na górze pełną szerokością (mniej przycięcia) */}
      <div className="relative py-8 sm:py-12 md:py-24 lg:py-32 overflow-hidden bg-paper-white">
        {/* Mobile: tylko zdjęcie edge-to-edge w ramce (cover — brak pasków), niska wysokość dzięki proporcjom 16/9 */}
        <div className="md:hidden px-6 mb-8 sm:mb-10">
          <div className="container mx-auto max-w-6xl">
            <div className="relative w-full overflow-hidden rounded-2xl border border-cappuccino/20 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.12)] aspect-[16/9]">
              <img
                src="/spa.jpg"
                alt=""
                className="absolute inset-0 h-full w-full object-cover object-[center_42%]"
              />
            </div>
          </div>
        </div>

        {/* Desktop: subtelne zdjęcie – lewa 1/3, nie zasłania tekstu */}
        <div className="hidden md:block absolute top-0 left-0 w-1/3 h-full opacity-[0.2] pointer-events-none z-0">
          <img src="/spa.jpg" alt="" className="h-full w-full object-cover object-left" />
        </div>

        {/* Lista masaży – na mobile pełna szerokość; na desktop z offsetem od zdjęcia */}
        <div className="relative z-10 px-6 md:pl-[38%] md:pr-6 lg:pl-[36%] py-4">
          <div className="max-w-4xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 sm:gap-14 items-start">
              {massages.map((m, idx) => (
                <div key={idx} className="flex flex-col">
                  <div className="min-h-[3.5rem] flex flex-col justify-end border-b border-cappuccino/30 pb-2 mb-3">
                    <h3 className="font-serif text-lg text-accent-gold leading-tight">{m.name}</h3>
                  </div>
                  <ul className="space-y-2">
                    {m.options.map((opt, i) => (
                      <li key={i} className="flex items-center text-deep-brown font-light text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-cappuccino mr-2.5 flex-shrink-0" />
                        {opt}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Amenities;

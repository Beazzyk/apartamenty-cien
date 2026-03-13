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
                  <li key={i} className="flex items-center text-deep-brown/80 font-light">
                    <span className="w-1.5 h-1.5 rounded-full bg-cappuccino mr-3"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-20 pt-16 border-t border-cappuccino/20 scroll-reveal">
          <h2 className="font-serif text-3xl text-center text-deep-brown mb-4">{spaTitle}</h2>
          <p className="text-center text-deep-brown/70 font-light mb-10">{massageNote}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
            {massages.map((m, idx) => (
              <div key={idx} className="flex flex-col">
                <div className="min-h-[4.5rem] flex flex-col justify-end border-b border-cappuccino/30 pb-2 mb-3">
                  <h3 className="font-serif text-lg text-accent-gold leading-tight">{m.name}</h3>
                </div>
                <ul className="space-y-2">
                  {m.options.map((opt, i) => (
                    <li key={i} className="flex items-center text-deep-brown/80 font-light text-sm">
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
    </section>
  );
};

export default Amenities;

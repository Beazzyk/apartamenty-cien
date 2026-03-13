
import React from 'react';
import { useTranslation } from '../context/LanguageContext';

const Location: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section id="lokalizacja" className="py-24 bg-warm-beige">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="w-full lg:w-1/2 scroll-reveal">
            <h2 className="font-serif text-4xl md:text-5xl text-deep-brown mb-8">{t.location.heading}</h2>
            <p className="text-lg text-deep-brown/70 mb-10 leading-relaxed">
              {t.location.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
              {t.location.distances.map((d, i) => (
                <div key={i} className="flex justify-between border-b border-cappuccino/20 pb-3 group">
                  <span className="text-deep-brown group-hover:text-accent-gold transition-colors">{d.place}</span>
                  <span className="font-bold text-accent-gold">{d.dist}</span>
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-paper-white rounded-lg shadow-inner border border-cappuccino/10">
              <p className="italic text-deep-brown/60 text-sm">
                "{t.location.quote}"
              </p>
            </div>
          </div>

          <div className="w-full lg:w-1/2 h-[500px] relative scroll-reveal rounded-lg overflow-hidden shadow-2xl border-4 border-white">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d629.990793967818!2d15.518896000000003!3d50.831846000000006!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x470edb004bc19a8b%3A0xc6c077a2d591f508!2sCie%C5%84%20Ducha%20G%C3%B3r%20-%20Apartament!5e0!3m2!1spl!2spl!4v1773422702564!5m2!1spl!2spl"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mapa lokalizacji - Apartament Cień Ducha Gór, ul. Dworcowa 1, Szklarska Poręba"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Location;

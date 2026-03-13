
import React from 'react';
import { useTranslation } from '../context/LanguageContext';

const AboutUs: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="py-24 bg-warm-beige">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="text-center mb-16 scroll-reveal">
          <h2 className="font-serif text-4xl md:text-5xl text-deep-brown">{t.about.heading}</h2>
          <p className="text-accent-gold mt-4 italic font-serif text-xl">{t.about.subheading}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="scroll-reveal">
            <img
              src="/haus.png"
              alt="Haus Hohenzollern, historyczna willa Szklarska Poręba"
              className="rounded-sm shadow-2xl grayscale hover:grayscale-0 transition-all duration-1000"
            />
          </div>
          <div className="space-y-6 text-deep-brown/80 font-light leading-relaxed scroll-reveal">
            <p>{t.about.p1}</p>
            <p>{t.about.p2}</p>
            <div className="pt-4">
              <span className="font-serif italic text-lg border-l-4 border-accent-gold pl-4">
                {t.about.quote}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;


import React from 'react';
import { useTranslation } from '../context/LanguageContext';

const TrailRitual: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="relative py-32 overflow-hidden bg-deep-brown text-paper-white">
      <div className="absolute top-0 right-0 w-1/3 h-full opacity-10">
        <img src="/rituals.jpeg" alt="Rituals – moment wytchnienia" className="object-cover h-full w-full" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl scroll-reveal">
          <span className="text-accent-gold uppercase tracking-widest text-sm mb-4 block">{t.trail.label}</span>
          <h2 className="font-serif text-5xl md:text-6xl mb-8 leading-tight italic">{t.trail.heading}</h2>

          <div className="space-y-6 text-xl font-light leading-relaxed text-paper-white/90 italic">
            <p>{t.trail.p1}</p>
            <p>{t.trail.p2}</p>
          </div>

          <div className="mt-12 flex items-center space-x-6">
            <div className="w-16 h-px bg-accent-gold"></div>
            <p className="font-serif text-lg tracking-wide uppercase">Cień Ducha Gór</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrailRitual;

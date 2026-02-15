
import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="relative h-screen w-full flex items-start justify-center pt-28 md:pt-36 overflow-hidden">
      {/* Background using the wide living room shot from the provided photos */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1920" 
          alt="Salon z biblioteką i kominkiem - Cień Ducha Gór" 
          className="w-full h-full object-cover scale-105 animate-[zoom_20s_infinite_alternate]"
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-warm-beige via-transparent to-black/20"></div>
      </div>

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto scroll-reveal active">
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-6 leading-tight">
          Niektóre miejsca nie są tylko noclegiem. <br/>
          <span className="italic">Są opowieścią.</span>
        </h1>
        <p className="font-sans text-xl md:text-2xl text-paper-white mb-8 font-light tracking-wide max-w-3xl mx-auto drop-shadow-md">
          Luksusowy apartament 67 m² z autorską duszą, białą biblioteką i ciepłem kominka w zabytkowej willi Szklarskiej Poręby.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a 
            href="#rezerwacja" 
            className="w-full sm:w-auto px-12 py-5 bg-white text-deep-brown font-semibold rounded-full hover:bg-cappuccino hover:text-white transition-all duration-300 shadow-2xl"
          >
            Zarezerwuj swój pobyt
          </a>
          <a 
            href="#apartament" 
            className="w-full sm:w-auto px-12 py-5 border border-white/50 text-white font-medium rounded-full hover:bg-white/10 transition-all duration-300 backdrop-blur-md"
          >
            Odkryj wnętrza
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

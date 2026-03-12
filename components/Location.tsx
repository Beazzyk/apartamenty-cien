
import React from 'react';

const distances = [
  { place: 'Szlak Wysoki Kamień', dist: '130 m' },
  { place: 'PKP Szklarska Poręba Górna', dist: '200 m' },
  { place: 'Główna ulica handlowa', dist: '200 m' },
  { place: 'Szrenica Ski Arena', dist: '1.8 km' },
  { place: 'Wodospad Kamieńczyk', dist: '2.7 km' },
  { place: 'Jakuszyce (Narciarstwo biegowe)', dist: '7.3 km' },
];

const Location: React.FC = () => {
  return (
    <section id="lokalizacja" className="py-24 bg-warm-beige">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="w-full lg:w-1/2 scroll-reveal">
            <h2 className="font-serif text-4xl md:text-5xl text-deep-brown mb-8">Idealna Lokalizacja</h2>
            <p className="text-lg text-deep-brown/70 mb-10 leading-relaxed">
              Apartament znajduje się w zabytkowej enklawie ciszy przy ulicy Dworcowej, pozostając jednocześnie w samym sercu Szklarskiej Poręby. To idealna baza wypadowa na karkonoskie szlaki i doskonały punkt startowy dla narciarzy.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
              {distances.map((d, i) => (
                <div key={i} className="flex justify-between border-b border-cappuccino/20 pb-3 group">
                  <span className="text-deep-brown group-hover:text-accent-gold transition-colors">{d.place}</span>
                  <span className="font-bold text-accent-gold">{d.dist}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-12 p-6 bg-paper-white rounded-lg shadow-inner border border-cappuccino/10">
                <p className="italic text-deep-brown/60 text-sm">
                  "Lokalizacja marzenie – z pociągu wprost do luksusowego azylu, a potem prosto na szlak. Cisza w centrum miasta."
                </p>
            </div>
          </div>

          <div className="w-full lg:w-1/2 h-[500px] relative scroll-reveal rounded-lg overflow-hidden shadow-2xl border-4 border-white">
            <iframe 
                src="https://www.google.com/maps?q=50.831846,15.518896&hl=pl&z=19&output=embed" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy"
                title="Mapa lokalizacji - Apartament Cień Ducha Gór, ul. Dworcowa, Szklarska Poręba"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Location;

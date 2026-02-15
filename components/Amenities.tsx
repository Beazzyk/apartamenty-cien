
import React from 'react';

const Categories = [
  {
    name: 'Salon',
    items: ['Kominek', 'Biblioteczka', 'Netflix', 'Telewizor Smart', 'Konsola do gier', 'Część wypoczynkowa', 'Część jadalniana', 'Sprzęt do prasowania']
  },
  {
    name: 'Kuchnia',
    items: ['Ekspres do kawy', 'Piekarnik', 'Lodówka', 'Czajnik', 'Płyta kuchenna', 'Zmywarka', 'Przybory kuchenne', 'Zestaw powitalny']
  },
  {
    name: 'Łazienka',
    items: ['Prysznic', 'Pralka', 'Suszarka do włosów', 'Ręczniki premium', 'Kosmetyki Rituals', 'Mata łazienkowa']
  },
  {
    name: 'Sypialnie',
    items: ['2 niezależne sypialnie', 'Przestronne szafy', 'Pościel satynowa', 'Lampki do czytania', 'Wygodne materace']
  }
];

const Amenities: React.FC = () => {
  return (
    <section className="py-24 px-6 bg-paper-white">
      <div className="container mx-auto max-w-6xl">
        <h2 className="font-serif text-4xl text-center text-deep-brown mb-16 scroll-reveal">Pełne Wyposażenie</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {Categories.map((cat, idx) => (
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
      </div>
    </section>
  );
};

export default Amenities;

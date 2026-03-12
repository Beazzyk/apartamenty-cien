import React from 'react';

const Categories = [
  {
    name: 'Salon',
    items: ['Kominek', 'Biblioteczka', 'Netflix', 'Telewizor Smart', 'Konsola do gier', 'Część wypoczynkowa', 'Część jadalniana', 'Sprzęt do prasowania']
  },
  {
    name: 'Kuchnia',
    items: ['Ekspres do kawy', 'Piekarnik', 'Lodówka', 'Czajnik', 'Płyta kuchenna', 'Zmywarka', 'Przybory kuchenne']
  },
  {
    name: 'Łazienka',
    items: ['Prysznic', 'Pralka', 'Suszarka do włosów', 'Ręczniki premium', 'Kosmetyki Rituals', 'Suszarka do prania']
  },
  {
    name: 'Sypialnie',
    items: ['2 niezależne sypialnie', 'Przestronne szafy', 'Pościel satynowa', 'Lampki do czytania', 'Wygodne materace']
  }
];

const Masaze = [
  { name: 'Masaż relaksacyjny', options: ['60 min – 160 zł', '90 min – 220 zł', '+ peeling 30 zł'] },
  { name: 'Masaż klasyczny', options: ['60 min – 180 zł', '90 min – 250 zł'] },
  { name: 'Masaż twarzy z peelingiem, gorącymi ręcznikami i maską', options: ['60 min – 230 zł', '90 min – 290 zł'] },
  { name: 'Masaż refleksologiczny stóp/dłoni/twarzy z peelingiem i maską', options: ['60 min – 230 zł', '90 min – 290 zł'] }
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

        <div className="mt-20 pt-16 border-t border-cappuccino/20 scroll-reveal">
          <p className="text-center text-deep-brown/70 font-light mb-10">Możliwość zamówienia masażu w apartamencie</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
            {Masaze.map((m, idx) => (
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

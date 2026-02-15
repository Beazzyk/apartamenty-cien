
import React from 'react';

const AboutUs: React.FC = () => {
  return (
    <section className="py-24 bg-warm-beige">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="text-center mb-16 scroll-reveal">
          <h2 className="font-serif text-4xl md:text-5xl text-deep-brown">Z Kart Historii</h2>
          <p className="text-accent-gold mt-4 italic font-serif text-xl">Haus Hohenzollern, XIX wiek</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="scroll-reveal">
            <img 
              src="https://picsum.photos/seed/old_villa/800/800" 
              alt="Historyczna willa Szklarska Poręba" 
              className="rounded-sm shadow-2xl grayscale hover:grayscale-0 transition-all duration-1000"
            />
          </div>
          <div className="space-y-6 text-deep-brown/80 font-light leading-relaxed scroll-reveal">
            <p>
              Nasza willa, wybudowana pod koniec XIX wieku jako Haus Hohenzollern, jest jednym z najpiękniejszych przykładów architektury uzdrowiskowej dawnej Szklarskiej Poręby. Znajduje się przy historycznej ulicy Dworcowej, która niegdyś była bramą dla gości przybywających do serca Karkonoszy.
            </p>
            <p>
              Każdy kąt tego miejsca szepcze opowieści z minionych epok. Tworząc "Cień Ducha Gór", z największą starannością zachowaliśmy autentyczne detale: wysokie sufity, oryginalną stolarkę i duszę, którą czuć w każdym pomieszczeniu. To przestrzeń, która łączy prestiż minionych lat z dzisiejszym komfortem premium.
            </p>
            <div className="pt-4">
               <span className="font-serif italic text-lg border-l-4 border-accent-gold pl-4">To nie tylko apartament. To fragment historii Szklarskiej Poręby.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;

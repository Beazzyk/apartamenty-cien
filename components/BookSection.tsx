
import React from 'react';

const BookSection: React.FC = () => {
  return (
    <section id="ksiazka" className="py-32 bg-paper-white border-y border-cappuccino/10">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          <div className="w-full lg:w-2/5 flex justify-center scroll-reveal">
            <div className="relative group cursor-pointer max-w-sm">
              <div className="relative">
                <img 
                  src="/ciend.png" 
                  alt="Okładka książki Cień Ducha Gór - Hubert Litwinionek" 
                  className="shadow-[30px_30px_60px_rgba(0,0,0,0.4)] rotate-2 group-hover:rotate-0 transition-transform duration-700 rounded-lg border-l-8 border-deep-brown/10"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-deep-brown/20 to-transparent pointer-events-none rounded-lg"></div>
              </div>
              
              <div className="absolute -bottom-6 -right-6 bg-deep-brown text-paper-white p-6 rounded-lg shadow-2xl hidden md:block group-hover:scale-105 transition-transform border border-accent-gold/30">
                 <p className="font-serif italic text-lg leading-tight">„Na końcu szlaku czai się zło”</p>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-3/5 scroll-reveal">
            <span className="text-accent-gold uppercase tracking-[0.3em] text-sm mb-4 block font-semibold">Literatura Karkonoszy</span>
            <h2 className="font-serif text-5xl md:text-6xl text-deep-brown mb-8 leading-tight">Poznaj historię, która <br/><span className="italic">zmieniła ten dom.</span></h2>
            <div className="w-20 h-1 bg-accent-gold mb-8"></div>
            
            <p className="text-2xl text-deep-brown/80 mb-8 font-light leading-relaxed italic border-l-4 border-cappuccino/20 pl-8">
              "Hubert Litwinionek zabiera czytelnika w mroczną podróż po Szklarskiej Porębie, gdzie granica między rzeczywistością a górską legendą zaciera się nieodwracalnie."
            </p>
            <p className="text-lg text-deep-brown/70 mb-10 leading-relaxed max-w-2xl">
              Apartament „Cień Ducha Gór” to nie tylko nazwa – to fizyczne przedłużenie świata opisanego w powieści. Jako autor i gospodarz, zapraszam Cię do miejsca, które tętni atmosferą moich książek. W każdym egzemplarzu dostępnym w apartamencie znajdziesz dedykację, która sprawi, że Twoja lektura przy kominku stanie się jeszcze bardziej osobista.
            </p>
            
            <div className="flex flex-wrap gap-6">
              <button className="px-12 py-5 bg-deep-brown text-white rounded-full hover:bg-accent-gold transition-all duration-300 shadow-xl hover:-translate-y-1 font-medium">
                Zamów książkę online
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookSection;

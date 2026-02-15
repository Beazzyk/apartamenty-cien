
import React, { useState } from 'react';

const BookingSection: React.FC = () => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [guests, setGuests] = useState(2);

  return (
    <section className="py-24 bg-paper-white relative">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] rounded-2xl overflow-hidden flex flex-col lg:flex-row border border-cappuccino/20">
          
          {/* Left: Interactive Form */}
          <div className="w-full lg:w-1/2 p-12 lg:p-16 scroll-reveal">
            <h2 className="font-serif text-4xl text-deep-brown mb-4">Zarezerwuj pobyt</h2>
            <p className="text-deep-brown/60 mb-10 uppercase tracking-widest text-xs">Bezpośrednio i bezpiecznie</p>
            
            <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col space-y-2">
                  <label className="text-xs uppercase font-semibold text-accent-gold">Data przyjazdu</label>
                  <input 
                    type="date" 
                    className="p-4 border border-cappuccino/30 rounded-lg focus:ring-2 focus:ring-cappuccino focus:outline-none transition-all"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="text-xs uppercase font-semibold text-accent-gold">Data wyjazdu</label>
                  <input 
                    type="date" 
                    className="p-4 border border-cappuccino/30 rounded-lg focus:ring-2 focus:ring-cappuccino focus:outline-none transition-all"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-xs uppercase font-semibold text-accent-gold">Liczba gości</label>
                <select 
                  className="p-4 border border-cappuccino/30 rounded-lg focus:ring-2 focus:ring-cappuccino focus:outline-none bg-white"
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                >
                  {[1,2,3,4,5,6].map(n => (
                    <option key={n} value={n}>{n} {n === 1 ? 'osoba' : (n < 5 ? 'osoby' : 'osób')}</option>
                  ))}
                </select>
              </div>

              <div className="pt-6">
                <div className="flex justify-between items-end mb-6">
                    <span className="text-sm text-deep-brown/60 uppercase tracking-wide">Szacunkowa cena</span>
                    <span className="text-3xl font-serif text-deep-brown">od 450 PLN <span className="text-sm font-sans font-light">/ noc</span></span>
                </div>
                <button className="w-full py-5 bg-deep-brown text-white rounded-full text-lg font-medium hover:bg-accent-gold transition-all duration-300 shadow-lg active:scale-95">
                  Sprawdź dostępność i rezerwuj
                </button>
              </div>
            </form>

            <div className="mt-8 flex items-center justify-center space-x-4">
              <span className="h-px w-12 bg-cappuccino/30"></span>
              <span className="text-xs uppercase text-deep-brown/40">Lub przez platformy</span>
              <span className="h-px w-12 bg-cappuccino/30"></span>
            </div>

            <div className="mt-6">
              <a 
                href="https://www.booking.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 w-full py-3 border border-blue-800 text-blue-800 rounded-full hover:bg-blue-50 transition-all font-semibold"
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/be/Booking.com_logo.svg" alt="Booking.com" className="h-4" />
                <span>Rezerwuj przez Booking</span>
              </a>
            </div>
          </div>

          {/* Right: Info / Calendar Image */}
          <div className="w-full lg:w-1/2 bg-warm-beige p-12 lg:p-16 border-l border-cappuccino/10 flex flex-col justify-center scroll-reveal">
            <div className="space-y-10">
              <div className="flex space-x-6">
                <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center text-accent-gold shadow-md">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div>
                  <h4 className="font-serif text-xl mb-1">Gwarancja najniższej ceny</h4>
                  <p className="text-deep-brown/60 text-sm">Rezerwując bezpośrednio przez naszą stronę, zawsze otrzymujesz najkorzystniejszą ofertę.</p>
                </div>
              </div>
              
              <div className="flex space-x-6">
                <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center text-accent-gold shadow-md">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div>
                  <h4 className="font-serif text-xl mb-1">Synchronizacja Live</h4>
                  <p className="text-deep-brown/60 text-sm">Nasz kalendarz jest na bieżąco synchronizowany z serwisem Booking.com. Widoczne daty są zawsze aktualne.</p>
                </div>
              </div>

              <div className="flex space-x-6">
                <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center text-accent-gold shadow-md">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div>
                  <h4 className="font-serif text-xl mb-1">Bezpieczne płatności</h4>
                  <p className="text-deep-brown/60 text-sm">Wspieramy bezpieczne formy płatności online oraz tradycyjny przelew.</p>
                </div>
              </div>
            </div>
            
            <div className="mt-16 text-center lg:text-left">
                <p className="text-xs uppercase tracking-widest text-accent-gold font-bold">Zasady pobytu</p>
                <p className="text-xs text-deep-brown/50 mt-2">Doba hotelowa: 15:00 - 11:00. <br/>Zakaz palenia. Zwierzęta akceptowane po uzgodnieniu.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingSection;

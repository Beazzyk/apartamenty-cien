
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-deep-brown text-paper-white py-24 border-t border-accent-gold/20">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          
          {/* Brand & Logo */}
          <div className="space-y-8">
            <div className="flex items-center space-x-3">
              <img 
                src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/mountain.svg" 
                className="h-12 w-auto invert brightness-200" 
                alt="Logo" 
              />
              <h3 className="font-serif text-2xl tracking-tight">Cień Ducha Gór</h3>
            </div>
            <p className="text-paper-white/50 font-light leading-relaxed">
              Luksusowy apartament stworzony przez pasjonata gór i literatury. Odkryj miejsce, gdzie każdy detal ma znaczenie.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-12 h-12 rounded-full border border-paper-white/10 flex items-center justify-center hover:bg-accent-gold hover:border-accent-gold transition-all duration-300">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-serif text-xl mb-10 border-b border-accent-gold/20 pb-4 inline-block">Nawigacja</h4>
            <ul className="space-y-4 text-paper-white/50 font-light text-sm uppercase tracking-widest">
              <li><a href="#apartament" className="hover:text-accent-gold transition-colors">Wnętrza</a></li>
              <li><a href="#lokalizacja" className="hover:text-accent-gold transition-colors">Okolica</a></li>
              <li><a href="#ksiazka" className="hover:text-accent-gold transition-colors">Książka</a></li>
              <li><a href="#rezerwacja" className="hover:text-accent-gold transition-colors">Terminy</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-xl mb-10 border-b border-accent-gold/20 pb-4 inline-block">Kontakt</h4>
            <ul className="space-y-6 text-paper-white/70 font-light">
              <li className="flex items-start space-x-4">
                <svg className="w-5 h-5 text-accent-gold mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span className="text-sm">ul. Dworcowa<br/>58-580 Szklarska Poręba</span>
              </li>
              <li className="flex items-center space-x-4">
                <svg className="w-5 h-5 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span className="text-sm">+48 123 456 789</span>
              </li>
            </ul>
          </div>

          {/* Badges */}
          <div className="space-y-10">
             <div className="p-6 bg-paper-white/5 rounded-xl border border-white/5">
                <h4 className="font-serif text-lg mb-4 text-accent-gold">Partner Rezerwacyjny</h4>
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/be/Booking.com_logo.svg" alt="Booking.com" className="h-5 invert opacity-70" />
             </div>
             <p className="text-[10px] uppercase tracking-[0.4em] text-paper-white/30 leading-loose">
               Oficjalna strona Apartamentu Cień Ducha Gór. Projekt premium dla Szklarskiej Poręby.
             </p>
          </div>
        </div>

        <div className="border-t border-paper-white/5 pt-12 flex flex-col md:flex-row justify-between items-center text-paper-white/30 text-[10px] tracking-[0.3em] uppercase">
          <p>© {new Date().getFullYear()} Cień Ducha Gór. Wszystkie prawa zastrzeżone.</p>
          <div className="mt-4 md:mt-0 space-x-8">
            <Link to="/regulamin" className="hover:text-white transition-colors">Regulamin</Link>
            <a href="#" className="hover:text-white transition-colors">Polityka Prywatności</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

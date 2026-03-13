
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const f = t.footer;

  return (
    <footer className="bg-deep-brown text-paper-white py-24 border-t border-accent-gold/20">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-20">

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
            <p className="text-paper-white/50 font-light leading-relaxed">{f.tagline}</p>
            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/cienduchagor/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Cień Ducha Gór"
                className="w-12 h-12 rounded-full border border-paper-white/10 flex items-center justify-center hover:bg-accent-gold hover:border-accent-gold transition-all duration-300"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-serif text-xl mb-10 border-b border-accent-gold/20 pb-4 inline-block">{f.navigation}</h4>
            <ul className="space-y-4 text-paper-white/50 font-light text-sm uppercase tracking-widest">
              <li><a href="#apartament" className="hover:text-accent-gold transition-colors">{f.navLinks.wnetrza}</a></li>
              <li><a href="#lokalizacja" className="hover:text-accent-gold transition-colors">{f.navLinks.okolica}</a></li>
              <li><a href="#ksiazka" className="hover:text-accent-gold transition-colors">{f.navLinks.ksiazka}</a></li>
              <li><a href="#rezerwacja" className="hover:text-accent-gold transition-colors">{f.navLinks.terminy}</a></li>
            </ul>
          </div>

          {/* Karkonosze SEO links */}
          <div>
            <h4 className="font-serif text-xl mb-10 border-b border-accent-gold/20 pb-4 inline-block">Karkonosze</h4>
            <ul className="space-y-4 text-paper-white/50 font-light text-sm uppercase tracking-widest">
              <li>
                <a href="#lokalizacja" className="hover:text-accent-gold transition-colors" title="Szlak Wysoki Kamień, 130 m od apartamentu">
                  Wysoki Kamień
                </a>
              </li>
              <li>
                <a href="#lokalizacja" className="hover:text-accent-gold transition-colors" title="Wodospad Kamieńczyka, 2,7 km">
                  Wodospad Kamieńczyka
                </a>
              </li>
              <li>
                <a href="#lokalizacja" className="hover:text-accent-gold transition-colors" title="Ski Arena Szrenica, 1,8 km">
                  Ski Arena Szrenica
                </a>
              </li>
              <li>
                <a href="#lokalizacja" className="hover:text-accent-gold transition-colors" title="Jakuszyce, narciarstwo biegowe, 7,3 km">
                  Jakuszyce
                </a>
              </li>
              <li>
                <a href="#rezerwacja" className="hover:text-accent-gold transition-colors" title="Noclegi w Szklarskiej Porębie, rezerwacja bezpośrednia">
                  Noclegi Szklarska Poręba
                </a>
              </li>
              <li>
                <a href="#rezerwacja" className="hover:text-accent-gold transition-colors" title="Apartament z kominkiem w Karkonoszach">
                  Apartament z kominkiem
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-xl mb-10 border-b border-accent-gold/20 pb-4 inline-block">{f.contact}</h4>
            <ul className="space-y-6 text-paper-white/70 font-light">
              <li className="flex items-start space-x-4">
                <svg className="w-5 h-5 text-accent-gold mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <address
                  className="text-sm not-italic"
                  itemScope
                  itemType="https://schema.org/PostalAddress"
                >
                  <span itemProp="streetAddress">ul. Dworcowa 1</span><br/>
                  <span itemProp="postalCode">58-580</span>{' '}
                  <span itemProp="addressLocality">Szklarska Poręba</span><br/>
                  <span itemProp="addressRegion">Dolnośląskie</span>,{' '}
                  <span itemProp="addressCountry">Polska</span>
                </address>
              </li>
              <li className="flex items-center space-x-4">
                <svg
                  className="w-5 h-5 text-accent-gold"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5 7l7 6 7-6"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <a
                  href="mailto:cienduchagor@gmail.com"
                  className="text-sm hover:text-accent-gold transition-colors"
                >
                  cienduchagor@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Badges */}
          <div className="space-y-10">
            <div className="p-6 bg-paper-white/5 rounded-xl border border-white/5">
              <h4 className="font-serif text-lg mb-4 text-accent-gold">{f.bookingPartner}</h4>
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/be/Booking.com_logo.svg" alt="Booking.com" className="h-5 invert opacity-70" />
            </div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-paper-white/30 leading-loose">
              {f.officialNote}
            </p>
          </div>
        </div>

        <div className="border-t border-paper-white/5 pt-12 flex flex-col md:flex-row justify-between items-center text-paper-white/30 text-[10px] tracking-[0.3em] uppercase">
          <p>© {new Date().getFullYear()} {f.copyright}</p>
          <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-6">
            <Link to="/regulamin" className="hover:text-white transition-colors">{f.regulamin}</Link>
            <a href="/polityka-prywatnosci" className="hover:text-white transition-colors">{f.privacy}</a>
            <a href="/polityka-prywatnosci#cookies" className="hover:text-white transition-colors">{f.cookies}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

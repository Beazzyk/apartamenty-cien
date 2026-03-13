import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import TextLogo from './TextLogo';
import { useTranslation } from '../context/LanguageContext';
import { Lang } from '../content/translations';

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const FlagIcon: React.FC<{ code: Lang; className?: string }> = ({ code, className }) => {
  return (
    <span
      className={
        'inline-flex items-center justify-center rounded-full overflow-hidden ring-1 ring-black/10 bg-white ' +
        (className ?? '')
      }
    >
      <svg viewBox="0 0 24 24" className="w-full h-full">
        {code === 'pl' && (
          <>
            <rect width="24" height="12" y="0" fill="#ffffff" />
            <rect width="24" height="12" y="12" fill="#dc143c" />
          </>
        )}
        {code === 'cz' && (
          <>
            <rect width="24" height="24" fill="#ffffff" />
            <rect width="24" height="12" y="12" fill="#d7141a" />
            <polygon points="0,0 12,12 0,24" fill="#11457e" />
          </>
        )}
        {code === 'de' && (
          <>
            <rect width="24" height="8" y="0" fill="#000000" />
            <rect width="24" height="8" y="8" fill="#dd0000" />
            <rect width="24" height="8" y="16" fill="#ffce00" />
          </>
        )}
        {code === 'en' && (
          <>
            <rect width="24" height="24" fill="#012169" />
            <g stroke="#ffffff" strokeWidth="3">
              <path d="M0 0 L24 24" />
              <path d="M24 0 L0 24" />
              <path d="M12 0 L12 24" />
              <path d="M0 12 L24 12" />
            </g>
            <g stroke="#c8102e" strokeWidth="1.5">
              <path d="M0 0 L24 24" />
              <path d="M24 0 L0 24" />
              <path d="M12 0 L12 24" />
              <path d="M0 12 L24 12" />
            </g>
          </>
        )}
      </svg>
    </span>
  );
};

const LANGUAGES: { code: Lang; label: string }[] = [
  { code: 'pl', label: 'Polski' },
  { code: 'cz', label: 'Čeština' },
  { code: 'de', label: 'Deutsch' },
  { code: 'en', label: 'English' },
];

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const { lang, setLang, t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Zamknij dropdown po kliknięciu poza nim
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = LANGUAGES.find((l) => l.code === lang)!;

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-md py-3 md:py-4' : 'bg-transparent py-3 md:py-4'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center h-12 md:h-14">
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); scrollToTop(); }}
          className="flex items-center h-full py-0 -my-1 cursor-pointer"
          aria-label="Przewiń do góry"
        >
          <TextLogo variant={isScrolled ? 'dark' : 'light'} />
        </a>

        <div className={`hidden md:flex space-x-8 items-center text-sm uppercase tracking-widest font-medium ${isScrolled ? 'text-deep-brown' : 'text-white'}`}>
          <a href="#apartament" className="hover:text-accent-gold transition-colors">{t.navbar.apartament}</a>
          <a href="#lokalizacja" className="hover:text-accent-gold transition-colors">{t.navbar.lokalizacja}</a>
          <a href="#ksiazka" className="hover:text-accent-gold transition-colors">{t.navbar.ksiazka}</a>
          <Link to="/regulamin" className="hover:text-accent-gold transition-colors">{t.navbar.regulamin}</Link>
          <a href="#rezerwacja" className="bg-deep-brown text-white px-6 py-2 rounded-full hover:bg-accent-gold transition-all duration-300 shadow-lg">
            {t.navbar.rezerwuj}
          </a>

          {/* Language switcher */}
          <div ref={langRef} className="relative">
            <button
              type="button"
              onClick={() => setLangOpen((o) => !o)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all duration-200 text-sm font-medium ${
                isScrolled
                  ? 'border-cappuccino/30 text-deep-brown hover:border-accent-gold hover:text-accent-gold'
                  : 'border-white/30 text-white hover:border-white hover:bg-white/10'
              }`}
              aria-label="Zmień język"
            >
              <FlagIcon code={currentLang.code} className="w-5 h-5" />
              <span className="hidden lg:inline">{currentLang.label}</span>
              <svg className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {langOpen && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-2xl border border-cappuccino/10 overflow-hidden z-50">
                {LANGUAGES.map(({ code, label }) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => { setLang(code); setLangOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors hover:bg-warm-beige ${
                      lang === code ? 'bg-warm-beige text-accent-gold font-semibold' : 'text-deep-brown'
                    }`}
                  >
                    <FlagIcon code={code} className="w-5 h-5" />
                    <span>{label}</span>
                    {lang === code && (
                      <svg className="w-3.5 h-3.5 ml-auto text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <button className={`${isScrolled ? 'text-deep-brown' : 'text-white'} md:hidden`} aria-label="Menu">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

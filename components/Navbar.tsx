
import React, { useState, useEffect } from 'react';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-warm-beige/95 backdrop-blur-sm shadow-md py-4' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <a href="#" className="flex items-center h-12 md:h-14 group [isolation:isolate]">
          <img 
            src="/lo.png" 
            alt="Cień Ducha Gór" 
            className="h-full w-auto max-w-[180px] md:max-w-[220px] object-contain object-left transition-transform duration-300 group-hover:scale-105 mix-blend-multiply"
          />
        </a>
        
        <div className={`hidden md:flex space-x-8 items-center text-sm uppercase tracking-widest font-medium ${isScrolled ? 'text-deep-brown' : 'text-white'}`}>
          <a href="#apartament" className="hover:text-accent-gold transition-colors">Apartament</a>
          <a href="#lokalizacja" className="hover:text-accent-gold transition-colors">Lokalizacja</a>
          <a href="#ksiazka" className="hover:text-accent-gold transition-colors">Książka</a>
          <a href="#rezerwacja" className="bg-deep-brown text-white px-6 py-2 rounded-full hover:bg-accent-gold transition-all duration-300 shadow-lg">
            Rezerwuj
          </a>
        </div>

        <button className={`${isScrolled ? 'text-deep-brown' : 'text-white'} md:hidden`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

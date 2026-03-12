import React from 'react';

interface TextLogoProps {
  variant?: 'light' | 'dark';
}

const TextLogo: React.FC<TextLogoProps> = ({ variant = 'light' }) => {
  const isLight = variant === 'light';

  return (
    <div className={`flex flex-col items-center justify-center transition-colors duration-500 ${isLight ? 'text-white' : 'text-[#3E2723]'}`}>
      <div className="flex flex-col items-center">
        {/* Apartamenty z podkreśleniem */}
        <span 
          className={`
            text-[9px] sm:text-[10px] md:text-[11px] 
            font-light tracking-[0.4em] uppercase 
            pb-1 border-b 
            ${isLight ? 'border-white/70' : 'border-[#3E2723]/70'} 
            mb-1.5 sm:mb-2 
            ml-[0.4em]
          `}
        >
          Apartamenty
        </span>
        
        {/* Cień Ducha Gór */}
        <span className="text-[22px] sm:text-[26px] md:text-[30px] font-serif tracking-wide leading-none">
          Cień Ducha Gór
        </span>
      </div>
    </div>
  );
};

export default TextLogo;


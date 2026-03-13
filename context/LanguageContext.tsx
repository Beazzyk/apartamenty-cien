import React, { createContext, useContext, useState } from 'react';
import { translations, Lang, Translations } from '../content/translations';

interface LangContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translations;
}

const LanguageContext = createContext<LangContextType>({
  lang: 'pl',
  setLang: () => {},
  t: translations.pl,
});

function getInitialLang(): Lang {
  try {
    const saved = localStorage.getItem('app_lang');
    if (saved === 'pl' || saved === 'cz' || saved === 'de' || saved === 'en') return saved;
  } catch {}
  return 'pl';
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(getInitialLang);

  const setLang = (l: Lang) => {
    try { localStorage.setItem('app_lang', l); } catch {}
    setLangState(l);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => useContext(LanguageContext);

import React, { useEffect, useState } from 'react';
import { useTranslation } from '../context/LanguageContext';

const STORAGE_KEY = 'cookie_consent_cienduchgor_v1';

const CookieBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) setVisible(true);
  }, []);

  const accept = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, 'accepted');
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40">
      <div className="mx-auto max-w-5xl mb-4 px-4 sm:px-6">
        <div className="bg-deep-brown text-paper-white/90 rounded-2xl shadow-2xl border border-accent-gold/30 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex-1 text-xs sm:text-sm leading-relaxed">
            <p>
              {t.cookie.text}&nbsp;
              <a href="/polityka-prywatnosci" className="underline underline-offset-2 text-accent-gold hover:text-paper-white">
                {t.cookie.linkText}
              </a>.
            </p>
          </div>
          <div className="flex-shrink-0 flex items-center gap-3">
            <button
              type="button"
              onClick={accept}
              className="px-4 sm:px-5 py-2 rounded-full bg-accent-gold text-deep-brown text-xs sm:text-sm font-semibold hover:bg-paper-white transition-colors"
            >
              {t.cookie.accept}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;

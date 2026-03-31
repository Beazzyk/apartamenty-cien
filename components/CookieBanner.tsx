import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext';
import { loadGoogleAnalytics } from '../utils/googleAnalytics';

const STORAGE_KEY = 'cookie_consent_cienduchgor_v1';

function readConsent(): 'analytics' | 'essential' | null {
  if (typeof window === 'undefined') return null;
  const v = window.localStorage.getItem(STORAGE_KEY);
  if (!v) return null;
  if (v === 'analytics' || v === 'accepted') return 'analytics';
  if (v === 'essential') return 'essential';
  return null;
}

const CookieBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const consent = readConsent();
    if (consent === 'analytics') loadGoogleAnalytics();
    if (!consent) setVisible(true);
  }, []);

  const acceptAnalytics = () => {
    window.localStorage.setItem(STORAGE_KEY, 'analytics');
    loadGoogleAnalytics();
    setVisible(false);
  };

  const essentialOnly = () => {
    window.localStorage.setItem(STORAGE_KEY, 'essential');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100]" role="dialog" aria-label={t.cookie.ariaLabel}>
      <div className="mx-auto max-w-5xl mb-4 px-4 sm:px-6">
        <div className="bg-deep-brown text-paper-white/90 rounded-2xl shadow-2xl border border-accent-gold/30 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex-1 text-xs sm:text-sm leading-relaxed">
            <p>
              {t.cookie.text}&nbsp;
              <Link
                to="/polityka-prywatnosci"
                className="underline underline-offset-2 text-accent-gold hover:text-paper-white"
              >
                {t.cookie.linkText}
              </Link>
              .
            </p>
          </div>
          <div className="flex-shrink-0 flex flex-wrap items-center gap-2 sm:gap-3 justify-end">
            <button
              type="button"
              onClick={essentialOnly}
              className="px-4 sm:px-5 py-2 rounded-full border border-accent-gold/40 text-paper-white/80 text-xs sm:text-sm font-medium hover:border-accent-gold hover:text-paper-white transition-colors"
            >
              {t.cookie.essentialOnly}
            </button>
            <button
              type="button"
              onClick={acceptAnalytics}
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

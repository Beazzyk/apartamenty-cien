import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../context/LanguageContext';

const BASE = typeof import.meta !== 'undefined' && import.meta.env && typeof import.meta.env.BASE_URL === 'string'
  ? import.meta.env.BASE_URL
  : '';

const GALLERY_IMAGES = [
  '1.jpeg',
  '2.jpeg',
  '3.jpeg',
  '4.jpeg',
  '5.jpeg',
  '6.jpeg',
  '7.jpeg',
  '8.jpeg',
  'rituals.jpeg',
  '9.jpeg',
  '12.jpeg',
  '13.jpeg',
  '14.jpeg',
  '15.jpeg',
  '17.jpeg',
  '18.jpeg',
  '20.jpeg',
  '21.jpeg',
  '22.jpeg',
  '23.jpeg',
  '24.jpeg',
  '25.jpeg',
  '26.jpeg',
  '27.jpeg',
];
const N = GALLERY_IMAGES.length;

const Gallery: React.FC = () => {
  const { t } = useTranslation();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const goPrev = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i - 1 + N) % N));
  }, []);
  const goNext = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i + 1) % N));
  }, []);
  const close = useCallback(() => setLightboxIndex(null), []);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex, close, goPrev, goNext]);

  return (
    <section id="galeria" className="py-16 sm:py-20 md:py-24 bg-warm-beige overflow-hidden">
      <div className="container mx-auto px-3 sm:px-4 max-w-6xl">
        <div className="text-center mb-10 scroll-reveal">
          <span className="text-accent-gold uppercase tracking-[0.4em] text-xs font-bold mb-2 block">{t.gallery.label}</span>
          <h2 className="font-serif text-4xl md:text-5xl text-deep-brown mb-4">{t.gallery.heading}</h2>
          <div className="w-24 h-px bg-accent-gold mx-auto" />
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1.5 sm:gap-2">
          {GALLERY_IMAGES.map((filename, i) => (
            <button
              key={filename}
              type="button"
              onClick={() => setLightboxIndex(i)}
              className="relative overflow-hidden group scroll-reveal rounded-lg shadow-md border border-cappuccino/10 bg-deep-brown/5 text-left focus:outline-none focus:ring-2 focus:ring-accent-gold focus:ring-offset-2"
              style={{ aspectRatio: '1' }}
            >
              <img
                src={`${BASE}${filename}`}
                alt={`Apartament Cień Ducha Gór – zdjęcie ${i + 1}`}
                className="block w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-deep-brown/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" aria-hidden />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Podgląd zdjęcia"
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); close(); }}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="Zamknij"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="Poprzednie zdjęcie"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <img
            src={`${BASE}${GALLERY_IMAGES[lightboxIndex]}`}
            alt={`Apartament Cień Ducha Gór – zdjęcie ${lightboxIndex + 1}`}
            className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded"
            onClick={(e) => e.stopPropagation()}
            draggable={false}
          />

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="Następne zdjęcie"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm">
            {lightboxIndex + 1} / {N}
          </span>
        </div>
      )}
    </section>
  );
};

export default Gallery;



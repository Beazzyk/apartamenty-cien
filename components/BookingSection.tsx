import React, { useState, useCallback } from 'react';
import AvailabilityCalendar from './AvailabilityCalendar';
import { createBooking } from '../lib/api';
import { useTranslation } from '../context/LanguageContext';

type BookingStatus = 'idle' | 'submitting' | 'success' | 'error';

const BookingSection: React.FC = () => {
  const { t } = useTranslation();
  const b = t.booking;

  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [guests, setGuests] = useState(2);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [pricePerNight, setPricePerNight] = useState(450);
  const [status, setStatus] = useState<BookingStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedDates, setSubmittedDates] = useState<{ checkIn: string; checkOut: string } | null>(null);

  const handleRangeChange = useCallback((from: string | null, to: string | null) => {
    setCheckIn(from);
    setCheckOut(to);
  }, []);

  const nights = checkIn && checkOut
    ? Math.ceil((new Date(checkOut + 'T00:00:00').getTime() - new Date(checkIn + 'T00:00:00').getTime()) / 86_400_000)
    : 0;

  const totalPrice = nights * pricePerNight;

  const canSubmit =
    checkIn && checkOut && nights > 0 && guestName.trim() && guestEmail.trim() && status !== 'submitting';

  const guestLabel = (n: number) =>
    n === 1 ? `1 ${b.person1}` : n < 5 ? `${n} ${b.person234}` : `${n} ${b.person5}`;

  const nightLabel = (n: number) =>
    n === 1 ? b.nightSingular : n < 5 ? b.nightFew : b.nightMany;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !checkIn || !checkOut) return;

    setStatus('submitting');
    setErrorMsg('');

    try {
      await createBooking({
        guest_name: guestName,
        guest_email: guestEmail,
        guest_phone: guestPhone || undefined,
        check_in: checkIn,
        check_out: checkOut,
        guests_count: guests,
      });

      setSubmittedDates({ checkIn, checkOut });
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Wystąpił błąd. Spróbuj ponownie.');
    }
  };

  const resetForm = () => {
    setCheckIn(null);
    setCheckOut(null);
    setGuests(2);
    setGuestName('');
    setGuestEmail('');
    setGuestPhone('');
    setStatus('idle');
    setErrorMsg('');
    setSubmittedDates(null);
  };

  // --- Success screen ---
  if (status === 'success' && submittedDates) {
    return (
      <section id="rezerwacja" className="py-24 bg-paper-white relative">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center scroll-reveal active">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-200">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-serif text-4xl text-deep-brown mb-4">{b.successTitle}</h2>
            <p className="text-lg text-deep-brown/70 mb-2">{b.successSub}</p>
            <p className="text-sm text-deep-brown/50 mb-8">{b.successEmail}</p>

            <div className="bg-warm-beige rounded-xl p-8 mb-8 text-left max-w-md mx-auto">
              <p className="text-xs uppercase tracking-widest text-accent-gold font-bold mb-4">{b.yourQuery}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-deep-brown/60">{b.arrival}</span>
                  <span className="font-medium text-deep-brown">{formatDatePL(submittedDates.checkIn)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-deep-brown/60">{b.departure}</span>
                  <span className="font-medium text-deep-brown">{formatDatePL(submittedDates.checkOut)}</span>
                </div>
              </div>
              <div className="border-t border-cappuccino/20 mt-4 pt-4">
                <p className="text-xs uppercase tracking-widest text-accent-gold font-bold mb-3">{b.whatsNext}</p>
                <ol className="text-sm text-deep-brown/70 space-y-2 list-decimal list-inside">
                  {b.nextSteps.map((step, i) => <li key={i}>{step}</li>)}
                </ol>
              </div>
            </div>

            <button onClick={resetForm} className="text-accent-gold hover:text-deep-brown transition-colors underline underline-offset-4 text-sm">
              {b.newQuery}
            </button>
          </div>
        </div>
      </section>
    );
  }

  // --- Main booking form ---
  return (
    <section id="rezerwacja" className="py-16 sm:py-20 md:py-24 bg-paper-white relative">
      <div className="container mx-auto px-3 sm:px-6">
        <div className="max-w-6xl mx-auto">

          {/* Row 1: Calendar + Form */}
          <div className="bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] rounded-2xl overflow-hidden border border-cappuccino/20 flex flex-col lg:flex-row">

            {/* Left: Calendar + dates */}
            <div className="w-full lg:w-1/2 p-6 sm:p-10 lg:p-16 scroll-reveal">
              <h2 className="font-serif text-3xl sm:text-4xl text-deep-brown mb-4">{b.heading}</h2>
              <p className="text-deep-brown/60 mb-8 sm:mb-10 uppercase tracking-widest text-xs">{b.directLabel}</p>

              <AvailabilityCalendar
                checkIn={checkIn}
                checkOut={checkOut}
                onRangeChange={handleRangeChange}
                onPriceUpdate={setPricePerNight}
              />

              {checkIn && (
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex-1 bg-warm-beige rounded-lg py-3 px-4 text-center">
                    <div className="text-[10px] uppercase tracking-wider text-accent-gold font-semibold">{b.arrival}</div>
                    <div className="font-serif text-deep-brown text-lg mt-1">{formatDatePL(checkIn)}</div>
                  </div>
                  <svg className="w-5 h-5 text-cappuccino flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  <div className="flex-1 bg-warm-beige rounded-lg py-3 px-4 text-center">
                    <div className="text-[10px] uppercase tracking-wider text-accent-gold font-semibold">{b.departure}</div>
                    <div className="font-serif text-deep-brown text-lg mt-1">{checkOut ? formatDatePL(checkOut) : '—'}</div>
                  </div>
                </div>
              )}

              <div className="mt-8 flex items-center justify-center space-x-4">
                <span className="h-px w-12 bg-cappuccino/30"></span>
                <span className="text-xs uppercase text-deep-brown/40">{b.orThrough}</span>
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
                  <span>{b.bookViaBooking}</span>
                </a>
              </div>
            </div>

            {/* Right: Form */}
            <div className="w-full lg:w-1/2 bg-warm-beige/50 p-6 sm:p-10 lg:p-16 border-t lg:border-t-0 lg:border-l border-cappuccino/10 scroll-reveal">
              <form className="space-y-8" onSubmit={handleSubmit}>
                <div className="flex flex-col space-y-2">
                  <label className="text-xs uppercase font-semibold text-accent-gold">{b.guestsLabel}</label>
                  <select
                    className="p-4 border border-cappuccino/30 rounded-lg focus:ring-2 focus:ring-cappuccino focus:outline-none bg-white"
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                  >
                    {[1,2,3,4,5,6].map(n => (
                      <option key={n} value={n}>{guestLabel(n)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="text-xs uppercase font-semibold text-accent-gold mb-3">{b.contactLabel}</p>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder={b.namePlaceholder}
                      className="w-full p-4 border border-cappuccino/30 rounded-lg focus:ring-2 focus:ring-cappuccino focus:outline-none bg-white"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      required
                    />
                    <input
                      type="email"
                      placeholder={b.emailPlaceholder}
                      className="w-full p-4 border border-cappuccino/30 rounded-lg focus:ring-2 focus:ring-cappuccino focus:outline-none bg-white"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      required
                    />
                    <input
                      type="tel"
                      placeholder={b.phonePlaceholder}
                      className="w-full p-4 border border-cappuccino/30 rounded-lg focus:ring-2 focus:ring-cappuccino focus:outline-none bg-white"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                    />
                  </div>
                </div>

                {nights > 0 && (
                  <div className="bg-white rounded-xl p-5 border border-cappuccino/10">
                    <div className="flex justify-between text-sm text-deep-brown/60">
                      <span>{pricePerNight} PLN × {nights} {nightLabel(nights)}</span>
                      <span>{totalPrice} PLN</span>
                    </div>
                    <div className="flex justify-between items-end pt-3 mt-3 border-t border-cappuccino/20">
                      <span className="text-xs uppercase tracking-wide text-deep-brown/50">{b.estimate}</span>
                      <span className="text-3xl font-serif text-deep-brown">{totalPrice} PLN</span>
                    </div>
                  </div>
                )}

                <div className="pt-6">
                  <div className="flex justify-between items-end mb-6">
                    <span className="text-sm text-deep-brown/60 uppercase tracking-wide">{b.priceFrom}</span>
                    <span className="text-3xl font-serif text-deep-brown">{pricePerNight} PLN <span className="text-sm font-sans font-light">{b.perNight}</span></span>
                  </div>

                  {status === 'error' && errorMsg && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm mb-4">
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className={`w-full py-5 rounded-full text-lg font-medium transition-all duration-300 shadow-lg active:scale-95 ${
                      canSubmit
                        ? 'bg-deep-brown text-white hover:bg-accent-gold cursor-pointer'
                        : 'bg-cappuccino/30 text-deep-brown/30 cursor-not-allowed'
                    }`}
                  >
                    {status === 'submitting' ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {b.submittingBtn}
                      </span>
                    ) : (
                      b.submitBtn
                    )}
                  </button>

                  <p className="text-center text-xs text-deep-brown/40 mt-3">{b.afterSend}</p>

                  <div className="mt-6 pt-5 border-t border-cappuccino/20">
                    <p className="text-xs uppercase tracking-widest text-accent-gold font-bold mb-3">{b.pricingLabel}</p>
                    <ul className="text-sm text-deep-brown/70 space-y-1.5 mb-4">
                      <li>{b.pricingOff}</li>
                      <li>{b.pricingOn}</li>
                      <li>{b.pricingHoliday}</li>
                    </ul>
                    <p className="text-xs uppercase tracking-widest text-accent-gold font-bold mb-3">{b.rulesLabel}</p>
                    <ul className="text-sm text-deep-brown/60 space-y-1.5">
                      <li>{b.ruleHours}</li>
                      <li><strong>{b.ruleNoSmoking}</strong></li>
                      <li><strong>{b.ruleNoPets}</strong></li>
                      <li><strong>{b.ruleNoParties}</strong></li>
                      <li>{b.ruleDeposit}</li>
                    </ul>
                    <p className="text-sm text-deep-brown/70 mt-4 pt-4 border-t border-cappuccino/15 italic">
                      {b.peaceNote}
                    </p>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Row 2: Info cards */}
          <div className="mt-10 bg-warm-beige rounded-2xl p-12 lg:p-16 border border-cappuccino/10 scroll-reveal">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="flex space-x-6">
                <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center text-accent-gold shadow-md">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div>
                  <h4 className="font-serif text-xl mb-1">{b.guaranteeTitle}</h4>
                  <p className="text-deep-brown/60 text-sm">{b.guaranteeDesc}</p>
                </div>
              </div>

              <div className="flex space-x-6">
                <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center text-accent-gold shadow-md">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div>
                  <h4 className="font-serif text-xl mb-1">{b.syncTitle}</h4>
                  <p className="text-deep-brown/60 text-sm">{b.syncDesc}</p>
                </div>
              </div>

              <div className="flex space-x-6">
                <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center text-accent-gold shadow-md">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div>
                  <h4 className="font-serif text-xl mb-1">{b.contactTitle}</h4>
                  <p className="text-deep-brown/60 text-sm">{b.contactDesc}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

function formatDatePL(dateStr: string): string {
  const months = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];
  const [y, m, d] = dateStr.split('-');
  return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
}

export default BookingSection;

import React, { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  fetchManageBookingPreview,
  postManageBookingAction,
  type ManageBookingGuestPreview,
} from '../lib/manageBooking';
import { useTranslation } from '../context/LanguageContext';

type Phase =
  | { kind: 'landing' }
  | { kind: 'loading' }
  | { kind: 'bad_link' }
  | { kind: 'error'; message: string }
  | { kind: 'preview'; token: string; booking: ManageBookingGuestPreview }
  | { kind: 'already'; status: string; booking: ManageBookingGuestPreview }
  | { kind: 'done'; title: string; message: string; variant: 'success' | 'info' };

function formatDatePL(dateStr: string): string {
  const months = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];
  const [y, m, d] = dateStr.split('-');
  return `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1]} ${y}`;
}

const ManageBookingPage: React.FC = () => {
  const { t } = useTranslation();
  const m = t.manageBooking;

  const [searchParams] = useSearchParams();
  const actionParam = searchParams.get('action');
  const token = searchParams.get('token');

  const [phase, setPhase] = useState<Phase>({ kind: 'loading' });
  const [submitting, setSubmitting] = useState(false);

  const resolveLoadError = useCallback(
    (error: string, message?: string) => {
      if (error === 'network') return m.errorNetwork;
      if (error === 'unauthorized') return m.errorUnauthorized;
      return message ?? m.errorServer;
    },
    [m],
  );

  const load = useCallback(async () => {
    if (!token) {
      if (actionParam) {
        setPhase({ kind: 'bad_link' });
      } else {
        setPhase({ kind: 'landing' });
      }
      return;
    }

    setPhase({ kind: 'loading' });
    const data = await fetchManageBookingPreview(token);

    if (!data.ok) {
      setPhase({
        kind: 'error',
        message: resolveLoadError(data.error, data.message),
      });
      return;
    }

    if (data.state === 'already_processed') {
      setPhase({ kind: 'already', status: data.status, booking: data.booking });
      return;
    }

    setPhase({
      kind: 'preview',
      token,
      booking: data.booking,
    });
  }, [token, actionParam, resolveLoadError]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleAction = async (action: 'confirm' | 'cancel') => {
    if (phase.kind !== 'preview') return;
    setSubmitting(true);
    const res = await postManageBookingAction(action, phase.token);
    setSubmitting(false);

    if (!res.ok) {
      const err = res.error;
      const msg =
        err === 'network'
          ? m.errorNetwork
          : err === 'unauthorized'
            ? m.errorUnauthorized
            : res.message ?? m.errorServer;
      setPhase({
        kind: 'error',
        message: msg,
      });
      return;
    }

    setPhase({
      kind: 'done',
      title: res.title,
      message: res.message,
      variant: res.variant,
    });
  };

  return (
    <div className="min-h-screen bg-warm-beige font-sans text-deep-brown flex flex-col">
      <header className="border-b border-cappuccino/20 bg-[#FDFBF7]/90 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-5 flex justify-between items-center">
          <Link to="/" className="font-serif text-xl text-deep-brown hover:text-accent-gold transition-colors">
            {m.brandHome}
          </Link>
          <Link
            to="/"
            className="text-sm text-deep-brown/70 hover:text-deep-brown border border-cappuccino/30 rounded-full px-4 py-2"
          >
            {m.home}
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg">
          {phase.kind === 'landing' && (
            <div className="bg-[#FDFBF7] border border-cappuccino/30 rounded-2xl p-8 md:p-10 shadow-xl shadow-black/5 text-left">
              <p className="text-[11px] uppercase tracking-[0.2em] text-accent-gold font-bold mb-3">{m.previewBadge}</p>
              <h1 className="font-serif text-2xl md:text-3xl text-deep-brown mb-4">{m.landingTitle}</h1>
              <p className="text-deep-brown/80 text-sm leading-relaxed mb-6">{m.landingIntro}</p>
              <ul className="space-y-3 text-sm text-deep-brown/75 leading-relaxed list-disc pl-5 marker:text-accent-gold">
                <li>{m.landingBullet1}</li>
                <li>{m.landingBullet2}</li>
                <li>{m.landingBullet3}</li>
              </ul>
              <p className="mt-8 text-xs text-deep-brown/50 border-t border-cappuccino/20 pt-6">
                {m.stepHintTitle}: {m.stepHintBody}
              </p>
              <Link
                to="/#rezerwacja"
                className="inline-block mt-6 px-8 py-3 rounded-full bg-deep-brown text-[#FDFBF7] text-sm font-medium hover:bg-accent-gold hover:text-deep-brown transition-colors"
              >
                {t.booking.heading}
              </Link>
            </div>
          )}

          {phase.kind === 'loading' && (
            <div className="text-center text-deep-brown/60">{m.loading}</div>
          )}

          {phase.kind === 'bad_link' && (
            <ResultCard variant="error" title={m.badLinkTitle}>
              <p className="text-deep-brown/80">{m.badLinkBody}</p>
            </ResultCard>
          )}

          {phase.kind === 'error' && (
            <ResultCard variant="error" title={m.errorTitle}>
              <p className="text-deep-brown/80">{phase.message}</p>
              <p className="text-sm text-deep-brown/50 mt-4">{m.errorHint}</p>
            </ResultCard>
          )}

          {phase.kind === 'already' && (
            <ResultCard variant={phase.status === 'confirmed' ? 'success' : 'info'} title={m.alreadyTitle}>
              <BookingDetails
                b={phase.booking}
                guestLabel={m.guestLabel}
                datesLabel={m.datesLabel}
                guestsShortLabel={m.guestsShortLabel}
                amountLabel={m.amountLabel}
              />
              <p className="text-deep-brown/80 mt-4">
                {m.statusLabel}:{' '}
                <strong>
                  {phase.status === 'confirmed'
                    ? m.statusConfirmed
                    : phase.status === 'cancelled'
                      ? m.statusCancelled
                      : phase.status}
                </strong>
                .
              </p>
            </ResultCard>
          )}

          {phase.kind === 'preview' && (
            <div className="bg-[#FDFBF7] border border-cappuccino/30 rounded-2xl p-8 md:p-10 shadow-xl shadow-black/5">
              <p className="text-[11px] uppercase tracking-[0.2em] text-accent-gold font-bold mb-2">{m.previewBadge}</p>
              <h1 className="font-serif text-2xl md:text-3xl text-deep-brown mb-2">{m.reviewHeading}</h1>

              <div
                className="mb-6 rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-deep-brown/90 leading-relaxed"
                role="status"
              >
                <p className="font-semibold text-deep-brown mb-1">{m.stepHintTitle}</p>
                <p>{m.stepHintBody}</p>
              </div>

              <p className="text-deep-brown/70 text-sm mb-6 leading-relaxed">{m.reviewIntro}</p>

              <BookingDetails
                b={phase.booking}
                guestLabel={m.guestLabel}
                datesLabel={m.datesLabel}
                guestsShortLabel={m.guestsShortLabel}
                amountLabel={m.amountLabel}
              />

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => void handleAction('confirm')}
                  disabled={submitting}
                  className="w-full py-4 rounded-full text-white font-semibold text-sm tracking-wide transition-opacity disabled:opacity-60 bg-green-600 hover:bg-green-700"
                >
                  {submitting ? m.btnWorking : m.btnConfirm}
                </button>
                <button
                  type="button"
                  onClick={() => void handleAction('cancel')}
                  disabled={submitting}
                  className="w-full py-4 rounded-full text-white font-semibold text-sm tracking-wide transition-opacity disabled:opacity-60 bg-red-500 hover:bg-red-600"
                >
                  {submitting ? m.btnWorking : m.btnReject}
                </button>
              </div>
            </div>
          )}

          {phase.kind === 'done' && (
            <ResultCard variant={phase.variant} title={phase.title}>
              <p className="text-deep-brown/85 leading-relaxed whitespace-pre-line">{phase.message}</p>
              <p className="text-sm text-deep-brown/70 mt-4 pt-4 border-t border-cappuccino/20">{m.doneSystemNote}</p>
            </ResultCard>
          )}
        </div>
      </main>
    </div>
  );
};

function BookingDetails({
  b,
  guestLabel,
  datesLabel,
  guestsShortLabel,
  amountLabel,
}: {
  b: ManageBookingGuestPreview;
  guestLabel: string;
  datesLabel: string;
  guestsShortLabel: string;
  amountLabel: string;
}) {
  return (
    <div className="bg-warm-beige/80 rounded-xl p-5 text-left text-sm space-y-2 border border-cappuccino/15">
      <div className="flex justify-between gap-4">
        <span className="text-deep-brown/55">{guestLabel}</span>
        <span className="font-medium text-deep-brown text-right">{b.guest_name}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-deep-brown/55">{datesLabel}</span>
        <span className="font-medium text-deep-brown text-right">
          {formatDatePL(b.check_in)} – {formatDatePL(b.check_out)}
        </span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-deep-brown/55">{guestsShortLabel}</span>
        <span className="font-medium text-deep-brown">{b.guests_count}</span>
      </div>
      <div className="flex justify-between gap-4 pt-2 border-t border-cappuccino/20">
        <span className="text-deep-brown/55">{amountLabel}</span>
        <span className="font-semibold text-accent-gold">{b.total_price} PLN</span>
      </div>
    </div>
  );
}

function ResultCard({
  variant,
  title,
  children,
}: {
  variant: 'success' | 'info' | 'error';
  title: string;
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  const m = t.manageBooking;
  const ring =
    variant === 'success'
      ? 'border-green-200 bg-green-50/80'
      : variant === 'info'
        ? 'border-cappuccino/30 bg-[#FDFBF7]'
        : 'border-red-200 bg-red-50/80';
  const icon =
    variant === 'success' ? (
      <span className="text-green-600 text-2xl">✓</span>
    ) : variant === 'info' ? (
      <span className="text-accent-gold text-2xl">i</span>
    ) : (
      <span className="text-red-500 text-2xl">!</span>
    );

  return (
    <div className={`rounded-2xl p-8 md:p-10 border text-center ${ring}`}>
      <div className="w-14 h-14 rounded-full bg-white/80 border border-black/5 flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <p className="text-[11px] uppercase tracking-[0.2em] text-accent-gold font-bold mb-2">{m.brandHome}</p>
      <h1 className="font-serif text-2xl text-deep-brown mb-4">{title}</h1>
      <div className="text-left">{children}</div>
      <Link
        to="/"
        className="inline-block mt-8 px-8 py-3 rounded-full bg-deep-brown text-[#FDFBF7] text-sm font-medium hover:bg-accent-gold hover:text-deep-brown transition-colors"
      >
        {m.home}
      </Link>
    </div>
  );
}

export default ManageBookingPage;

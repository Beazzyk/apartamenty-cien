import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DayPicker, type DateRange } from 'react-day-picker';
import { pl } from 'react-day-picker/locale';
import 'react-day-picker/style.css';
import { checkAvailability } from '../lib/api';

interface Props {
  checkIn: string | null;
  checkOut: string | null;
  onRangeChange: (from: string | null, to: string | null) => void;
  onPriceUpdate: (price: number) => void;
}

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

const AvailabilityCalendar: React.FC<Props> = ({ checkIn, checkOut, onRangeChange, onPriceUpdate }) => {
  const today = useRef((() => { const d = new Date(); d.setHours(0,0,0,0); return d; })());

  const [pendingDates, setPendingDates]     = useState<Date[]>([]);
  const [confirmedDates, setConfirmedDates] = useState<Date[]>([]);
  const [blockedDates, setBlockedDates]     = useState<Date[]>([]);
  const [loading, setLoading]               = useState(false);
  const [pricePerNight, setPricePerNight]   = useState(450);
  const [displayMonth, setDisplayMonth]     = useState(today.current);

  const fetchData = useCallback(async (month: Date) => {
    setLoading(true);
    try {
      const y = month.getFullYear();
      const m = month.getMonth();
      const from = `${y}-${String(m + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(y, m + 1, 0).getDate();
      const to = `${y}-${String(m + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      const data = await checkAvailability(from, to);
      setPendingDates(data.pending_dates.map(parseDate));
      setConfirmedDates(data.confirmed_dates.map(parseDate));
      setBlockedDates(data.blocked_dates.map(parseDate));
      setPricePerNight(data.price_per_night);
      onPriceUpdate(data.price_per_night);
    } catch {
      // keep showing previous
    } finally {
      setLoading(false);
    }
  }, [onPriceUpdate]);

  useEffect(() => {
    fetchData(displayMonth);
  }, [displayMonth, fetchData]);

  const allUnavailable = [...pendingDates, ...confirmedDates, ...blockedDates];

  const selected: DateRange | undefined =
    checkIn ? { from: parseDate(checkIn), to: checkOut ? parseDate(checkOut) : undefined } : undefined;

  const handleSelect = (range: DateRange | undefined) => {
    if (typeof onRangeChange !== 'function') return;
    if (!range) {
      onRangeChange(null, null);
    } else {
      onRangeChange(
        range.from ? toDateStr(range.from) : null,
        range.to ? toDateStr(range.to) : null,
      );
    }
  };

  const modifiers = {
    pending:   (day: Date) => pendingDates.some(d => sameDay(d, day)),
    confirmed: (day: Date) => confirmedDates.some(d => sameDay(d, day)),
    blocked:   (day: Date) => blockedDates.some(d => sameDay(d, day)),
    available: (day: Date) =>
      day >= today.current &&
      !allUnavailable.some(d => sameDay(d, day)),
  };

  const modifiersClassNames = {
    pending:   'day-pending',
    confirmed: 'day-confirmed',
    blocked:   'day-blocked',
    available: 'day-available',
  };

  return (
    <div className="calendar-wrapper rounded-xl border border-cappuccino/20 bg-paper-white p-3 sm:p-4 relative overflow-x-auto">
      {loading && (
        <div className="absolute top-3 right-3 z-10">
          <span className="w-4 h-4 border-2 border-accent-gold/40 border-t-accent-gold rounded-full animate-spin inline-block" />
        </div>
      )}
      <DayPicker
        mode="range"
        locale={pl}
        selected={selected}
        onSelect={handleSelect}
        month={displayMonth}
        onMonthChange={setDisplayMonth}
        disabled={[
          { before: today.current },
          ...allUnavailable,
        ]}
        modifiers={modifiers}
        modifiersClassNames={modifiersClassNames}
        fixedWeeks
        showOutsideDays
        startMonth={today.current}
      />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-2 px-1 text-[10px] text-deep-brown/50 uppercase tracking-wider">
        <span className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-accent-gold inline-block" /> Wybrany
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400/70 inline-block" /> Wolny
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-400/80 inline-block" /> Oczekuje
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-400/80 inline-block" /> Zarezerwowany
          </span>
        </span>
        <span className="shrink-0 text-right sm:text-left">{pricePerNight} PLN/noc</span>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;

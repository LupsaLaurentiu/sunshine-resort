"use client";

import { BookingDateRangePicker } from "./BookingDateRangePicker";

type AvailabilitySearchProps = {
  checkIn: string;
  checkOut: string;
  onCheckInChange: (value: string) => void;
  onCheckOutChange: (value: string) => void;
  onSearch: () => void | Promise<void>;
  isLoading?: boolean;
};

export function AvailabilitySearch({
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
  onSearch,
  isLoading = false,
}: AvailabilitySearchProps) {
  return (
    <section className="border border-white/10 bg-[#0b0b0b] p-8 md:p-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <BookingDateRangePicker
          checkIn={checkIn}
          checkOut={checkOut}
          onCheckInChange={onCheckInChange}
          onCheckOutChange={onCheckOutChange}
        />

        <button
          type="button"
          onClick={() => void onSearch()}
          disabled={isLoading}
          className="min-h-14 bg-gold px-10 text-xs font-semibold uppercase tracking-[0.3em] text-black transition hover:bg-white disabled:cursor-wait disabled:opacity-50"
        >
          {isLoading
            ? "Se verifică..."
            : "Verifică disponibilitatea"}
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-xs text-white/40">
        <span>
          Pentru check-in vineri sau sâmbătă, sejurul minim este de 2 nopți
        </span>

        <span>În rest, se poate rezerva și o singură noapte</span>

        <span>Adults only</span>

        <span>Check-in: 14:00</span>

        <span>Check-out: 10:00</span>
      </div>
    </section>
  );
}
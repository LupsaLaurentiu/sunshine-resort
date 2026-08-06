"use client";

import {
  Check,
  Clock3,
  Users,
} from "lucide-react";

import {
  usePathname,
} from "next/navigation";

import {
  BookingDateRangePicker,
} from "./BookingDateRangePicker";

import {
  getLocaleFromPathname,
} from "@/lib/public-routes";

type AvailabilitySearchProps = {
  checkIn: string;
  checkOut: string;

  onCheckInChange: (
    value: string,
  ) => void;

  onCheckOutChange: (
    value: string,
  ) => void;

  onSearch: () =>
    | void
    | Promise<void>;

  isLoading?: boolean;
};

const AVAILABILITY_SEARCH_CONTENT = {
  ro: {
    search:
      "Verifică disponibilitatea",

    searching:
      "Se verifică...",

    weekendRule:
      "Minimum 2 nopți (vin.–sâm.)",

    weekdayRule:
      "Minimum 1 noapte (dum.–joi)",

    adultsOnly:
      "Adults Only",

    checkIn:
      "Check-in 14:00",

    checkOut:
      "Check-out 10:00",
  },

  en: {
    search:
      "Check availability",

    searching:
      "Checking...",

    weekendRule:
      "Mininmum 2 nights (Fri–Sat)",

    weekdayRule:
      "Mininmum 1 night (Sun–Thu)",

    adultsOnly:
      "Adults Only",

    checkIn:
      "Check-in 14:00",

    checkOut:
      "Check-out 10:00",
  },
} as const;

export function AvailabilitySearch({
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
  onSearch,
  isLoading = false,
}: AvailabilitySearchProps) {
  const pathname =
    usePathname();

  const locale =
    getLocaleFromPathname(
      pathname,
    );

  const content =
    AVAILABILITY_SEARCH_CONTENT[
      locale
    ];

  return (
    <section className="relative overflow-hidden border border-white/10 bg-[#0b0b0b] px-6 py-8 text-[#f5f2eb] sm:px-8 sm:py-9 md:px-10">
      <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 translate-x-1/3 -translate-y-1/3 rounded-full bg-gold/[0.02] blur-3xl" />

      <div className="relative">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <BookingDateRangePicker
            checkIn={
              checkIn
            }
            checkOut={
              checkOut
            }
            onCheckInChange={
              onCheckInChange
            }
            onCheckOutChange={
              onCheckOutChange
            }
          />

          <button
            type="button"
            onClick={() =>
              void onSearch()
            }
            disabled={
              isLoading
            }
            className="inline-flex min-h-[58px] items-center justify-center border border-gold bg-gold px-9 py-4 text-[9px] font-semibold uppercase tracking-[0.31em] text-black transition duration-500 hover:border-white hover:bg-white disabled:cursor-wait disabled:opacity-50 sm:px-11 sm:text-[10px]"
          >
            {isLoading
              ? content.searching
              : content.search}
          </button>
        </div>

        <div className="mt-7 grid gap-4 pt-6 sm:grid-cols-2 lg:grid-cols-5">
          <div className="flex items-center gap-3 whitespace-nowrap">
            <Check className="h-3.5 w-3.5 shrink-0 text-gold" />

            <span className="text-[10px] text-white/40">
              {content.weekendRule}
            </span>
          </div>

          <div className="flex items-center gap-3 whitespace-nowrap">
            <Check className="h-3.5 w-3.5 shrink-0 text-gold" />

            <span className="text-[10px] text-white/40">
              {content.weekdayRule}
            </span>
          </div>

          <div className="flex items-center gap-3 whitespace-nowrap">
            <Users className="h-3.5 w-3.5 shrink-0 text-gold" />

            <span className="text-[10px] text-white/40">
              {content.adultsOnly}
            </span>
          </div>

          <div className="flex items-center gap-3 whitespace-nowrap">
            <Clock3 className="h-3.5 w-3.5 shrink-0 text-gold" />

            <span className="text-[10px] text-white/40">
              {content.checkIn}
            </span>
          </div>

          <div className="flex items-center gap-3 whitespace-nowrap">
            <Clock3 className="h-3.5 w-3.5 shrink-0 text-gold" />

            <span className="text-[10px] text-white/40">
              {content.checkOut}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
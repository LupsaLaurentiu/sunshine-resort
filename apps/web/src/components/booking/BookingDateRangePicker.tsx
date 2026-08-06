"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  addDays,
  differenceInCalendarDays,
  format,
  startOfDay,
} from "date-fns";

import {
  enUS,
  ro,
} from "date-fns/locale";

import {
  CalendarDays,
  Check,
} from "lucide-react";

import {
  usePathname,
} from "next/navigation";

import type {
  DateRange,
} from "react-day-picker";

import {
  Calendar,
} from "@/components/ui/calendar";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  getLocaleFromPathname,
} from "@/lib/public-routes";

type BookingDateRangePickerProps = {
  checkIn: string;
  checkOut: string;
  onCheckInChange: (
    value: string,
  ) => void;
  onCheckOutChange: (
    value: string,
  ) => void;
};

const BOOKING_DATE_CONTENT = {
  ro: {
    label:
      "Perioada sejurului",

    selectPeriod:
      "Selectează perioada",

    selectDeparture:
      "Selectează plecarea",

    oneNight:
      "1 noapte",

    multipleNights:
      "nopți",

    weekdayPolicy:
      "Pentru sosirile de duminică până joi poți rezerva începând de la o singură noapte.",

    weekendPolicy:
      "Pentru check-in vineri sau sâmbătă, sejurul minim este de 2 nopți.",

    minimumOneNightError:
      "Selectează cel puțin o noapte.",

    minimumTwoNightsError:
      "Pentru sosirile de vineri sau sâmbătă trebuie selectate minimum 2 nopți.",

    calendarAriaLabel:
      "Deschide calendarul pentru selectarea perioadei sejurului",
  },

  en: {
    label:
      "Stay dates",

    selectPeriod:
      "Select your dates",

    selectDeparture:
      "Select check-out",

    oneNight:
      "1 night",

    multipleNights:
      "nights",

    weekdayPolicy:
      "For arrivals from Sunday to Thursday, stays can begin from one night.",

    weekendPolicy:
      "For check-in on Friday or Saturday, the minimum stay is 2 nights.",

    minimumOneNightError:
      "Select at least one night.",

    minimumTwoNightsError:
      "For arrivals on Friday or Saturday, a minimum stay of 2 nights is required.",

    calendarAriaLabel:
      "Open the calendar to select your stay dates",
  },
} as const;

function parseLocalDate(
  value: string,
): Date | undefined {
  if (!value) {
    return undefined;
  }

  const [
    year,
    month,
    day,
  ] =
    value
      .split("-")
      .map(Number);

  if (
    !year ||
    !month ||
    !day
  ) {
    return undefined;
  }

  const date =
    new Date(
      year,
      month - 1,
      day,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return undefined;
  }

  return date;
}

function formatDateForState(
  date: Date,
): string {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1,
    ).padStart(
      2,
      "0",
    );

  const day =
    String(
      date.getDate(),
    ).padStart(
      2,
      "0",
    );

  return `${year}-${month}-${day}`;
}

function getMinimumNights(
  checkIn: Date,
): number {
  const dayOfWeek =
    checkIn.getDay();

  const isFridayOrSaturday =
    dayOfWeek === 5 ||
    dayOfWeek === 6;

  return isFridayOrSaturday
    ? 2
    : 1;
}

export function BookingDateRangePicker({
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
}: BookingDateRangePickerProps) {
  const pathname =
    usePathname();

  const locale =
    getLocaleFromPathname(
      pathname,
    );

  const content =
    BOOKING_DATE_CONTENT[
      locale
    ];

  const calendarLocale =
    locale === "ro"
      ? ro
      : enUS;

  const [
    open,
    setOpen,
  ] =
    useState(false);

  const [
    isDesktop,
    setIsDesktop,
  ] =
    useState(false);

  const [
    tomorrow,
    setTomorrow,
  ] =
    useState<Date | null>(
      null,
    );

  const [
    selectionError,
    setSelectionError,
  ] =
    useState("");

  const selectedRange:
    | DateRange
    | undefined =
    useMemo(() => {
      const from =
        parseLocalDate(
          checkIn,
        );

      const to =
        parseLocalDate(
          checkOut,
        );

      if (
        !from &&
        !to
      ) {
        return undefined;
      }

      return {
        from,
        to,
      };
    }, [
      checkIn,
      checkOut,
    ]);

  const selectedNights =
    useMemo(() => {
      if (
        !selectedRange?.from ||
        !selectedRange.to
      ) {
        return 0;
      }

      return differenceInCalendarDays(
        selectedRange.to,
        selectedRange.from,
      );
    }, [
      selectedRange,
    ]);

  useEffect(() => {
    setTomorrow(
      addDays(
        startOfDay(
          new Date(),
        ),
        1,
      ),
    );

    const mediaQuery =
      window.matchMedia(
        "(min-width: 768px)",
      );

    function updateViewport() {
      setIsDesktop(
        mediaQuery.matches,
      );
    }

    updateViewport();

    mediaQuery.addEventListener(
      "change",
      updateViewport,
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        updateViewport,
      );
    };
  }, []);

  function handleSelect(
    range:
      | DateRange
      | undefined,
  ) {
    setSelectionError("");

    if (!range?.from) {
      onCheckInChange("");
      onCheckOutChange("");

      return;
    }

    onCheckInChange(
      formatDateForState(
        range.from,
      ),
    );

    if (!range.to) {
      onCheckOutChange("");

      return;
    }

    const nights =
      differenceInCalendarDays(
        range.to,
        range.from,
      );

    const minimumNights =
      getMinimumNights(
        range.from,
      );

    if (
      nights <
      minimumNights
    ) {
      onCheckOutChange("");

      setSelectionError(
        minimumNights === 2
          ? content.minimumTwoNightsError
          : content.minimumOneNightError,
      );

      return;
    }

    onCheckOutChange(
      formatDateForState(
        range.to,
      ),
    );

    setOpen(false);
  }

  const dateLabel =
    useMemo(() => {
      if (
        selectedRange?.from &&
        selectedRange.to
      ) {
        return `${format(
          selectedRange.from,
          "d MMM yyyy",
          {
            locale:
              calendarLocale,
          },
        )} — ${format(
          selectedRange.to,
          "d MMM yyyy",
          {
            locale:
              calendarLocale,
          },
        )}`;
      }

      if (
        selectedRange?.from
      ) {
        return `${format(
          selectedRange.from,
          "d MMM yyyy",
          {
            locale:
              calendarLocale,
          },
        )} — ${content.selectDeparture}`;
      }

      return content.selectPeriod;
    }, [
      calendarLocale,
      content.selectDeparture,
      content.selectPeriod,
      selectedRange,
    ]);

  const nightsLabel =
    selectedNights === 1
      ? content.oneNight
      : `${selectedNights} ${content.multipleNights}`;

  return (
    <div>
      <span className="mb-3 block text-[9px] font-medium uppercase tracking-[0.35em] text-gold sm:text-[10px]">
        {content.label}
      </span>

      <Popover
        open={open}
        onOpenChange={(
          nextOpen,
        ) => {
          setOpen(
            nextOpen,
          );

          if (nextOpen) {
            setSelectionError(
              "",
            );
          }
        }}
      >
        <PopoverTrigger
          type="button"
          aria-label={
            content.calendarAriaLabel
          }
          className="group flex min-h-14 w-full items-center justify-between gap-5 border-b border-white/20 bg-transparent py-4 text-left outline-none transition duration-300 hover:border-gold focus-visible:border-gold"
        >
          <span
            className={[
              "min-w-0 text-sm leading-7 transition duration-300 sm:text-[15px]",
              selectedRange?.from
                ? "text-white"
                : "text-white/40",
            ].join(" ")}
          >
            {dateLabel}
          </span>

          <span className="flex shrink-0 items-center gap-4">
            {selectedNights >
              0 && (
              <span className="hidden text-[9px] uppercase tracking-[0.25em] text-white/40 sm:block">
                {nightsLabel}
              </span>
            )}

            <CalendarDays className="h-[18px] w-[18px] text-gold transition-transform duration-300 group-hover:scale-105" />
          </span>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={12}
          className="w-auto max-w-[calc(100vw-2rem)] overflow-hidden border border-white/10 bg-[#0b0b0b] p-0 text-[#f5f2eb] shadow-2xl shadow-black/50"
        >
          {tomorrow && (
            <Calendar
              mode="range"
              selected={
                selectedRange
              }
              onSelect={
                handleSelect
              }
              defaultMonth={
                selectedRange?.from ??
                tomorrow
              }
              numberOfMonths={
                isDesktop
                  ? 2
                  : 1
              }
              disabled={{
                before:
                  tomorrow,
              }}
              locale={
                calendarLocale
              }
            />
          )}

          <div className="border-t border-white/10 px-5 py-5 sm:px-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-gold" />

                <p className="text-xs leading-6 text-white/45">
                  {
                    content.weekdayPolicy
                  }
                </p>
              </div>

              <div className="flex items-start gap-3">
                <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-gold" />

                <p className="text-xs leading-6 text-white/45">
                  {
                    content.weekendPolicy
                  }
                </p>
              </div>
            </div>

            {selectionError && (
              <p
                role="alert"
                className="mt-4 border-l border-red-400/70 pl-4 text-xs leading-6 text-red-300"
              >
                {
                  selectionError
                }
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
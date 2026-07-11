"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import { addDays, differenceInCalendarDays, format, startOfDay } from "date-fns";
import { ro } from "date-fns/locale";
import type { DateRange } from "react-day-picker";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type BookingDateRangePickerProps = {
  checkIn: string;
  checkOut: string;
  onCheckInChange: (value: string) => void;
  onCheckOutChange: (value: string) => void;
};

function parseLocalDate(value: string): Date | undefined {
  if (!value) return undefined;

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return undefined;
  }

  return new Date(year, month - 1, day);
}

function formatDateForState(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMinimumNights(checkIn: Date): number {
  const dayOfWeek = checkIn.getDay();

  // Vineri sau sâmbătă
  return dayOfWeek === 5 || dayOfWeek === 6 ? 2 : 1;
}

export function BookingDateRangePicker({
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
}: BookingDateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [selectionError, setSelectionError] = useState("");

  const tomorrow = useMemo(() => addDays(startOfDay(new Date()), 1), []);

  const selectedRange: DateRange | undefined = useMemo(() => {
    const from = parseLocalDate(checkIn);
    const to = parseLocalDate(checkOut);

    if (!from && !to) {
      return undefined;
    }

    return { from, to };
  }, [checkIn, checkOut]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");

    const updateViewport = () => {
      setIsDesktop(mediaQuery.matches);
    };

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);

    return () => {
      mediaQuery.removeEventListener("change", updateViewport);
    };
  }, []);

  function handleSelect(range: DateRange | undefined) {
    setSelectionError("");

    if (!range?.from) {
      onCheckInChange("");
      onCheckOutChange("");
      return;
    }

    onCheckInChange(formatDateForState(range.from));

    if (!range.to) {
      onCheckOutChange("");
      return;
    }

    const nights = differenceInCalendarDays(range.to, range.from);
    const minimumNights = getMinimumNights(range.from);

    if (nights < minimumNights) {
      onCheckOutChange("");

      setSelectionError(
        minimumNights === 2
          ? "Pentru sosirile de vineri sau sâmbătă trebuie selectate minimum 2 nopți."
          : "Selectează cel puțin o noapte.",
      );

      return;
    }

    onCheckOutChange(formatDateForState(range.to));
    setOpen(false);
  }

  const dateLabel =
    selectedRange?.from && selectedRange?.to
      ? `${format(selectedRange.from, "d MMM yyyy", {
          locale: ro,
        })} — ${format(selectedRange.to, "d MMM yyyy", {
          locale: ro,
        })}`
      : selectedRange?.from
        ? `${format(selectedRange.from, "d MMM yyyy", {
            locale: ro,
          })} — selectează plecarea`
        : "Selectează perioada";

  return (
    <div>
      <span className="mb-3 block text-[10px] uppercase tracking-[0.35em] text-gold">
        Perioada sejurului
      </span>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          className="flex min-h-14 w-full items-center justify-between gap-5 border-b border-white/20 bg-transparent py-4 text-left text-sm text-white transition hover:border-gold focus-visible:border-gold focus-visible:outline-none"
        >
          <span className={selectedRange?.from ? "text-white" : "text-white/40"}>
            {dateLabel}
          </span>

          <CalendarDays className="h-5 w-5 shrink-0 text-gold" />
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="w-auto border-white/10 bg-[#0b0b0b] p-0 text-[#f5f2eb]"
        >
          <Calendar
            mode="range"
            selected={selectedRange}
            onSelect={handleSelect}
            defaultMonth={selectedRange?.from ?? tomorrow}
            numberOfMonths={isDesktop ? 2 : 1}
            disabled={{ before: tomorrow }}
            locale={ro}
          />

          <div className="border-t border-white/10 px-5 py-4">
            <p className="text-xs leading-6 text-white/45">
              În timpul săptămânii poți rezerva o singură noapte. Pentru
              sosirile de vineri sau sâmbătă, sejurul minim este de 2 nopți.
            </p>

            {selectionError && (
              <p className="mt-2 text-xs leading-6 text-red-400">
                {selectionError}
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
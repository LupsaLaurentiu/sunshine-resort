"use client";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

import type {
  CalendarDateRange,
  CalendarViewMode,
} from "@/types/admin-calendar";

type CalendarHeaderProps = {
  title: string;
  viewMode: CalendarViewMode;
  range: CalendarDateRange;
  includePending: boolean;
  isLoading: boolean;

  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onRefresh: () => void;

  onViewModeChange: (
    mode: CalendarViewMode,
  ) => void;

  onIncludePendingChange: (
    value: boolean,
  ) => void;
};

export function CalendarHeader({
  title,
  viewMode,
  range,
  includePending,
  isLoading,
  onPrevious,
  onNext,
  onToday,
  onRefresh,
  onViewModeChange,
  onIncludePendingChange,
}: CalendarHeaderProps) {
  return (
    <section className="border border-white/10 bg-[#0b0b0b] p-6 md:p-8">
      <div className="flex flex-col justify-between gap-8 xl:flex-row xl:items-end">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold">
            PMS Calendar
          </p>

          <h1 className="heading mt-4 text-5xl font-light capitalize md:text-7xl">
            {title}
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/45">
            Vizualizează ocuparea apartamentelor, blocările interne și
            evenimentele sincronizate din calendarele externe.
          </p>

          <p className="mt-4 text-xs text-white/25">
            Interval API: {range.from} — {range.to}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onToday}
            disabled={isLoading}
            className="inline-flex h-11 items-center justify-center gap-3 border border-white/10 px-5 text-[10px] uppercase tracking-[0.25em] text-white/55 transition hover:border-gold hover:text-gold disabled:cursor-wait disabled:opacity-40"
          >
            <CalendarDays className="h-4 w-4" />
            Astăzi
          </button>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="flex h-11 w-11 items-center justify-center border border-white/10 text-white/50 transition hover:border-gold hover:text-gold disabled:cursor-wait disabled:opacity-40"
            aria-label="Reîncarcă calendarul"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                isLoading ? "animate-spin" : ""
              }`}
            />
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-6 border-t border-white/10 pt-7 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onPrevious}
            disabled={isLoading}
            className="flex h-11 w-11 items-center justify-center border border-white/10 text-white/50 transition hover:border-gold hover:text-gold disabled:cursor-wait disabled:opacity-40"
            aria-label={
              viewMode === "month"
                ? "Luna anterioară"
                : "Perioada anterioară"
            }
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onNext}
            disabled={isLoading}
            className="flex h-11 w-11 items-center justify-center border border-white/10 text-white/50 transition hover:border-gold hover:text-gold disabled:cursor-wait disabled:opacity-40"
            aria-label={
              viewMode === "month"
                ? "Luna următoare"
                : "Perioada următoare"
            }
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="ml-0 flex border border-white/10 sm:ml-3">
            <button
              type="button"
              onClick={() =>
                onViewModeChange("month")
              }
              disabled={isLoading}
              className={`h-11 px-5 text-[10px] uppercase tracking-[0.25em] transition disabled:cursor-wait disabled:opacity-40 ${
                viewMode === "month"
                  ? "bg-gold text-black"
                  : "bg-[#050505] text-white/45 hover:text-white"
              }`}
            >
              Lună
            </button>

            <button
              type="button"
              onClick={() =>
                onViewModeChange("30-days")
              }
              disabled={isLoading}
              className={`h-11 border-l border-white/10 px-5 text-[10px] uppercase tracking-[0.25em] transition disabled:cursor-wait disabled:opacity-40 ${
                viewMode === "30-days"
                  ? "bg-gold text-black"
                  : "bg-[#050505] text-white/45 hover:text-white"
              }`}
            >
              30 zile
            </button>
          </div>
        </div>

        <label className="flex items-center gap-4">
            <span className="text-[11px] font-medium text-white/60">
                Include cererile în așteptare
            </span>

            <button
                type="button"
                role="switch"
                aria-checked={includePending}
                disabled={isLoading}
                onClick={() =>
                onIncludePendingChange(!includePending)
                }
                className={`relative h-7 w-14 rounded-full border transition-all duration-300 ${
                includePending
                    ? "border-gold bg-gold/20"
                    : "border-white/15 bg-[#050505]"
                } ${
                isLoading
                    ? "cursor-wait opacity-50"
                    : "cursor-pointer"
                }`}
            >
                <span
                className={`absolute top-1 h-5 w-5 rounded-full transition-all duration-300 ${
                    includePending
                    ? "left-8 bg-gold"
                    : "left-1 bg-white/70"
                }`}
                />
            </button>
            </label>
      </div>
    </section>
  );
}
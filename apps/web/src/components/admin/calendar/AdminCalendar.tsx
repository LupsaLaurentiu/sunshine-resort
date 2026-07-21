"use client";

import { useMemo, useState } from "react";

import { useAdminCalendar } from "@/hooks/useAdminCalendar";

import type {
  CalendarDateRange,
  CalendarViewMode,
} from "@/types/admin-calendar";

import { CalendarGrid } from "./CalendarGrid";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarLegend } from "./CalendarLegend";

import {
  formatCalendarRangeTitle,
  getCalendarDays,
  getMonthRange,
  getNextMonth,
  getNextThirtyDays,
  getPreviousMonth,
  getPreviousThirtyDays,
  getThirtyDayRange,
  getTodayDateValue,
} from "./calendar-utils";

function createUtcDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function getInitialAnchorDate(): Date {
  return createUtcDate(getTodayDateValue());
}

function getRangeForViewMode(
  anchorDate: Date,
  viewMode: CalendarViewMode,
): CalendarDateRange {
  return viewMode === "month"
    ? getMonthRange(anchorDate)
    : getThirtyDayRange(anchorDate);
}

export function AdminCalendar() {
  const [viewMode, setViewMode] =
    useState<CalendarViewMode>("month");

  const [anchorDate, setAnchorDate] =
    useState<Date>(() => getInitialAnchorDate());

  const initialRange = useMemo(
    () => getMonthRange(getInitialAnchorDate()),
    [],
  );

  const {
    rooms,
    events,
    summary,

    range,
    includePending,

    error,
    isLoading,
    hasData,

    updateRange,
    updateIncludePending,
    refresh,
  } = useAdminCalendar({
    initialRange,
    includePending: true,
  });

  const primaryMonth =
    anchorDate.getUTCMonth();

  const days = useMemo(
    () =>
      getCalendarDays(
        range,
        primaryMonth,
      ),
    [
      primaryMonth,
      range,
    ],
  );

  const title = useMemo(
    () =>
      formatCalendarRangeTitle(
        range,
      ),
    [range],
  );

  function updateAnchorAndRange(
    nextAnchorDate: Date,
    nextViewMode: CalendarViewMode = viewMode,
  ) {
    setAnchorDate(nextAnchorDate);

    updateRange(
      getRangeForViewMode(
        nextAnchorDate,
        nextViewMode,
      ),
    );
  }

  function handlePrevious() {
    const nextAnchorDate =
      viewMode === "month"
        ? getPreviousMonth(anchorDate)
        : getPreviousThirtyDays(anchorDate);

    updateAnchorAndRange(
      nextAnchorDate,
    );
  }

  function handleNext() {
    const nextAnchorDate =
      viewMode === "month"
        ? getNextMonth(anchorDate)
        : getNextThirtyDays(anchorDate);

    updateAnchorAndRange(
      nextAnchorDate,
    );
  }

  function handleToday() {
    const today =
      getInitialAnchorDate();

    updateAnchorAndRange(
      today,
    );
  }

  function handleViewModeChange(
    nextViewMode: CalendarViewMode,
  ) {
    if (nextViewMode === viewMode) {
      return;
    }

    setViewMode(nextViewMode);

    updateRange(
      getRangeForViewMode(
        anchorDate,
        nextViewMode,
      ),
    );
  }

  return (
    <section className="space-y-8">
      <CalendarHeader
        title={title}
        viewMode={viewMode}
        range={range}
        includePending={includePending}
        isLoading={isLoading}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToday={handleToday}
        onRefresh={() => {
          void refresh();
        }}
        onViewModeChange={
          handleViewModeChange
        }
        onIncludePendingChange={
          updateIncludePending
        }
      />

      <CalendarLegend
        summary={summary}
      />

      {error && (
        <div
          role="alert"
          className="border border-red-300/20 bg-red-300/5 px-6 py-5 text-sm leading-7 text-red-200"
        >
          {error}
        </div>
      )}

      {isLoading && !hasData ? (
        <div className="flex min-h-[420px] items-center justify-center border border-white/10 bg-[#0b0b0b]">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border border-gold border-t-transparent" />

            <p className="mt-6 text-[10px] uppercase tracking-[0.3em] text-white/35">
              Se încarcă calendarul
            </p>
          </div>
        </div>
      ) : (
        <div className="relative">
          {isLoading && hasData && (
            <div className="pointer-events-none absolute inset-0 z-40 flex items-start justify-center bg-black/20 pt-6 backdrop-blur-[1px]">
              <div className="flex items-center gap-3 border border-white/10 bg-[#0b0b0b] px-5 py-3">
                <div className="h-4 w-4 animate-spin rounded-full border border-gold border-t-transparent" />

                <span className="text-[10px] uppercase tracking-[0.25em] text-white/45">
                  Se actualizează
                </span>
              </div>
            </div>
          )}

          <CalendarGrid
            rooms={rooms}
            days={days}
            events={events}
            range={range}
            dayWidth={
              viewMode === "month"
                ? 72
                : 78
            }
          />
        </div>
      )}
    </section>
  );
}
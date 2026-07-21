"use client";

import type {
  CalendarDateRange,
  CalendarDay,
  CalendarEvent,
  CalendarRoom,
} from "@/types/admin-calendar";

import { CalendarRoomRow } from "./CalendarRoomRow";

type CalendarGridProps = {
  rooms: CalendarRoom[];
  days: CalendarDay[];
  events: CalendarEvent[];
  range: CalendarDateRange;
  dayWidth?: number;
};

export function CalendarGrid({
  rooms,
  days,
  events,
  range,
  dayWidth = 72,
}: CalendarGridProps) {
  const timelineWidth =
    days.length * dayWidth;

  return (
    <section className="overflow-hidden border border-white/10 bg-[#0b0b0b]">
      <div className="overflow-x-auto">
        <div
          className="min-w-max"
          style={{
            width:
              240 + timelineWidth,
          }}
        >
          <div className="grid grid-cols-[240px_auto] border-b border-white/10">
            <div className="sticky left-0 z-30 flex h-[76px] items-center border-r border-white/10 bg-[#0b0b0b] px-5">
              <div>
                <p className="text-[9px] uppercase tracking-[0.28em] text-white/30">
                  Inventar
                </p>

                <p className="mt-2 text-sm font-medium text-white/75">
                  Apartamente
                </p>
              </div>
            </div>

            <div
              className="grid"
              style={{
                gridTemplateColumns: `repeat(${days.length}, ${dayWidth}px)`,
              }}
            >
              {days.map((day) => (
                <div
                  key={day.date}
                  className={[
                    "flex h-[76px] flex-col items-center justify-center border-r border-white/10 last:border-r-0",
                    day.isWeekend
                      ? "bg-white/[0.02]"
                      : "",
                    day.isToday
                      ? "bg-gold/[0.07]"
                      : "",
                    day.isOutsidePrimaryMonth
                      ? "opacity-50"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <span className="text-[9px] uppercase tracking-[0.22em] text-white/30">
                    {day.weekdayLabel}
                  </span>

                  <span
                    className={[
                      "mt-2 flex h-8 w-8 items-center justify-center text-sm",
                      day.isToday
                        ? "bg-gold font-semibold text-black"
                        : "text-white/75",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {day.dayNumber}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {rooms.length === 0 ? (
            <div className="px-8 py-20 text-center">
              <p className="heading text-3xl font-light text-white/60">
                Nu există apartamente active.
              </p>

              <p className="mt-4 text-sm leading-7 text-white/35">
                Calendarul va afișa inventarul după ce există apartamente active.
              </p>
            </div>
          ) : (
            rooms.map((room) => (
              <CalendarRoomRow
                key={room.id}
                room={room}
                days={days}
                events={events}
                range={range}
                dayWidth={dayWidth}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
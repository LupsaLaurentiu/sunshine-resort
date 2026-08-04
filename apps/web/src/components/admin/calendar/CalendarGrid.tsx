"use client";

import type {
  CalendarDateRange,
  CalendarDay,
  CalendarEvent,
  CalendarRoom,
} from "@/types/admin-calendar";

import { CalendarRoomRow } from "./CalendarRoomRow";
import "./calendar-scrollbar.css";

type CalendarGridProps = {
  rooms: CalendarRoom[];
  days: CalendarDay[];
  events: CalendarEvent[];
  range: CalendarDateRange;
  dayWidth?: number;
};

const ROOM_COLUMN_WIDTH = 180;
const HEADER_HEIGHT = 62;

export function CalendarGrid({
  rooms,
  days,
  events,
  range,
  dayWidth = 68,
}: CalendarGridProps) {
  const timelineWidth =
    days.length * dayWidth;

  return (
    <section className="overflow-hidden border border-white/10 bg-[#0b0b0b]">
      <div className="admin-calendar-scroll overflow-x-auto">
        <div
          className="min-w-max"
          style={{
            width:
              ROOM_COLUMN_WIDTH +
              timelineWidth,
          }}
        >
          <div
            className="grid border-b border-white/10"
            style={{
              gridTemplateColumns:
                `${ROOM_COLUMN_WIDTH}px auto`,
            }}
          >
            <div
              className="sticky left-0 z-30 flex items-center border-r border-white/10 bg-[#0b0b0b] px-5"
              style={{
                height:
                  HEADER_HEIGHT,
              }}
            >
              <div>
                <p className="text-[8px] uppercase tracking-[0.28em] text-white/30">
                  Inventar
                </p>

                <p className="mt-1.5 text-sm font-medium text-white/75">
                  Apartamente
                </p>
              </div>
            </div>

            <div
              className="grid"
              style={{
                gridTemplateColumns:
                  `repeat(${days.length}, ${dayWidth}px)`,
              }}
            >
              {days.map((day) => (
                <div
                  key={day.date}
                  className={[
                    "flex flex-col items-center justify-center border-r border-white/10 last:border-r-0",
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
                  style={{
                    height:
                      HEADER_HEIGHT,
                  }}
                >
                  <span className="text-[8px] uppercase tracking-[0.2em] text-white/30">
                    {day.weekdayLabel}
                  </span>

                  <span
                    className={[
                      "mt-1.5 flex h-7 w-7 items-center justify-center text-xs",
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
            <div className="px-8 py-16 text-center">
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
                roomColumnWidth={
                  ROOM_COLUMN_WIDTH
                }
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
"use client";

import type {
  CalendarDateRange,
  CalendarDay,
  CalendarEvent,
  CalendarRoom,
} from "@/types/admin-calendar";

import { CalendarEventBar } from "./CalendarEventBar";
import {
  getEventGridPosition,
  getRoomEvents,
} from "./calendar-utils";

type CalendarRoomRowProps = {
  room: CalendarRoom;
  days: CalendarDay[];
  events: CalendarEvent[];
  range: CalendarDateRange;
  dayWidth: number;
  roomColumnWidth?: number;
};

const ROW_HEIGHT = 72;

export function CalendarRoomRow({
  room,
  days,
  events,
  range,
  dayWidth,
  roomColumnWidth = 190,
}: CalendarRoomRowProps) {
  const roomEvents = getRoomEvents(
    events,
    room.id,
  );

  return (
    <div
      className="grid min-w-max border-b border-white/10 last:border-b-0"
      style={{
        gridTemplateColumns:
          `${roomColumnWidth}px auto`,
      }}
    >
      <div
        className="sticky left-0 z-20 flex items-center border-r border-white/10 bg-[#0b0b0b] px-5"
        style={{
          height: ROW_HEIGHT,
        }}
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white/85">
            {room.name}
          </p>

          <p className="mt-1.5 truncate text-[9px] uppercase tracking-[0.24em] text-white/30">
            {room.code}
          </p>
        </div>
      </div>

      <div
        className="relative"
        style={{
          width:
            days.length * dayWidth,

          height:
            ROW_HEIGHT,
        }}
      >
        <div
          className="absolute inset-0 grid"
          style={{
            gridTemplateColumns:
              `repeat(${days.length}, ${dayWidth}px)`,
          }}
        >
          {days.map((day) => (
            <div
              key={day.date}
              className={[
                "border-r border-white/10 last:border-r-0",

                day.isWeekend
                  ? "bg-white/[0.018]"
                  : "",

                day.isToday
                  ? "bg-gold/[0.055]"
                  : "",

                day.isOutsidePrimaryMonth
                  ? "opacity-55"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
            />
          ))}
        </div>

        <div
          className="relative z-10 grid h-full items-stretch py-1.5"
          style={{
            gridTemplateColumns:
              `repeat(${days.length}, ${dayWidth}px)`,
          }}
        >
          {roomEvents.map((event) => {
            const position =
              getEventGridPosition(
                event,
                range,
              );

            if (!position) {
              return null;
            }

            return (
              <div
                key={event.id}
                className="min-w-0 px-1"
                style={{
                  gridColumnStart:
                    position.columnStart,

                  gridColumnEnd:
                    `span ${position.columnSpan}`,
                }}
              >
                <CalendarEventBar
                  event={event}
                  className="h-full"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
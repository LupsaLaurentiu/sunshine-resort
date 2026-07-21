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
};

export function CalendarRoomRow({
  room,
  days,
  events,
  range,
  dayWidth,
}: CalendarRoomRowProps) {
  const roomEvents = getRoomEvents(
    events,
    room.id,
  );

  return (
    <div className="grid min-w-max grid-cols-[240px_auto] border-b border-white/10 last:border-b-0">
      <div className="sticky left-0 z-20 flex min-h-[92px] items-center border-r border-white/10 bg-[#0b0b0b] px-5">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white/85">
            {room.name}
          </p>

          <p className="mt-1 truncate text-xs text-white/35">
            {room.roomTypeName}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px] uppercase tracking-[0.22em] text-white/25">
            <span>{room.code}</span>

            {room.floor !== null && (
              <span>Etaj {room.floor}</span>
            )}
          </div>
        </div>
      </div>

      <div
        className="relative min-h-[92px]"
        style={{
          width:
            days.length * dayWidth,
        }}
      >
        <div
          className="absolute inset-0 grid"
          style={{
            gridTemplateColumns: `repeat(${days.length}, ${dayWidth}px)`,
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
          className="relative z-10 grid min-h-[92px] items-center px-1"
          style={{
            gridTemplateColumns: `repeat(${days.length}, ${dayWidth}px)`,
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
                  gridColumnEnd: `span ${position.columnSpan}`,
                }}
              >
                <CalendarEventBar
                  event={event}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
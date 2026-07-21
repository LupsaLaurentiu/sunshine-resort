"use client";

import Link from "next/link";

import type {
  CalendarEvent,
} from "@/types/admin-calendar";
import type {
  ReservationStatus,
} from "@/types/reservation";

type CalendarEventBarProps = {
  event: CalendarEvent;
};

const STATUS_CLASSES: Record<
  ReservationStatus,
  string
> = {
  PENDING_APPROVAL:
    "bg-sky-500/90 hover:bg-sky-500",

  APPROVED_AWAITING_PAYMENT:
    "bg-amber-500/90 hover:bg-amber-500",

  CONFIRMED:
    "bg-emerald-500/90 hover:bg-emerald-500",

  CHECKED_IN:
    "bg-green-600 hover:bg-green-500",

  CHECKED_OUT:
    "bg-zinc-600 hover:bg-zinc-500",

  CANCELLED:
    "bg-red-600",

  REJECTED:
    "bg-red-600",

  EXPIRED:
    "bg-neutral-700",
};

export function CalendarEventBar({
  event,
}: CalendarEventBarProps) {
  switch (event.type) {
    case "RESERVATION":
      return (
        <Link
          href={`/admin/reservation/${event.reservationId}`}
          title={`${event.guestName} · ${event.start} – ${event.end}`}
          className={`group flex h-8 items-center overflow-hidden rounded-md px-3 text-xs font-medium text-white shadow transition ${
            STATUS_CLASSES[event.status]
          }`}
        >
          <span className="truncate">
            {event.guestName}
          </span>
        </Link>
      );

    case "BLOCKED_PERIOD":
      return (
        <div
          title={event.reason}
          className="flex h-8 items-center overflow-hidden rounded-md bg-rose-500/90 px-3 text-xs font-medium text-white"
        >
          <span className="truncate">
            {event.reason}
          </span>
        </div>
      );

    case "EXTERNAL_CALENDAR":
      return (
        <div
          title={`Eveniment iCal · ${event.start} – ${event.end}`}
          className="flex h-8 items-center overflow-hidden rounded-md bg-violet-500/90 px-3 text-xs font-medium text-white"
        >
          <span className="truncate">
            iCal
          </span>
        </div>
      );

    default: {
      const exhaustiveCheck: never = event;

      return exhaustiveCheck;
    }
  }
}
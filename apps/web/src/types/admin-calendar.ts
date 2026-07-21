import type { ReservationStatus } from "@/types/reservation";

export type CalendarEventType =
  | "RESERVATION"
  | "BLOCKED_PERIOD"
  | "EXTERNAL_CALENDAR";

export type CalendarRoom = {
  id: string;
  name: string;
  code: string;
  floor: number | null;

  roomTypeId: string;
  roomTypeName: string;
};

export type CalendarReservationSource =
  | "DIRECT_WEBSITE"
  | "MANUAL_ADMIN"
  | "BOOKING_COM";

export type CalendarReservationEvent = {
  id: string;
  type: "RESERVATION";

  roomId: string;
  roomName: string;

  reservationId: string;
  reservationRoomId: string;

  start: string;
  end: string;

  guestName: string;
  status: ReservationStatus;

  adults: number;
  source: CalendarReservationSource;

  totalPrice: number;
  paidAmount: number;
};

export type CalendarBlockedPeriodEvent = {
  id: string;
  type: "BLOCKED_PERIOD";

  roomId: string;
  roomName: string;

  start: string;
  end: string;

  reason: string;
};

export type CalendarExternalEvent = {
  id: string;
  type: "EXTERNAL_CALENDAR";

  roomId: string;
  roomName: string;

  start: string;
  end: string;

  source: "ICAL";
};

export type CalendarEvent =
  | CalendarReservationEvent
  | CalendarBlockedPeriodEvent
  | CalendarExternalEvent;

export type CalendarUnassignedReservation = {
  reservationId: string;
  reservationRoomId: string;

  roomTypeId: string;
  roomTypeName: string;

  start: string;
  end: string;

  guestName: string;
  status: ReservationStatus;

  adults: number;
  source: CalendarReservationSource;
};

export type CalendarSummary = {
  roomCount: number;
  reservationEventCount: number;
  blockedPeriodCount: number;
  externalEventCount: number;
  unassignedReservationCount: number;
};

export type CalendarResponse = {
  range: {
    from: string;
    to: string;
  };

  rooms: CalendarRoom[];
  events: CalendarEvent[];

  unassignedReservations: CalendarUnassignedReservation[];

  summary: CalendarSummary;
};

export type CalendarQuery = {
  from: string;
  to: string;
  includePending?: boolean;
};

export type CalendarViewMode =
  | "month"
  | "30-days";

export type CalendarDateRange = {
  from: string;
  to: string;
};

export type CalendarDay = {
  date: string;
  dayNumber: number;
  weekdayLabel: string;
  isToday: boolean;
  isWeekend: boolean;
  isOutsidePrimaryMonth: boolean;
};
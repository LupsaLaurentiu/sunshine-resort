import { ReservationStatus } from '@prisma/client';

export type CalendarRoom = {
  id: string;
  name: string;
  code: string;
  floor: number | null;
  roomTypeId: string;
  roomTypeName: string;
};

export type CalendarReservationEvent = {
  id: string;
  type: 'RESERVATION';

  roomId: string;
  roomName: string;

  reservationId: string;
  reservationRoomId: string;

  start: string;
  end: string;

  guestName: string;
  status: ReservationStatus;

  adults: number;

  /**
   * Indică dacă această unitate rezervată
   * utilizează opțiunea de adult suplimentar.
   */
  hasExtraAdult: boolean;

  source: string;

  totalPrice: number;
  paidAmount: number;

  /**
   * true = poziționare estimată în calendar;
   * camera nu este încă salvată în ReservationRoom.
   */
  isProvisional: boolean;
};

export type CalendarBlockedPeriodEvent = {
  id: string;
  type: 'BLOCKED_PERIOD';

  roomId: string;
  roomName: string;

  start: string;
  end: string;

  reason: string;
};

export type CalendarExternalEvent = {
  id: string;
  type: 'EXTERNAL_CALENDAR';

  roomId: string;
  roomName: string;

  start: string;
  end: string;

  source: 'ICAL';
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

  /**
   * Va fi afișat în calendar pentru
   * rezervările încă nealocate.
   */
  hasExtraAdult: boolean;

  source: string;

  totalPrice: number;
  paidAmount: number;

  predictedRoomId: string | null;
  predictedRoomName: string | null;
  predictedRoomCode: string | null;
};

export type CalendarSummary = {
  roomCount: number;
  reservationEventCount: number;
  provisionalReservationCount: number;
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
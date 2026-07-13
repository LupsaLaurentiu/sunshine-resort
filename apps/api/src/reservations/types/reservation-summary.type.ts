import { ReservationStatus } from '@prisma/client';

export const RESERVATION_TRANSITIONS: Record<
  ReservationStatus,
  readonly ReservationStatus[]
> = {
  [ReservationStatus.PENDING_APPROVAL]: [
    ReservationStatus.APPROVED_AWAITING_PAYMENT,
    ReservationStatus.REJECTED,
    ReservationStatus.CANCELLED,
    ReservationStatus.EXPIRED,
  ],

  [ReservationStatus.APPROVED_AWAITING_PAYMENT]: [
    ReservationStatus.CONFIRMED,
    ReservationStatus.CANCELLED,
    ReservationStatus.EXPIRED,
  ],

  [ReservationStatus.CONFIRMED]: [
    ReservationStatus.CHECKED_IN,
    ReservationStatus.CANCELLED,
  ],

  [ReservationStatus.CHECKED_IN]: [
    ReservationStatus.CHECKED_OUT,
  ],

  [ReservationStatus.REJECTED]: [],
  [ReservationStatus.CANCELLED]: [],
  [ReservationStatus.EXPIRED]: [],
  [ReservationStatus.CHECKED_OUT]: [],
};
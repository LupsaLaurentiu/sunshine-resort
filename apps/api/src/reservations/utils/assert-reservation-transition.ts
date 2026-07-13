import { ConflictException } from '@nestjs/common';
import { ReservationStatus } from '@prisma/client';
import { RESERVATION_TRANSITIONS } from '../constants/reservation-transitions.constant';

export function assertReservationTransition(
  currentStatus: ReservationStatus,
  nextStatus: ReservationStatus,
): void {
  const allowedTransitions = RESERVATION_TRANSITIONS[currentStatus];

  if (!allowedTransitions.includes(nextStatus)) {
    throw new ConflictException({
      code: 'INVALID_RESERVATION_STATUS_TRANSITION',
      message: `Tranziția din ${currentStatus} în ${nextStatus} nu este permisă.`,
      currentStatus,
      requestedStatus: nextStatus,
    });
  }
}
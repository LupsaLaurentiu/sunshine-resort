import type { ReservationStatus } from '@prisma/client';

export type CreateReservationResponse = {
  id: string;
  status: ReservationStatus;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  totalPrice: number;
  depositAmount: number;
  approvalExpiresAt: string;
  message: string;
};
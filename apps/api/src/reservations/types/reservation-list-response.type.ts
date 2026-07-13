import type {
  ReservationSource,
  ReservationStatus,
} from '@prisma/client';

export type ReservationListItem = {
  id: string;
  status: ReservationStatus;
  source: ReservationSource;

  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;

  totalPrice: number;
  paidAmount: number;

  guest: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };

  roomTypes: {
    id: string;
    nameRo: string;
    nameEn: string;
    quantity: number;
  }[];

  createdAt: string;
  approvalExpiresAt: string | null;
  paymentExpiresAt: string | null;
};

export type ReservationListResponse = {
  items: ReservationListItem[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
};
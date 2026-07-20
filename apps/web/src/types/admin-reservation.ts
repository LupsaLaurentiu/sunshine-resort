import type {
  ReservationStatus,
} from "@/types/reservation";

export type ReservationSource =
  | "DIRECT_WEBSITE"
  | "MANUAL_ADMIN"
  | "BOOKING_COM";

export type AdminReservationGuest = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export type AdminReservationRoomType = {
  id: string;
  nameRo: string;
  nameEn: string;
  quantity: number;
};

export type AdminReservationListItem = {
  id: string;
  status: ReservationStatus;
  source: ReservationSource;

  checkIn: string;
  checkOut: string;

  nights: number;
  adults: number;

  totalPrice: number;
  paidAmount: number;

  guest: AdminReservationGuest;
  roomTypes: AdminReservationRoomType[];

  createdAt: string;
  approvalExpiresAt: string | null;
  paymentExpiresAt: string | null;
};

export type AdminReservationsPagination = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
};

export type AdminReservationsResponse = {
  items: AdminReservationListItem[];
  pagination: AdminReservationsPagination;
};

export type AdminReservationsQuery = {
  status?: ReservationStatus;
  source?: ReservationSource;
  from?: string;
  to?: string;
  search?: string;
  page?: number;
  limit?: number;
};
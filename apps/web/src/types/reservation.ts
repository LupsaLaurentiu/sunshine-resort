export type ReservationLocale = "RO" | "EN";

export type ReservationStatus =
  | "PENDING_APPROVAL"
  | "APPROVED_AWAITING_PAYMENT"
  | "CONFIRMED"
  | "REJECTED"
  | "CANCELLED"
  | "EXPIRED"
  | "CHECKED_IN"
  | "CHECKED_OUT";

export type ReservationSource =
  | "DIRECT_WEBSITE"
  | "MANUAL_ADMIN"
  | "BOOKING_COM";

export type CreateReservationGuest = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country?: string;
};

export type CreateReservationRoomSelection = {
  roomTypeId: string;
  quantity: number;
  adultsPerRoom: number;
};

export type CreateReservationRequest = {
  checkIn: string;
  checkOut: string;
  locale?: ReservationLocale;
  guest: CreateReservationGuest;
  rooms: CreateReservationRoomSelection[];
  guestNotes?: string;
};

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
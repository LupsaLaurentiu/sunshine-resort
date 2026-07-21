import type { ReservationStatus } from "@/types/reservation";

export type PublicPaymentType = "DEPOSIT" | "FULL";

export type PublicPaymentReservation = {
  reservationId: string;
  locale: "RO" | "EN";
  status: ReservationStatus;

  guestFirstName: string;
  guestLastName: string;

  checkIn: string;
  checkOut: string;

  nights: number;
  adults: number;

  roomNames: string[];

  totalPrice: number;
  depositAmount: number;
  paidAmount: number;
  remainingAmount: number;

  paymentExpiresAt: string;

  availablePaymentTypes: PublicPaymentType[];
};

export type PaymentAccessQuery = {
  token: string;
};

export type CreatePublicCheckoutRequest = {
  token: string;
  paymentType: PublicPaymentType;
};

export type CheckoutPaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

export type PublicCheckoutResponse = {
  paymentId: string;
  reservationId: string;

  paymentType: PublicPaymentType;
  paymentStatus: CheckoutPaymentStatus;

  amount: number;
  currency: string;

  checkoutSessionId: string;
  checkoutUrl: string;

  expiresAt: string | null;
};
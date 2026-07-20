import type { ReservationStatus } from "@/types/reservation";
import type { ReservationSource } from "@/types/admin-reservation";

export type ReservationLocale = "RO" | "EN";

export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentType =
  | "DEPOSIT"
  | "FULL"
  | "REMAINING_BALANCE"
  | "MODIFICATION_DIFFERENCE";

export type PaymentProvider =
  | "STRIPE"
  | "CASH"
  | "POS"
  | "BANK_TRANSFER"
  | "MANUAL";

export type ReservationChangeStatus =
  | "PENDING_APPROVAL"
  | "APPROVED_AWAITING_PAYMENT"
  | "APPLIED"
  | "REJECTED"
  | "EXPIRED"
  | "CANCELLED";

export type AdminSummary = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type ReservationGuestDetails = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ReservationRoomTypeDetails = {
  id: string;
  nameRo: string;
  nameEn: string;
  slug: string;
  descriptionRo: string | null;
  descriptionEn: string | null;
  weekdayBasePrice: string | number;
  weekendBasePrice: string | number;
  maxAdults: number;
  sizeSqm: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ReservationAllocatedRoom = {
  id: string;
  name: string;
  code: string;
  roomTypeId: string;
  floor: number | null;
  tvDeviceId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ReservationRoomDetails = {
  id: string;
  reservationId: string;
  roomTypeId: string;
  roomId: string | null;

  adults: number;
  weekdayNights: number;
  weekendNights: number;
  nights: number;

  weekdayPricePerNight: number;
  weekendPricePerNight: number;
  subtotal: number;

  roomType: ReservationRoomTypeDetails;
  room: ReservationAllocatedRoom | null;
};

export type ReservationPaymentDetails = {
  id: string;
  reservationId: string;
  reservationChangeId: string | null;

  type: PaymentType;
  status: PaymentStatus;
  provider: PaymentProvider;

  amount: number;
  refundedAmount: string | number;
  currency: string;

  stripeCheckoutSessionId: string | null;
  stripePaymentIntentId: string | null;
  stripeRefundId: string | null;
  providerEventId: string | null;
  paymentUrl: string | null;

  paidAt: string | null;
  failedAt: string | null;
  cancelledAt: string | null;
  refundedAt: string | null;

  failureReason: string | null;
  refundReason: string | null;

  createdAt: string;
  updatedAt: string;
};

export type ReservationChangeDetails = {
  id: string;
  reservationId: string;
  status: ReservationChangeStatus;

  requestedCheckInDate: string;
  requestedCheckOutDate: string;

  oldCheckInDate: string;
  oldCheckOutDate: string;

  oldSubtotalPrice: number;
  newSubtotalPrice: number;
  priceDifference: number;

  amountDue: number;
  retainedAmount: number;

  approvedByAdminId: string | null;
  rejectedByAdminId: string | null;

  guestReason: string | null;
  adminNotes: string | null;
  rejectionReason: string | null;

  approvalExpiresAt: string | null;
  paymentExpiresAt: string | null;

  approvedAt: string | null;
  rejectedAt: string | null;
  appliedAt: string | null;
  expiredAt: string | null;
  cancelledAt: string | null;

  createdAt: string;
  updatedAt: string;
};

export type AdminReservationDetails = {
  id: string;
  guestId: string;

  status: ReservationStatus;
  source: ReservationSource;
  locale: ReservationLocale;

  checkInDate: string;
  checkOutDate: string;
  checkInTime: string;
  checkOutTime: string;

  adults: number;
  nights: number;

  subtotalPrice: number;
  discountAmount: number;
  totalPrice: number;
  depositPercentage: number;
  depositAmount: number;
  paidAmount: number;

  isComplimentary: boolean;

  createdByAdminId: string | null;
  approvedByAdminId: string | null;

  adminNotes: string | null;
  guestNotes: string | null;

  rejectionReason: string | null;
  cancellationReason: string | null;

  approvalExpiresAt: string | null;
  paymentExpiresAt: string | null;

  paymentAccessTokenHash: string | null;
  paymentAccessTokenExpiresAt: string | null;

  approvedAt: string | null;
  rejectedAt: string | null;
  cancelledAt: string | null;
  confirmedAt: string | null;
  checkedInAt: string | null;
  checkedOutAt: string | null;

  sevenDayReminderSentAt: string | null;
  oneDayReminderSentAt: string | null;
  postStayEmailSentAt: string | null;

  createdAt: string;
  updatedAt: string;

  guest: ReservationGuestDetails;
  rooms: ReservationRoomDetails[];
  payments: ReservationPaymentDetails[];
  changes: ReservationChangeDetails[];

  createdByAdmin: AdminSummary | null;
  approvedByAdmin: AdminSummary | null;
};
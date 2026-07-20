import type { ReservationStatus } from "@/types/reservation";

export type ApproveReservationRequest = {
  adminNotes?: string;
};

export type RejectReservationRequest = {
  reason: string;
  adminNotes?: string;
};

export type CancelReservationRequest = {
  reason: string;
  adminNotes?: string;
};

export type ReservationActionGuest = {
  firstName: string;
  lastName: string;
  email: string;
};

export type ReservationActionAllocatedRoom = {
  id: string;
  code: string;
  name: string;
};

export type ReservationActionRoom = {
  reservationRoomId: string;
  roomTypeId: string;
  roomTypeNameRo: string;
  roomTypeNameEn: string;
  allocatedRoom: ReservationActionAllocatedRoom | null;
};

export type ReservationActionAdmin = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type ReservationReviewResponse = {
  id: string;
  status: ReservationStatus;

  guest: ReservationActionGuest;
  rooms: ReservationActionRoom[];

  approvedByAdmin: ReservationActionAdmin | null;

  approvedAt: string | null;
  rejectedAt: string | null;

  approvalExpiresAt: string | null;
  paymentExpiresAt: string | null;
  paymentAccessTokenExpiresAt: string | null;

  rejectionReason: string | null;
  adminNotes: string | null;

  message: string;
};

export type ApproveReservationResponse =
  ReservationReviewResponse & {
    paymentUrl: string;
  };

export type RejectReservationResponse =
  ReservationReviewResponse;

export type ReservationRefund = {
  paymentId: string;
  stripeRefundId: string;
  amount: number;
};

export type CancelReservationResponse = {
  id: string;
  status: ReservationStatus;

  checkIn: string;
  checkOut: string;

  cancellationReason: string | null;
  cancelledAt: string | null;

  daysBeforeCheckIn: number;
  freeCancellation: boolean;

  previouslyPaidAmount: number;
  refundedAmount: number;
  retainedAmount: number;
  remainingPaidAmount: number;

  refunds: ReservationRefund[];

  roomsReleased: boolean;
  message: string;
};

export type StayActionGuest = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export type StayActionRoomType = {
  id: string;
  nameRo: string;
  nameEn: string;
};

export type StayActionAllocatedRoom = {
  id: string;
  name: string;
  code: string;
  tvDeviceId: string | null;
};

export type StayActionRoom = {
  reservationRoomId: string;
  roomType: StayActionRoomType;
  allocatedRoom: StayActionAllocatedRoom | null;
};

export type StayActionResponse = {
  id: string;
  status: ReservationStatus;

  checkIn: string;
  checkOut: string;

  checkInTime: string;
  checkOutTime: string;

  checkedInAt: string | null;
  checkedOutAt: string | null;

  guest: StayActionGuest;
  rooms: StayActionRoom[];

  tvWelcomeActive: boolean;
  roomsReleased: boolean;

  message: string;
};
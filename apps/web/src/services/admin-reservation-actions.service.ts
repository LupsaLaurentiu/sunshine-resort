import { apiRequest } from "@/lib/api";
import { getAdminAccessToken } from "@/lib/admin-auth";

import type {
  ApproveReservationRequest,
  ApproveReservationResponse,
  CancelReservationRequest,
  CancelReservationResponse,
  RejectReservationRequest,
  RejectReservationResponse,
  StayActionResponse,
} from "@/types/admin-reservation-actions";

function getToken(): string {
  const token = getAdminAccessToken();

  if (!token) {
    throw new Error(
      "Administratorul nu este autentificat.",
    );
  }

  return token;
}

export function approveReservation(
  reservationId: string,
  body: ApproveReservationRequest,
): Promise<ApproveReservationResponse> {
  return apiRequest<ApproveReservationResponse>(
    `/reservations/${reservationId}/approve`,
    {
      method: "PATCH",
      token: getToken(),
      body,
    },
  );
}

export function rejectReservation(
  reservationId: string,
  body: RejectReservationRequest,
): Promise<RejectReservationResponse> {
  return apiRequest<RejectReservationResponse>(
    `/reservations/${reservationId}/reject`,
    {
      method: "PATCH",
      token: getToken(),
      body,
    },
  );
}

export function cancelReservation(
  reservationId: string,
  body: CancelReservationRequest,
): Promise<CancelReservationResponse> {
  return apiRequest<CancelReservationResponse>(
    `/reservations/${reservationId}/cancel`,
    {
      method: "PATCH",
      token: getToken(),
      body,
    },
  );
}

export function checkInReservation(
  reservationId: string,
): Promise<StayActionResponse> {
  return apiRequest<StayActionResponse>(
    `/reservations/${reservationId}/check-in`,
    {
      method: "PATCH",
      token: getToken(),
    },
  );
}

export function checkOutReservation(
  reservationId: string,
): Promise<StayActionResponse> {
  return apiRequest<StayActionResponse>(
    `/reservations/${reservationId}/check-out`,
    {
      method: "PATCH",
      token: getToken(),
    },
  );
}
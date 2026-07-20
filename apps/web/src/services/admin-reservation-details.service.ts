import { apiRequest } from "@/lib/api";
import { getAdminAccessToken } from "@/lib/admin-auth";

import type { AdminReservationDetails } from "@/types/admin-reservation-details";

export function getAdminReservationDetails(
  reservationId: string,
): Promise<AdminReservationDetails> {
  const accessToken = getAdminAccessToken();

  if (!accessToken) {
    throw new Error(
      "Tokenul de autentificare al administratorului lipsește.",
    );
  }

  const encodedReservationId =
    encodeURIComponent(reservationId);

  return apiRequest<AdminReservationDetails>(
    `/reservations/${encodedReservationId}`,
    {
      method: "GET",
      token: accessToken,
      cache: "no-store",
    },
  );
}
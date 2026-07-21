import { apiRequest } from "@/lib/api";

import type {
  CreatePublicCheckoutRequest,
  PublicCheckoutResponse,
  PublicPaymentReservation,
} from "@/types/payment";

function buildPaymentAccessQuery(token: string): string {
  const searchParams = new URLSearchParams({
    token,
  });

  return searchParams.toString();
}

export function getPublicPaymentReservation(
  token: string,
): Promise<PublicPaymentReservation> {
  return apiRequest<PublicPaymentReservation>(
    `/reservations/payment-access?${buildPaymentAccessQuery(token)}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );
}

export function createPublicCheckout(
  payload: CreatePublicCheckoutRequest,
): Promise<PublicCheckoutResponse> {
  return apiRequest<PublicCheckoutResponse>(
    "/payments/public-checkout",
    {
      method: "POST",
      body: payload,
      cache: "no-store",
    },
  );
}
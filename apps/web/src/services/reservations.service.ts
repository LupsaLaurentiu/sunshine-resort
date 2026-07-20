import { apiRequest } from "@/lib/api";
import type {
  CreateReservationRequest,
  CreateReservationResponse,
} from "@/types/reservation";

export function createReservation(
  payload: CreateReservationRequest,
): Promise<CreateReservationResponse> {
  return apiRequest<CreateReservationResponse>("/reservations", {
    method: "POST",
    body: payload,
    cache: "no-store",
  });
}
import { apiRequest } from "@/lib/api";
import type {
  AvailabilityQuery,
  AvailabilityResponse,
} from "@/types/availability";

function buildAvailabilityQuery(
  query: AvailabilityQuery,
): string {
  const searchParams = new URLSearchParams({
    checkIn: query.checkIn,
    checkOut: query.checkOut,
    adults: query.adults.toString(),
  });

  return searchParams.toString();
}

export async function getAvailability(
  query: AvailabilityQuery,
): Promise<AvailabilityResponse> {
  return apiRequest<AvailabilityResponse>(
    `/availability?${buildAvailabilityQuery(query)}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );
}
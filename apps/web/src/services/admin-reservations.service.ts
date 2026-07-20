import { apiRequest } from "@/lib/api";
import { getAdminAccessToken } from "@/lib/admin-auth";

import type {
  AdminReservationsQuery,
  AdminReservationsResponse,
} from "@/types/admin-reservation";

function buildReservationsQuery(
  query: AdminReservationsQuery,
): string {
  const searchParams = new URLSearchParams();

  if (query.status) {
    searchParams.set("status", query.status);
  }

  if (query.source) {
    searchParams.set("source", query.source);
  }

  if (query.from) {
    searchParams.set("from", query.from);
  }

  if (query.to) {
    searchParams.set("to", query.to);
  }

  if (query.search?.trim()) {
    searchParams.set("search", query.search.trim());
  }

  if (query.page) {
    searchParams.set("page", query.page.toString());
  }

  if (query.limit) {
    searchParams.set("limit", query.limit.toString());
  }

  return searchParams.toString();
}

export function getAdminReservations(
  query: AdminReservationsQuery = {},
): Promise<AdminReservationsResponse> {
  const accessToken = getAdminAccessToken();

  if (!accessToken) {
    throw new Error(
      "Tokenul de autentificare al administratorului lipsește.",
    );
  }

  const queryString = buildReservationsQuery(query);

  const path = queryString
    ? `/reservations?${queryString}`
    : "/reservations";

  return apiRequest<AdminReservationsResponse>(path, {
    method: "GET",
    token: accessToken,
    cache: "no-store",
  });
}
import { apiRequest } from "@/lib/api";
import { getAdminAccessToken } from "@/lib/admin-auth";

import type {
  CalendarQuery,
  CalendarResponse,
} from "@/types/admin-calendar";

function buildCalendarQuery(
  query: CalendarQuery,
): string {
  const searchParams = new URLSearchParams({
    from: query.from,
    to: query.to,
  });

  if (query.includePending !== undefined) {
    searchParams.set(
      "includePending",
      String(query.includePending),
    );
  }

  return searchParams.toString();
}

export function getAdminCalendar(
  query: CalendarQuery,
): Promise<CalendarResponse> {
  const token = getAdminAccessToken();

  if (!token) {
    throw new Error(
      "Administratorul nu este autentificat.",
    );
  }

  return apiRequest<CalendarResponse>(
    `/admin/calendar?${buildCalendarQuery(query)}`,
    {
      method: "GET",
      token,
      cache: "no-store",
    },
  );
}
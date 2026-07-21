"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { ApiError } from "@/lib/api";
import { getAdminCalendar } from "@/services/admin-calendar.service";

import type {
  CalendarDateRange,
  CalendarQuery,
  CalendarResponse,
} from "@/types/admin-calendar";

type UseAdminCalendarOptions = {
  initialRange: CalendarDateRange;
  includePending?: boolean;
};

function getErrorMessage(
  caughtError: unknown,
): string {
  if (caughtError instanceof ApiError) {
    return caughtError.message;
  }

  if (caughtError instanceof Error) {
    return caughtError.message;
  }

  return "Calendarul nu a putut fi încărcat.";
}

export function useAdminCalendar({
  initialRange,
  includePending = true,
}: UseAdminCalendarOptions) {
  const [calendar, setCalendar] =
    useState<CalendarResponse | null>(null);

  const [range, setRange] =
    useState<CalendarDateRange>(
      initialRange,
    );

  const [
    shouldIncludePending,
    setShouldIncludePending,
  ] = useState(includePending);

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const query = useMemo<CalendarQuery>(
    () => ({
      from: range.from,
      to: range.to,
      includePending:
        shouldIncludePending,
    }),
    [
      range.from,
      range.to,
      shouldIncludePending,
    ],
  );

  const loadCalendar = useCallback(
    async (
      nextQuery: CalendarQuery = query,
    ): Promise<CalendarResponse | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response =
          await getAdminCalendar(
            nextQuery,
          );

        setCalendar(response);

        return response;
      } catch (caughtError) {
        setCalendar(null);
        setError(
          getErrorMessage(
            caughtError,
          ),
        );

        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [query],
  );

  useEffect(() => {
    void loadCalendar(query);
  }, [loadCalendar, query]);

  const updateRange = useCallback(
    (
      nextRange: CalendarDateRange,
    ) => {
      setRange(nextRange);
    },
    [],
  );

  const updateIncludePending =
    useCallback(
      (value: boolean) => {
        setShouldIncludePending(value);
      },
      [],
    );

  const refresh = useCallback(
    async () => {
      return loadCalendar(query);
    },
    [loadCalendar, query],
  );

  return {
    calendar,
    rooms: calendar?.rooms ?? [],
    events: calendar?.events ?? [],
    unassignedReservations:
      calendar?.unassignedReservations ??
      [],
    summary:
      calendar?.summary ?? {
        roomCount: 0,
        reservationEventCount: 0,
        blockedPeriodCount: 0,
        externalEventCount: 0,
        unassignedReservationCount: 0,
      },

    range,
    includePending:
      shouldIncludePending,

    error,
    isLoading,
    hasData:
      calendar !== null,

    updateRange,
    updateIncludePending,
    refresh,
  };
}
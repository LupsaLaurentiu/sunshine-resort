"use client";

import { useCallback, useEffect, useState } from "react";

import { ApiError } from "@/lib/api";
import { getAdminReservations } from "@/services/admin-reservations.service";

import type { AsyncStatus } from "@/types/api";
import type {
  AdminReservationsQuery,
  AdminReservationsResponse,
} from "@/types/admin-reservation";

const initialQuery: Required<
  Pick<AdminReservationsQuery, "page" | "limit">
> = {
  page: 1,
  limit: 20,
};

export function useAdminReservations(
  initialFilters: AdminReservationsQuery = {},
) {
  const [data, setData] =
    useState<AdminReservationsResponse | null>(null);

  const [query, setQuery] =
    useState<AdminReservationsQuery>({
      ...initialQuery,
      ...initialFilters,
    });

  const [status, setStatus] =
    useState<AsyncStatus>("idle");

  const [error, setError] =
    useState<string | null>(null);

  const fetchReservations = useCallback(
    async (
      nextQuery: AdminReservationsQuery = query,
    ): Promise<AdminReservationsResponse | null> => {
      setStatus("loading");
      setError(null);

      try {
        const response =
          await getAdminReservations(nextQuery);

        setData(response);
        setStatus("success");

        return response;
      } catch (caughtError) {
        const message =
          caughtError instanceof ApiError
            ? caughtError.message
            : caughtError instanceof Error
              ? caughtError.message
              : "Rezervările nu au putut fi încărcate.";

        setData(null);
        setError(message);
        setStatus("error");

        return null;
      }
    },
    [query],
  );

  const updateFilters = useCallback(
    (
      filters: Partial<AdminReservationsQuery>,
    ) => {
      setQuery((current) => ({
        ...current,
        ...filters,
        page:
          filters.page ??
          (Object.prototype.hasOwnProperty.call(
            filters,
            "page",
          )
            ? filters.page
            : 1),
      }));
    },
    [],
  );

  const setPage = useCallback((page: number) => {
    setQuery((current) => ({
      ...current,
      page: Math.max(1, page),
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setQuery(initialQuery);
  }, []);

  const refresh = useCallback(async () => {
    return fetchReservations(query);
  }, [fetchReservations, query]);

  useEffect(() => {
    void fetchReservations(query);
  }, [fetchReservations, query]);

  return {
    reservations: data?.items ?? [],
    pagination:
      data?.pagination ?? {
        page: query.page ?? 1,
        limit: query.limit ?? 20,
        totalItems: 0,
        totalPages: 0,
      },

    query,
    error,
    status,

    isIdle: status === "idle",
    isLoading: status === "loading",
    isSuccess: status === "success",
    isError: status === "error",

    updateFilters,
    setPage,
    resetFilters,
    refresh,
  };
}
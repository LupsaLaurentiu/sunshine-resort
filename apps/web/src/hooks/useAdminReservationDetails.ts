"use client";

import { useCallback, useEffect, useState } from "react";

import { ApiError } from "@/lib/api";
import { getAdminReservationDetails } from "@/services/admin-reservation-details.service";

import type { AsyncStatus } from "@/types/api";
import type { AdminReservationDetails } from "@/types/admin-reservation-details";

export function useAdminReservationDetails(
  reservationId: string,
) {
  const [reservation, setReservation] =
    useState<AdminReservationDetails | null>(null);

  const [status, setStatus] =
    useState<AsyncStatus>("idle");

  const [error, setError] =
    useState<string | null>(null);

  const loadReservation = useCallback(async () => {
    if (!reservationId) {
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const response =
        await getAdminReservationDetails(
          reservationId,
        );

      setReservation(response);
      setStatus("success");
    } catch (caughtError) {
      const message =
        caughtError instanceof ApiError
          ? caughtError.message
          : caughtError instanceof Error
            ? caughtError.message
            : "Rezervarea nu a putut fi încărcată.";

      setReservation(null);
      setError(message);
      setStatus("error");
    }
  }, [reservationId]);

  useEffect(() => {
    void loadReservation();
  }, [loadReservation]);

  return {
    reservation,

    error,
    status,

    isIdle: status === "idle",
    isLoading: status === "loading",
    isSuccess: status === "success",
    isError: status === "error",

    refresh: loadReservation,
  };
}
"use client";

import { useCallback, useState } from "react";

import { ApiError } from "@/lib/api";
import { createReservation } from "@/services/reservations.service";

import type { AsyncStatus } from "@/types/api";
import type {
  CreateReservationRequest,
  CreateReservationResponse,
} from "@/types/reservation";

export function useCreateReservation() {
  const [reservation, setReservation] =
    useState<CreateReservationResponse | null>(null);

  const [status, setStatus] =
    useState<AsyncStatus>("idle");

  const [error, setError] =
    useState<string | null>(null);

  const submitReservation = useCallback(
    async (
      payload: CreateReservationRequest,
    ): Promise<CreateReservationResponse | null> => {
      setStatus("loading");
      setError(null);

      try {
        const response =
          await createReservation(payload);

        setReservation(response);
        setStatus("success");

        return response;
      } catch (caughtError) {
        const message =
          caughtError instanceof ApiError
            ? caughtError.message
            : "Rezervarea nu a putut fi trimisă.";

        setReservation(null);
        setError(message);
        setStatus("error");

        return null;
      }
    },
    [],
  );

  const resetReservation = useCallback(() => {
    setReservation(null);
    setError(null);
    setStatus("idle");
  }, []);

  return {
    reservation,
    status,
    error,
    isLoading: status === "loading",
    submitReservation,
    resetReservation,
  };
}
"use client";

import { useCallback, useState } from "react";

import { ApiError } from "@/lib/api";
import { getAvailability } from "@/services/availability.service";
import type { AsyncStatus } from "@/types/api";
import type {
  AvailabilityQuery,
  AvailabilityResponse,
} from "@/types/availability";

export function useAvailability() {
  const [availability, setAvailability] =
    useState<AvailabilityResponse | null>(null);

  const [status, setStatus] =
    useState<AsyncStatus>("idle");

  const [error, setError] =
    useState<string | null>(null);

  const searchAvailability = useCallback(
    async (
      query: AvailabilityQuery,
    ): Promise<AvailabilityResponse | null> => {
      setStatus("loading");
      setError(null);
      setAvailability(null);

      try {
        const response = await getAvailability(query);

        setAvailability(response);
        setStatus("success");

        return response;
      } catch (caughtError) {
        const message =
          caughtError instanceof ApiError
            ? caughtError.message
            : "Disponibilitatea nu a putut fi verificată.";

        setAvailability(null);
        setError(message);
        setStatus("error");

        return null;
      }
    },
    [],
  );

  const resetAvailability = useCallback(() => {
    setAvailability(null);
    setError(null);
    setStatus("idle");
  }, []);

  return {
    availability,
    status,
    error,
    isIdle: status === "idle",
    isLoading: status === "loading",
    isSuccess: status === "success",
    isError: status === "error",
    searchAvailability,
    resetAvailability,
  };
}
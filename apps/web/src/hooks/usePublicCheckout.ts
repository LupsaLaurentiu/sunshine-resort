"use client";

import { useCallback, useState } from "react";

import { ApiError } from "@/lib/api";
import { createPublicCheckout } from "@/services/payments.service";

import type {
  CreatePublicCheckoutRequest,
  PublicCheckoutResponse,
} from "@/types/payment";

export function usePublicCheckout() {
  const [checkout, setCheckout] =
    useState<PublicCheckoutResponse | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [isLoading, setIsLoading] =
    useState(false);

  const startCheckout = useCallback(
    async (
      payload: CreatePublicCheckoutRequest,
    ): Promise<PublicCheckoutResponse | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response =
          await createPublicCheckout(payload);

        setCheckout(response);

        window.location.assign(response.checkoutUrl);

        return response;
      } catch (caughtError) {
        const message =
          caughtError instanceof ApiError
            ? caughtError.message
            : caughtError instanceof Error
              ? caughtError.message
              : "Sesiunea de plată nu a putut fi creată.";

        setCheckout(null);
        setError(message);

        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetCheckout = useCallback(() => {
    setCheckout(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    checkout,
    error,
    isLoading,

    startCheckout,
    clearError,
    resetCheckout,
  };
}
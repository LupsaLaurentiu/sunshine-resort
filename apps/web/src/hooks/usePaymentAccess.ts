"use client";

import { useCallback, useEffect, useState } from "react";

import { ApiError } from "@/lib/api";
import { getPublicPaymentReservation } from "@/services/payments.service";

import type { PublicPaymentReservation } from "@/types/payment";

export function usePaymentAccess(token: string) {
  const [reservation, setReservation] =
    useState<PublicPaymentReservation | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] = useState<
    string | null
  >(null);

  const loadReservation = useCallback(async () => {
    if (!token) {
      setReservation(null);
      setError("Tokenul de plată lipsește.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response =
        await getPublicPaymentReservation(token);

      setReservation(response);
    } catch (caughtError) {
      if (caughtError instanceof ApiError) {
        setError(caughtError.message);
      } else if (caughtError instanceof Error) {
        setError(caughtError.message);
      } else {
        setError(
          "Rezervarea nu a putut fi încărcată.",
        );
      }

      setReservation(null);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadReservation();
  }, [loadReservation]);

  return {
    reservation,
    error,
    isLoading,
    refresh: loadReservation,
  };
}
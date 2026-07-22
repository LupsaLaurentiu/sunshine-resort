"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { ApiError } from "@/lib/api";

import {
  createAdminRatePeriod,
  deactivateAdminRatePeriod,
  getAdminRatePeriods,
  updateAdminRatePeriod,
} from "@/services/admin-rate-periods.service";

import type {
  AdminRatePeriod,
  CreateAdminRatePeriodRequest,
  UpdateAdminRatePeriodRequest,
} from "@/types/admin-rate-period";

function sortRatePeriods(
  ratePeriods: AdminRatePeriod[],
): AdminRatePeriod[] {
  return [...ratePeriods].sort(
    (firstPeriod, secondPeriod) => {
      const startDateComparison =
        firstPeriod.startDate.localeCompare(
          secondPeriod.startDate,
        );

      if (startDateComparison !== 0) {
        return startDateComparison;
      }

      const firstRoomTypeName =
        firstPeriod.roomType?.nameRo ?? "";

      const secondRoomTypeName =
        secondPeriod.roomType?.nameRo ?? "";

      return firstRoomTypeName.localeCompare(
        secondRoomTypeName,
        "ro",
        {
          sensitivity: "base",
        },
      );
    },
  );
}

export function useAdminRatePeriods() {
  const [
    ratePeriods,
    setRatePeriods,
  ] = useState<AdminRatePeriod[]>([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const loadRatePeriods =
    useCallback(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response =
          await getAdminRatePeriods();

        setRatePeriods(
          sortRatePeriods(response),
        );
      } catch (caughtError) {
        setError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "Perioadele tarifare nu au putut fi încărcate.",
        );
      } finally {
        setIsLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadRatePeriods();
  }, [loadRatePeriods]);

  const createRatePeriod =
    useCallback(
      async (
        payload: CreateAdminRatePeriodRequest,
      ): Promise<AdminRatePeriod | null> => {
        setIsSaving(true);
        setError(null);

        try {
          const created =
            await createAdminRatePeriod(
              payload,
            );

          setRatePeriods(
            (current) =>
              sortRatePeriods([
                ...current,
                created,
              ]),
          );

          return created;
        } catch (caughtError) {
          setError(
            caughtError instanceof ApiError
              ? caughtError.message
              : "Perioada tarifară nu a putut fi creată.",
          );

          return null;
        } finally {
          setIsSaving(false);
        }
      },
      [],
    );

  const updateRatePeriod =
    useCallback(
      async (
        ratePeriodId: string,
        payload: UpdateAdminRatePeriodRequest,
      ): Promise<AdminRatePeriod | null> => {
        setIsSaving(true);
        setError(null);

        try {
          const updated =
            await updateAdminRatePeriod(
              ratePeriodId,
              payload,
            );

          setRatePeriods(
            (current) =>
              sortRatePeriods(
                current.map(
                  (period) =>
                    period.id ===
                    ratePeriodId
                      ? updated
                      : period,
                ),
              ),
          );

          return updated;
        } catch (caughtError) {
          setError(
            caughtError instanceof ApiError
              ? caughtError.message
              : "Perioada tarifară nu a putut fi actualizată.",
          );

          return null;
        } finally {
          setIsSaving(false);
        }
      },
      [],
    );

  /*
   * Backend-ul folosește:
   *
   * DELETE /rate-periods/:id
   *
   * De aceea perioada este eliminată din lista locală,
   * nu doar marcată cu isActive: false.
   *
   * Numele este păstrat pentru compatibilitate cu
   * componenta AdminRates existentă.
   */
  const deactivateRatePeriod =
    useCallback(
      async (
        ratePeriodId: string,
      ): Promise<boolean> => {
        setIsSaving(true);
        setError(null);

        try {
          await deactivateAdminRatePeriod(
            ratePeriodId,
          );

          setRatePeriods(
            (current) =>
              current.filter(
                (period) =>
                  period.id !==
                  ratePeriodId,
              ),
          );

          return true;
        } catch (caughtError) {
          setError(
            caughtError instanceof ApiError
              ? caughtError.message
              : "Perioada tarifară nu a putut fi eliminată.",
          );

          return false;
        } finally {
          setIsSaving(false);
        }
      },
      [],
    );

  const clearError =
    useCallback(() => {
      setError(null);
    }, []);

  return {
    ratePeriods,

    error,
    isLoading,
    isSaving,

    refresh: loadRatePeriods,

    createRatePeriod,
    updateRatePeriod,
    deactivateRatePeriod,

    clearError,
  };
}
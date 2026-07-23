"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { ApiError } from "@/lib/api";

import {
  createAdminBlockedPeriod,
  deleteAdminBlockedPeriod,
  getAdminBlockedPeriods,
  updateAdminBlockedPeriod,
} from "@/services/admin-blocked-periods.service";

import type {
  AdminBlockedPeriod,
  CreateAdminBlockedPeriodRequest,
  GetAdminBlockedPeriodsQuery,
  UpdateAdminBlockedPeriodRequest,
} from "@/types/admin-blocked-period";

function sortBlockedPeriods(
  blockedPeriods: AdminBlockedPeriod[],
): AdminBlockedPeriod[] {
  return [...blockedPeriods].sort(
    (
      firstPeriod,
      secondPeriod,
    ) => {
      const startDateComparison =
        firstPeriod.startDate.localeCompare(
          secondPeriod.startDate,
        );

      if (startDateComparison !== 0) {
        return startDateComparison;
      }

      return firstPeriod.room.code.localeCompare(
        secondPeriod.room.code,
        undefined,
        {
          numeric: true,
          sensitivity: "base",
        },
      );
    },
  );
}

export function useAdminBlockedPeriods(
  initialQuery?: GetAdminBlockedPeriodsQuery,
) {
  const [
    blockedPeriods,
    setBlockedPeriods,
  ] = useState<AdminBlockedPeriod[]>([]);

  const [
    query,
    setQuery,
  ] = useState<GetAdminBlockedPeriodsQuery>(
    initialQuery ?? {},
  );

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    isDeleting,
    setIsDeleting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const loadBlockedPeriods =
    useCallback(
      async (
        nextQuery: GetAdminBlockedPeriodsQuery =
          query,
      ) => {
        setIsLoading(true);
        setError(null);

        try {
          const response =
            await getAdminBlockedPeriods(
              nextQuery,
            );

          setBlockedPeriods(
            sortBlockedPeriods(
              response,
            ),
          );
        } catch (caughtError) {
          setError(
            caughtError instanceof ApiError
              ? caughtError.message
              : "Perioadele de blocare nu au putut fi încărcate.",
          );
        } finally {
          setIsLoading(false);
        }
      },
      [query],
    );

  useEffect(() => {
    void loadBlockedPeriods();
  }, [loadBlockedPeriods]);

  const updateQuery =
    useCallback(
      (
        nextQuery: GetAdminBlockedPeriodsQuery,
      ) => {
        setQuery(nextQuery);
      },
      [],
    );

  const createBlockedPeriod =
    useCallback(
      async (
        payload: CreateAdminBlockedPeriodRequest,
      ): Promise<AdminBlockedPeriod | null> => {
        setIsSaving(true);
        setError(null);

        try {
          const created =
            await createAdminBlockedPeriod(
              payload,
            );

          setBlockedPeriods(
            (current) =>
              sortBlockedPeriods([
                ...current,
                created,
              ]),
          );

          return created;
        } catch (caughtError) {
          setError(
            caughtError instanceof ApiError
              ? caughtError.message
              : "Blocarea nu a putut fi creată.",
          );

          return null;
        } finally {
          setIsSaving(false);
        }
      },
      [],
    );

  const updateBlockedPeriod =
    useCallback(
      async (
        blockedPeriodId: string,
        payload: UpdateAdminBlockedPeriodRequest,
      ): Promise<AdminBlockedPeriod | null> => {
        setIsSaving(true);
        setError(null);

        try {
          const updated =
            await updateAdminBlockedPeriod(
              blockedPeriodId,
              payload,
            );

          setBlockedPeriods(
            (current) =>
              sortBlockedPeriods(
                current.map(
                  (period) =>
                    period.id ===
                    blockedPeriodId
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
              : "Blocarea nu a putut fi actualizată.",
          );

          return null;
        } finally {
          setIsSaving(false);
        }
      },
      [],
    );

  const removeBlockedPeriod =
    useCallback(
      async (
        blockedPeriodId: string,
      ): Promise<boolean> => {
        setIsDeleting(true);
        setError(null);

        try {
          await deleteAdminBlockedPeriod(
            blockedPeriodId,
          );

          setBlockedPeriods(
            (current) =>
              current.filter(
                (period) =>
                  period.id !==
                  blockedPeriodId,
              ),
          );

          return true;
        } catch (caughtError) {
          setError(
            caughtError instanceof ApiError
              ? caughtError.message
              : "Blocarea nu a putut fi ștearsă.",
          );

          return false;
        } finally {
          setIsDeleting(false);
        }
      },
      [],
    );

  const refresh =
    useCallback(async () => {
      await loadBlockedPeriods(
        query,
      );
    }, [
      loadBlockedPeriods,
      query,
    ]);

  const clearError =
    useCallback(() => {
      setError(null);
    }, []);

  return {
    blockedPeriods,
    query,

    error,
    isLoading,
    isSaving,
    isDeleting,

    refresh,
    updateQuery,

    createBlockedPeriod,
    updateBlockedPeriod,
    removeBlockedPeriod,

    clearError,
  };
}
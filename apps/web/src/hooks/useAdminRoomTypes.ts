"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { ApiError } from "@/lib/api";

import {
  createAdminRoomType,
  deactivateAdminRoomType,
  getAdminRoomTypes,
  updateAdminRoomType,
} from "@/services/admin-room-types.service";

import type {
  AdminRoomType,
  CreateAdminRoomTypePayload,
  UpdateAdminRoomTypePayload,
} from "@/types/admin-room-type";

export function useAdminRoomTypes() {
  const [
    roomTypes,
    setRoomTypes,
  ] = useState<AdminRoomType[]>([]);

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

  const loadRoomTypes =
    useCallback(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response =
          await getAdminRoomTypes();

        setRoomTypes(
          [...response].sort(
            (
              firstRoomType,
              secondRoomType,
            ) =>
              firstRoomType.nameRo.localeCompare(
                secondRoomType.nameRo,
                "ro",
                {
                  sensitivity: "base",
                },
              ),
          ),
        );
      } catch (caughtError) {
        setError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "Tipurile de apartamente nu au putut fi încărcate.",
        );
      } finally {
        setIsLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadRoomTypes();
  }, [loadRoomTypes]);

  const createRoomType =
    useCallback(
      async (
        payload: CreateAdminRoomTypePayload,
      ): Promise<AdminRoomType | null> => {
        setIsSaving(true);
        setError(null);

        try {
          const created =
            await createAdminRoomType(
              payload,
            );

          setRoomTypes(
            (current) =>
              [
                ...current,
                created,
              ].sort(
                (
                  firstRoomType,
                  secondRoomType,
                ) =>
                  firstRoomType.nameRo.localeCompare(
                    secondRoomType.nameRo,
                    "ro",
                    {
                      sensitivity:
                        "base",
                    },
                  ),
              ),
          );

          return created;
        } catch (caughtError) {
          setError(
            caughtError instanceof ApiError
              ? caughtError.message
              : "Tipul de apartament nu a putut fi creat.",
          );

          return null;
        } finally {
          setIsSaving(false);
        }
      },
      [],
    );

  const updateRoomType =
    useCallback(
      async (
        roomTypeId: string,
        payload: UpdateAdminRoomTypePayload,
      ): Promise<AdminRoomType | null> => {
        setIsSaving(true);
        setError(null);

        try {
          const updated =
            await updateAdminRoomType(
              roomTypeId,
              payload,
            );

          setRoomTypes(
            (current) =>
              current
                .map((roomType) =>
                  roomType.id ===
                  roomTypeId
                    ? updated
                    : roomType,
                )
                .sort(
                  (
                    firstRoomType,
                    secondRoomType,
                  ) =>
                    firstRoomType.nameRo.localeCompare(
                      secondRoomType.nameRo,
                      "ro",
                      {
                        sensitivity:
                          "base",
                      },
                    ),
                ),
          );

          return updated;
        } catch (caughtError) {
          setError(
            caughtError instanceof ApiError
              ? caughtError.message
              : "Tipul de apartament nu a putut fi actualizat.",
          );

          return null;
        } finally {
          setIsSaving(false);
        }
      },
      [],
    );

  const deactivateRoomType =
    useCallback(
      async (
        roomTypeId: string,
      ): Promise<boolean> => {
        setIsSaving(true);
        setError(null);

        try {
          const updated =
            await deactivateAdminRoomType(
              roomTypeId,
            );

          setRoomTypes(
            (current) =>
              current.map((roomType) =>
                roomType.id ===
                roomTypeId
                  ? updated
                  : roomType,
              ),
          );

          return true;
        } catch (caughtError) {
          setError(
            caughtError instanceof ApiError
              ? caughtError.message
              : "Tipul de apartament nu a putut fi dezactivat.",
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
    roomTypes,

    isLoading,
    isSaving,
    error,

    refresh: loadRoomTypes,

    createRoomType,
    updateRoomType,
    deactivateRoomType,

    clearError,
  };
}
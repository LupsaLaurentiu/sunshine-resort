"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { ApiError } from "@/lib/api";

import {
  createAdminRoom,
  getAdminRooms,
  updateAdminRoom,
} from "@/services/admin-rooms.service";

import type {
  AdminRoom,
  CreateAdminRoomRequest,
  UpdateAdminRoomRequest,
} from "@/types/admin-room";

function getErrorMessage(
  caughtError: unknown,
): string {
  if (caughtError instanceof ApiError) {
    return caughtError.message;
  }

  if (caughtError instanceof Error) {
    return caughtError.message;
  }

  return "Camerele nu au putut fi încărcate.";
}

export function useAdminRooms() {
  const [rooms, setRooms] =
    useState<AdminRoom[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const loadRooms = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response =
        await getAdminRooms();

      setRooms(response);
    } catch (caughtError) {
      setRooms([]);
      setError(
        getErrorMessage(
          caughtError,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRooms();
  }, [loadRooms]);

  const createRoom = useCallback(
    async (
      payload: CreateAdminRoomRequest,
    ): Promise<AdminRoom | null> => {
      setIsSaving(true);
      setError(null);

      try {
        const createdRoom =
          await createAdminRoom(
            payload,
          );

        setRooms((currentRooms) =>
          [...currentRooms, createdRoom].sort(
            (firstRoom, secondRoom) =>
              firstRoom.code.localeCompare(
                secondRoom.code,
                undefined,
                {
                  numeric: true,
                  sensitivity: "base",
                },
              ),
          ),
        );

        return createdRoom;
      } catch (caughtError) {
        setError(
          getErrorMessage(
            caughtError,
          ),
        );

        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  const updateRoom = useCallback(
    async (
      roomId: string,
      payload: UpdateAdminRoomRequest,
    ): Promise<AdminRoom | null> => {
      setIsSaving(true);
      setError(null);

      try {
        const updatedRoom =
          await updateAdminRoom(
            roomId,
            payload,
          );

        setRooms((currentRooms) =>
          currentRooms
            .map((room) =>
              room.id === roomId
                ? updatedRoom
                : room,
            )
            .sort(
              (
                firstRoom,
                secondRoom,
              ) =>
                firstRoom.code.localeCompare(
                  secondRoom.code,
                  undefined,
                  {
                    numeric: true,
                    sensitivity: "base",
                  },
                ),
            ),
        );

        return updatedRoom;
      } catch (caughtError) {
        setError(
          getErrorMessage(
            caughtError,
          ),
        );

        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  const roomTypes = useMemo(() => {
    const roomTypesById = new Map<
      string,
      AdminRoom["roomType"]
    >();

    for (const room of rooms) {
      roomTypesById.set(
        room.roomType.id,
        room.roomType,
      );
    }

    return Array.from(
      roomTypesById.values(),
    ).sort((firstType, secondType) =>
      firstType.nameRo.localeCompare(
        secondType.nameRo,
        "ro",
      ),
    );
  }, [rooms]);

  const roomsByType = useMemo(() => {
    const groupedRooms = new Map<
      string,
      AdminRoom[]
    >();

    for (const room of rooms) {
      const currentRooms =
        groupedRooms.get(
          room.roomTypeId,
        ) ?? [];

      currentRooms.push(room);

      groupedRooms.set(
        room.roomTypeId,
        currentRooms,
      );
    }

    return groupedRooms;
  }, [rooms]);

  const refresh = useCallback(async () => {
    await loadRooms();
  }, [loadRooms]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    rooms,
    roomTypes,
    roomsByType,

    error,
    isLoading,
    isSaving,

    createRoom,
    updateRoom,
    refresh,
    clearError,
  };
}
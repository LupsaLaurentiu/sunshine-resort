"use client";

import { useCallback, useState } from "react";

import { ApiError } from "@/lib/api";
import {
  approveReservation,
  cancelReservation,
  checkInReservation,
  checkOutReservation,
  rejectReservation,
} from "@/services/admin-reservation-actions.service";

import type {
  ApproveReservationRequest,
  ApproveReservationResponse,
  CancelReservationRequest,
  CancelReservationResponse,
  RejectReservationRequest,
  RejectReservationResponse,
  StayActionResponse,
} from "@/types/admin-reservation-actions";

export type ReservationActionType =
  | "approve"
  | "reject"
  | "cancel"
  | "check-in"
  | "check-out";

type ReservationActionResult =
  | ApproveReservationResponse
  | RejectReservationResponse
  | CancelReservationResponse
  | StayActionResponse;

export function useReservationActions(
  reservationId: string,
) {
  const [activeAction, setActiveAction] =
    useState<ReservationActionType | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  function getErrorMessage(caughtError: unknown): string {
    if (caughtError instanceof ApiError) {
      return caughtError.message;
    }

    if (caughtError instanceof Error) {
      return caughtError.message;
    }

    return "Operațiunea nu a putut fi finalizată.";
  }

  const executeAction = useCallback(
    async <T extends ReservationActionResult>(
      action: ReservationActionType,
      request: () => Promise<T>,
    ): Promise<T | null> => {
      if (!reservationId) {
        setError("ID-ul rezervării lipsește.");
        return null;
      }

      setActiveAction(action);
      setError(null);
      setSuccessMessage(null);

      try {
        const response = await request();

        setSuccessMessage(response.message);

        return response;
      } catch (caughtError) {
        setError(getErrorMessage(caughtError));

        return null;
      } finally {
        setActiveAction(null);
      }
    },
    [reservationId],
  );

  const approve = useCallback(
    async (
      payload: ApproveReservationRequest,
    ): Promise<ApproveReservationResponse | null> => {
      return executeAction(
        "approve",
        () =>
          approveReservation(
            reservationId,
            payload,
          ),
      );
    },
    [executeAction, reservationId],
  );

  const reject = useCallback(
    async (
      payload: RejectReservationRequest,
    ): Promise<RejectReservationResponse | null> => {
      return executeAction(
        "reject",
        () =>
          rejectReservation(
            reservationId,
            payload,
          ),
      );
    },
    [executeAction, reservationId],
  );

  const cancel = useCallback(
    async (
      payload: CancelReservationRequest,
    ): Promise<CancelReservationResponse | null> => {
      return executeAction(
        "cancel",
        () =>
          cancelReservation(
            reservationId,
            payload,
          ),
      );
    },
    [executeAction, reservationId],
  );

  const checkIn = useCallback(
    async (): Promise<StayActionResponse | null> => {
      return executeAction(
        "check-in",
        () =>
          checkInReservation(
            reservationId,
          ),
      );
    },
    [executeAction, reservationId],
  );

  const checkOut = useCallback(
    async (): Promise<StayActionResponse | null> => {
      return executeAction(
        "check-out",
        () =>
          checkOutReservation(
            reservationId,
          ),
      );
    },
    [executeAction, reservationId],
  );

  const clearFeedback = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  return {
    activeAction,
    error,
    successMessage,

    isLoading: activeAction !== null,
    isApproving: activeAction === "approve",
    isRejecting: activeAction === "reject",
    isCancelling: activeAction === "cancel",
    isCheckingIn: activeAction === "check-in",
    isCheckingOut: activeAction === "check-out",

    approve,
    reject,
    cancel,
    checkIn,
    checkOut,
    clearFeedback,
  };
}
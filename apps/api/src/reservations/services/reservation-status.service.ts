import { Injectable } from '@nestjs/common';
import { ReservationStatus } from '@prisma/client';
import { assertReservationTransition } from '../utils/assert-reservation-transition';

export type ReservationStatusUpdate = {
  status: ReservationStatus;

  approvedAt?: Date;
  rejectedAt?: Date;
  cancelledAt?: Date;
  confirmedAt?: Date;
  checkedInAt?: Date;
  checkedOutAt?: Date;

  approvalExpiresAt?: Date | null;
  paymentExpiresAt?: Date | null;

  rejectionReason?: string;
  cancellationReason?: string;
};

@Injectable()
export class ReservationStatusService {
  private static readonly APPROVAL_WINDOW_HOURS = 24;
  private static readonly PAYMENT_WINDOW_HOURS = 24;

  buildInitialPendingStatus(now = new Date()): ReservationStatusUpdate {
    return {
      status: ReservationStatus.PENDING_APPROVAL,
      approvalExpiresAt: this.addHours(
        now,
        ReservationStatusService.APPROVAL_WINDOW_HOURS,
      ),
      paymentExpiresAt: null,
    };
  }

  buildApprovalUpdate(
    currentStatus: ReservationStatus,
    now = new Date(),
  ): ReservationStatusUpdate {
    assertReservationTransition(
      currentStatus,
      ReservationStatus.APPROVED_AWAITING_PAYMENT,
    );

    return {
      status: ReservationStatus.APPROVED_AWAITING_PAYMENT,
      approvedAt: now,
      approvalExpiresAt: null,
      paymentExpiresAt: this.addHours(
        now,
        ReservationStatusService.PAYMENT_WINDOW_HOURS,
      ),
    };
  }

  buildRejectionUpdate(
    currentStatus: ReservationStatus,
    reason: string,
    now = new Date(),
  ): ReservationStatusUpdate {
    assertReservationTransition(
      currentStatus,
      ReservationStatus.REJECTED,
    );

    return {
      status: ReservationStatus.REJECTED,
      rejectedAt: now,
      rejectionReason: reason.trim(),
      approvalExpiresAt: null,
      paymentExpiresAt: null,
    };
  }

  buildConfirmationUpdate(
    currentStatus: ReservationStatus,
    now = new Date(),
  ): ReservationStatusUpdate {
    assertReservationTransition(
      currentStatus,
      ReservationStatus.CONFIRMED,
    );

    return {
      status: ReservationStatus.CONFIRMED,
      confirmedAt: now,
      approvalExpiresAt: null,
      paymentExpiresAt: null,
    };
  }

  buildCancellationUpdate(
    currentStatus: ReservationStatus,
    reason: string,
    now = new Date(),
  ): ReservationStatusUpdate {
    assertReservationTransition(
      currentStatus,
      ReservationStatus.CANCELLED,
    );

    return {
      status: ReservationStatus.CANCELLED,
      cancelledAt: now,
      cancellationReason: reason.trim(),
      approvalExpiresAt: null,
      paymentExpiresAt: null,
    };
  }

  buildExpirationUpdate(
    currentStatus: ReservationStatus,
  ): ReservationStatusUpdate {
    assertReservationTransition(
      currentStatus,
      ReservationStatus.EXPIRED,
    );

    return {
      status: ReservationStatus.EXPIRED,
      approvalExpiresAt: null,
      paymentExpiresAt: null,
    };
  }

  buildCheckInUpdate(
    currentStatus: ReservationStatus,
    now = new Date(),
  ): ReservationStatusUpdate {
    assertReservationTransition(
      currentStatus,
      ReservationStatus.CHECKED_IN,
    );

    return {
      status: ReservationStatus.CHECKED_IN,
      checkedInAt: now,
    };
  }

  buildCheckOutUpdate(
    currentStatus: ReservationStatus,
    now = new Date(),
  ): ReservationStatusUpdate {
    assertReservationTransition(
      currentStatus,
      ReservationStatus.CHECKED_OUT,
    );

    return {
      status: ReservationStatus.CHECKED_OUT,
      checkedOutAt: now,
    };
  }

  private addHours(date: Date, hours: number): Date {
    return new Date(date.getTime() + hours * 60 * 60 * 1000);
  }
}
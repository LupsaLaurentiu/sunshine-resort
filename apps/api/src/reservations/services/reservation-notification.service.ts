import { Injectable, Logger } from '@nestjs/common';
import { Locale } from '@prisma/client';
import { EmailService } from '../../email/email.service';

export type ReservationCreatedNotificationParams = {
  reservationId: string;

  guest: {
    firstName: string;
    email: string;
  };

  locale: Locale;

  checkInDate: Date;
  checkOutDate: Date;

  nights: number;
  adults: number;

  roomNames: string[];

  approvalExpiresAt?: Date | null;
};

export type ReservationApprovedNotificationParams = {
  reservationId: string;

  guest: {
    firstName: string;
    email: string;
  };

  locale: Locale;

  checkInDate: Date;
  checkOutDate: Date;

  nights: number;
  adults: number;

  roomNames: string[];

  totalPrice: number;
  depositAmount: number;

  paymentDeadline: Date;
  paymentUrl: string;
};

export type PaymentConfirmedNotificationParams = {
  reservationId: string;

  guest: {
    firstName: string;
    email: string;
  };

  locale: Locale;

  checkInDate: Date;
  checkOutDate: Date;

  nights: number;
  adults: number;

  roomNames: string[];

  amountPaid: number;
  totalPrice: number;
};

export type ReservationRejectedNotificationParams = {
  reservationId: string;

  guest: {
    firstName: string;
    email: string;
  };

  locale: Locale;

  checkInDate: Date;
  checkOutDate: Date;

  roomNames: string[];

  rejectionReason: string;
};

export type ReservationCancelledNotificationParams = {
  reservationId: string;

  guest: {
    firstName: string;
    email: string;
  };

  locale: Locale;

  checkInDate: Date;
  checkOutDate: Date;

  roomNames: string[];

  cancellationReason: string;

  previouslyPaidAmount: number;
  refundedAmount: number;
  retainedAmount: number;
};

export type SevenDayReminderNotificationParams = {
  reservationId: string;

  guest: {
    firstName: string;
    email: string;
  };

  locale: Locale;

  checkInDate: Date;
  checkOutDate: Date;

  checkInTime: string;
  checkOutTime: string;

  nights: number;
  adults: number;

  roomNames: string[];

  resortAddress: string;
  resortPhone: string;

  mapsUrl?: string;
};

export type OneDayReminderNotificationParams = {
  reservationId: string;

  guest: {
    firstName: string;
    email: string;
  };

  locale: Locale;

  checkInDate: Date;
  checkOutDate: Date;

  checkInTime: string;
  checkOutTime: string;

  roomNames: string[];

  resortAddress: string;
  resortPhone: string;

  parkingInstructions?: string;
  accessInstructions?: string;

  mapsUrl?: string;
};

export type PostStayNotificationParams = {
  reservationId: string;

  guest: {
    firstName: string;
    email: string;
  };

  locale: Locale;

  checkInDate: Date;
  checkOutDate: Date;

  roomNames: string[];

  googleReviewUrl?: string;
  bookingReviewUrl?: string;
  directBookingUrl?: string;
};

@Injectable()
export class ReservationNotificationService {
  private readonly logger = new Logger(
    ReservationNotificationService.name,
  );

  constructor(
    private readonly emailService: EmailService,
  ) {}

  async sendReservationCreated(
    params: ReservationCreatedNotificationParams,
  ): Promise<void> {
    try {
      await this.emailService.sendReservationCreatedEmail({
        to: params.guest.email,

        guestFirstName:
          params.guest.firstName,

        reservationId:
          params.reservationId,

        checkIn:
          params.checkInDate,

        checkOut:
          params.checkOutDate,

        nights:
          params.nights,

        adults:
          params.adults,

        roomNames:
          params.roomNames,

        approvalDeadline:
          params.approvalExpiresAt ?? null,

        locale:
          this.mapLocale(params.locale),
      });
    } catch (error: unknown) {
      this.logNotificationFailure({
        notificationType:
          'reservation-created',

        reservationId:
          params.reservationId,

        recipient:
          params.guest.email,

        error,
      });
    }
  }

  async sendReservationApproved(
    params: ReservationApprovedNotificationParams,
  ): Promise<void> {
    try {
      await this.emailService.sendReservationApprovedEmail({
        to: params.guest.email,

        guestFirstName:
          params.guest.firstName,

        reservationId:
          params.reservationId,

        checkIn:
          params.checkInDate,

        checkOut:
          params.checkOutDate,

        nights:
          params.nights,

        adults:
          params.adults,

        roomNames:
          params.roomNames,

        totalPrice:
          params.totalPrice,

        depositAmount:
          params.depositAmount,

        paymentDeadline:
          params.paymentDeadline,

        paymentUrl:
          params.paymentUrl,

        locale:
          this.mapLocale(params.locale),
      });
    } catch (error: unknown) {
      this.logNotificationFailure({
        notificationType:
          'reservation-approved',

        reservationId:
          params.reservationId,

        recipient:
          params.guest.email,

        error,
      });
    }
  }

  async sendPaymentConfirmed(
    params: PaymentConfirmedNotificationParams,
  ): Promise<void> {
    try {
      await this.emailService.sendPaymentConfirmedEmail({
        to: params.guest.email,

        guestFirstName:
          params.guest.firstName,

        reservationId:
          params.reservationId,

        checkIn:
          params.checkInDate,

        checkOut:
          params.checkOutDate,

        nights:
          params.nights,

        adults:
          params.adults,

        roomNames:
          params.roomNames,

        amountPaid:
          params.amountPaid,

        totalPrice:
          params.totalPrice,

        locale:
          this.mapLocale(params.locale),
      });
    } catch (error: unknown) {
      this.logNotificationFailure({
        notificationType:
          'payment-confirmed',

        reservationId:
          params.reservationId,

        recipient:
          params.guest.email,

        error,
      });
    }
  }

  async sendReservationRejected(
    params: ReservationRejectedNotificationParams,
  ): Promise<void> {
    try {
      await this.emailService.sendReservationRejectedEmail({
        to: params.guest.email,

        guestFirstName:
          params.guest.firstName,

        reservationId:
          params.reservationId,

        checkIn:
          params.checkInDate,

        checkOut:
          params.checkOutDate,

        roomNames:
          params.roomNames,

        rejectionReason:
          params.rejectionReason,

        locale:
          this.mapLocale(params.locale),
      });
    } catch (error: unknown) {
      this.logNotificationFailure({
        notificationType:
          'reservation-rejected',

        reservationId:
          params.reservationId,

        recipient:
          params.guest.email,

        error,
      });
    }
  }

  async sendReservationCancelled(
    params: ReservationCancelledNotificationParams,
  ): Promise<void> {
    try {
      await this.emailService.sendReservationCancelledEmail({
        to: params.guest.email,

        guestFirstName:
          params.guest.firstName,

        reservationId:
          params.reservationId,

        checkIn:
          params.checkInDate,

        checkOut:
          params.checkOutDate,

        roomNames:
          params.roomNames,

        cancellationReason:
          params.cancellationReason,

        previouslyPaidAmount:
          params.previouslyPaidAmount,

        refundedAmount:
          params.refundedAmount,

        retainedAmount:
          params.retainedAmount,

        locale:
          this.mapLocale(params.locale),
      });
    } catch (error: unknown) {
      this.logNotificationFailure({
        notificationType:
          'reservation-cancelled',

        reservationId:
          params.reservationId,

        recipient:
          params.guest.email,

        error,
      });
    }
  }

  async sendSevenDayReminder(
    params: SevenDayReminderNotificationParams,
  ): Promise<boolean> {
    try {
      await this.emailService.sendSevenDayReminderEmail({
        to: params.guest.email,

        guestFirstName:
          params.guest.firstName,

        reservationId:
          params.reservationId,

        checkIn:
          params.checkInDate,

        checkOut:
          params.checkOutDate,

        checkInTime:
          params.checkInTime,

        checkOutTime:
          params.checkOutTime,

        nights:
          params.nights,

        adults:
          params.adults,

        roomNames:
          params.roomNames,

        resortAddress:
          params.resortAddress,

        resortPhone:
          params.resortPhone,

        mapsUrl:
          params.mapsUrl,

        locale:
          this.mapLocale(params.locale),
      });

      return true;
    } catch (error: unknown) {
      this.logNotificationFailure({
        notificationType:
          'seven-day-reminder',

        reservationId:
          params.reservationId,

        recipient:
          params.guest.email,

        error,
      });

      return false;
    }
  }

  async sendOneDayReminder(
    params: OneDayReminderNotificationParams,
  ): Promise<boolean> {
    try {
      await this.emailService.sendOneDayReminderEmail({
        to: params.guest.email,

        guestFirstName:
          params.guest.firstName,

        reservationId:
          params.reservationId,

        checkIn:
          params.checkInDate,

        checkOut:
          params.checkOutDate,

        checkInTime:
          params.checkInTime,

        checkOutTime:
          params.checkOutTime,

        roomNames:
          params.roomNames,

        resortAddress:
          params.resortAddress,

        resortPhone:
          params.resortPhone,

        parkingInstructions:
          params.parkingInstructions,

        accessInstructions:
          params.accessInstructions,

        mapsUrl:
          params.mapsUrl,

        locale:
          this.mapLocale(params.locale),
      });

      return true;
    } catch (error: unknown) {
      this.logNotificationFailure({
        notificationType:
          'one-day-reminder',

        reservationId:
          params.reservationId,

        recipient:
          params.guest.email,

        error,
      });

      return false;
    }
  }

  async sendPostStay(
    params: PostStayNotificationParams,
  ): Promise<boolean> {
    try {
      await this.emailService.sendPostStayEmail({
        to: params.guest.email,

        guestFirstName:
          params.guest.firstName,

        reservationId:
          params.reservationId,

        checkIn:
          params.checkInDate,

        checkOut:
          params.checkOutDate,

        roomNames:
          params.roomNames,

        googleReviewUrl:
          params.googleReviewUrl,

        bookingReviewUrl:
          params.bookingReviewUrl,

        directBookingUrl:
          params.directBookingUrl,

        locale:
          this.mapLocale(params.locale),
      });

      return true;
    } catch (error: unknown) {
      this.logNotificationFailure({
        notificationType:
          'post-stay',

        reservationId:
          params.reservationId,

        recipient:
          params.guest.email,

        error,
      });

      return false;
    }
  }

  private mapLocale(
    locale: Locale,
  ): 'RO' | 'EN' {
    return locale === Locale.EN
      ? 'EN'
      : 'RO';
  }

  private logNotificationFailure(params: {
    notificationType: string;
    reservationId: string;
    recipient: string;
    error: unknown;
  }): void {
    this.logger.error(
      [
        'Emailul nu a putut fi trimis.',
        `type=${params.notificationType}`,
        `reservationId=${params.reservationId}`,
        `recipient=${params.recipient}`,
      ].join(' '),

      params.error instanceof Error
        ? params.error.stack
        : String(params.error),
    );
  }
}
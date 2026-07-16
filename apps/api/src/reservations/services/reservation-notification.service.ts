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
        guestFirstName: params.guest.firstName,

        reservationId: params.reservationId,

        checkIn: params.checkInDate,
        checkOut: params.checkOutDate,

        nights: params.nights,
        adults: params.adults,

        roomNames: params.roomNames,

        approvalDeadline:
          params.approvalExpiresAt ?? null,

        locale: this.mapLocale(params.locale),
      });
    } catch (error: unknown) {
      this.logNotificationFailure({
        notificationType: 'reservation-created',
        reservationId: params.reservationId,
        recipient: params.guest.email,
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
        guestFirstName: params.guest.firstName,

        reservationId: params.reservationId,

        checkIn: params.checkInDate,
        checkOut: params.checkOutDate,

        nights: params.nights,
        adults: params.adults,

        roomNames: params.roomNames,

        totalPrice: params.totalPrice,
        depositAmount: params.depositAmount,

        paymentDeadline: params.paymentDeadline,
        paymentUrl: params.paymentUrl,

        locale: this.mapLocale(params.locale),
      });
    } catch (error: unknown) {
      this.logNotificationFailure({
        notificationType: 'reservation-approved',
        reservationId: params.reservationId,
        recipient: params.guest.email,
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
        guestFirstName: params.guest.firstName,

        reservationId: params.reservationId,

        checkIn: params.checkInDate,
        checkOut: params.checkOutDate,

        nights: params.nights,
        adults: params.adults,

        roomNames: params.roomNames,

        amountPaid: params.amountPaid,
        totalPrice: params.totalPrice,

        locale: this.mapLocale(params.locale),
      });
    } catch (error: unknown) {
      this.logNotificationFailure({
        notificationType: 'payment-confirmed',
        reservationId: params.reservationId,
        recipient: params.guest.email,
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
        guestFirstName: params.guest.firstName,

        reservationId: params.reservationId,

        checkIn: params.checkInDate,
        checkOut: params.checkOutDate,

        roomNames: params.roomNames,

        rejectionReason:
          params.rejectionReason,

        locale: this.mapLocale(params.locale),
      });
    } catch (error: unknown) {
      this.logNotificationFailure({
        notificationType: 'reservation-rejected',
        reservationId: params.reservationId,
        recipient: params.guest.email,
        error,
      });
    }
  }

  private mapLocale(locale: Locale): 'RO' | 'EN' {
    return locale === Locale.EN ? 'EN' : 'RO';
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
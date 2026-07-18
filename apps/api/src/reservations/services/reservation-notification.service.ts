import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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

export type ReservationChangeRequestedAdminNotificationParams = {
  reservationId: string;
  reservationChangeId: string;

  guest: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };

  currentCheckInDate: Date;
  currentCheckOutDate: Date;

  requestedCheckInDate: Date;
  requestedCheckOutDate: Date;

  roomNames: string[];

  guestReason?: string | null;
  approvalExpiresAt?: Date | null;
};

export type ReservationCancelledAdminNotificationParams = {
  reservationId: string;

  guest: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };

  checkInDate: Date;
  checkOutDate: Date;

  nights: number;
  adults: number;

  roomNames: string[];

  cancellationReason: string;

  previouslyPaidAmount: number;
  refundedAmount: number;
  retainedAmount: number;

  cancelledAt: Date;
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

export type ReservationCreatedAdminNotificationParams = {
  reservationId: string;

  guest: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country?: string | null;
  };

  checkInDate: Date;
  checkOutDate: Date;

  nights: number;
  adults: number;

  roomNames: string[];

  totalPrice: number;
  depositAmount: number;

  guestNotes?: string | null;
  approvalExpiresAt?: Date | null;
};

export type PaymentConfirmedAdminNotificationParams = {
  reservationId: string;

  guest: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };

  checkInDate: Date;
  checkOutDate: Date;

  nights: number;
  adults: number;

  roomNames: string[];

  paymentType: string;
  amountPaid: number;
  totalPrice: number;
  remainingAmount: number;

  paymentId: string;
  stripePaymentIntentId?: string | null;
  paidAt: Date;
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

  private readonly adminNotificationEmail: string;

  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {
    const adminNotificationEmail =
      this.configService.get<string>(
        'ADMIN_NOTIFICATION_EMAIL',
      );

    if (!adminNotificationEmail?.trim()) {
      throw new Error(
        'ADMIN_NOTIFICATION_EMAIL is not configured.',
      );
    }

    this.adminNotificationEmail =
      adminNotificationEmail
        .trim()
        .toLowerCase();
  }

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
  async sendReservationCreatedToAdmin(
    params: ReservationCreatedAdminNotificationParams,
  ): Promise<void> {
    try {
      await this.emailService.sendAdminReservationCreatedEmail({
        to: this.adminNotificationEmail,

        reservationId:
          params.reservationId,

        guestFirstName:
          params.guest.firstName,

        guestLastName:
          params.guest.lastName,

        guestEmail:
          params.guest.email,

        guestPhone:
          params.guest.phone,

        guestCountry:
          params.guest.country ?? null,

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

        guestNotes:
          params.guestNotes ?? null,

        approvalDeadline:
          params.approvalExpiresAt ?? null,
      });
    } catch (error: unknown) {
      this.logNotificationFailure({
        notificationType:
          'admin-reservation-created',

        reservationId:
          params.reservationId,

        recipient:
          this.adminNotificationEmail,

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

  async sendPaymentConfirmedToAdmin(
    params: PaymentConfirmedAdminNotificationParams,
  ): Promise<void> {
    try {
      await this.emailService.sendAdminPaymentConfirmedEmail({
        to: this.adminNotificationEmail,

        reservationId:
          params.reservationId,

        guestFirstName:
          params.guest.firstName,

        guestLastName:
          params.guest.lastName,

        guestEmail:
          params.guest.email,

        guestPhone:
          params.guest.phone,

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

        paymentType:
          params.paymentType,

        amountPaid:
          params.amountPaid,

        totalPrice:
          params.totalPrice,

        remainingAmount:
          params.remainingAmount,

        paymentId:
          params.paymentId,

        stripePaymentIntentId:
          params.stripePaymentIntentId ?? null,

        paidAt:
          params.paidAt,
      });
    } catch (error: unknown) {
      this.logNotificationFailure({
        notificationType:
          'admin-payment-confirmed',

        reservationId:
          params.reservationId,

        recipient:
          this.adminNotificationEmail,

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

  /**
   * Notifică administratorul numai când clientul creează
   * o cerere nouă de modificare.
   *
   * Administratorul nu primește notificări după propria
   * decizie de aprobare sau respingere.
   */

  async sendReservationCancelledToAdmin(
    params: ReservationCancelledAdminNotificationParams,
  ): Promise<void> {
    try {
      await this.emailService.sendAdminReservationCancelledEmail({
        to: this.adminNotificationEmail,

        reservationId:
          params.reservationId,

        guestFirstName:
          params.guest.firstName,

        guestLastName:
          params.guest.lastName,

        guestEmail:
          params.guest.email,

        guestPhone:
          params.guest.phone,

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

        cancellationReason:
          params.cancellationReason,

        previouslyPaidAmount:
          params.previouslyPaidAmount,

        refundedAmount:
          params.refundedAmount,

        retainedAmount:
          params.retainedAmount,

        cancelledAt:
          params.cancelledAt,
      });
    } catch (error: unknown) {
      this.logNotificationFailure({
        notificationType:
          'admin-reservation-cancelled',

        reservationId:
          params.reservationId,

        recipient:
          this.adminNotificationEmail,

        error,
      });
    }
  }
  async sendReservationChangeRequestedToAdmin(
    params: ReservationChangeRequestedAdminNotificationParams,
  ): Promise<void> {
    try {
      await this.emailService.sendAdminReservationChangeRequestedEmail({
        to: this.adminNotificationEmail,

        reservationId:
          params.reservationId,

        reservationChangeId:
          params.reservationChangeId,

        guestFirstName:
          params.guest.firstName,

        guestLastName:
          params.guest.lastName,

        guestEmail:
          params.guest.email,

        guestPhone:
          params.guest.phone,

        currentCheckIn:
          params.currentCheckInDate,

        currentCheckOut:
          params.currentCheckOutDate,

        requestedCheckIn:
          params.requestedCheckInDate,

        requestedCheckOut:
          params.requestedCheckOutDate,

        roomNames:
          params.roomNames,

        guestReason:
          params.guestReason ?? null,

        approvalDeadline:
          params.approvalExpiresAt ?? null,
      });
    } catch (error: unknown) {
      this.logNotificationFailure({
        notificationType:
          'admin-reservation-change-requested',

        reservationId:
          params.reservationId,

        recipient:
          this.adminNotificationEmail,

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
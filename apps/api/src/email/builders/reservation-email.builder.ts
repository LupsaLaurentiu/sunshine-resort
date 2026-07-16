import { Injectable } from '@nestjs/common';
import { render } from '@react-email/render';
import {
  createElement,
  type ReactElement,
} from 'react';
import { ReservationApprovedEmail } from '../templates/ReservationApprovedEmail';
import { ReservationCancelledEmail } from '../templates/ReservationCancelledEmail';
import { ReservationCreatedEmail } from '../templates/ReservationCreatedEmail';
import { ReservationPaymentConfirmedEmail } from '../templates/ReservationPaymentConfirmedEmail';
import { ReservationRejectedEmail } from '../templates/ReservationRejectedEmail';

export type ReservationEmailLocale = 'RO' | 'EN';

export type EmailContent = {
  subject: string;
  html: string;
  text: string;
};

export type BuildReservationCreatedEmailParams = {
  guestFirstName: string;
  reservationId: string;
  checkIn: Date | string;
  checkOut: Date | string;
  nights: number;
  adults: number;
  roomNames: string[];
  approvalDeadline?: Date | string | null;
  locale?: ReservationEmailLocale;
};

export type BuildReservationApprovedEmailParams = {
  guestFirstName: string;
  reservationId: string;
  checkIn: Date | string;
  checkOut: Date | string;
  nights: number;
  adults: number;
  roomNames: string[];
  totalPrice: number;
  depositAmount: number;
  paymentDeadline: Date | string;
  paymentUrl: string;
  locale?: ReservationEmailLocale;
};

export type BuildPaymentConfirmedEmailParams = {
  guestFirstName: string;
  reservationId: string;
  checkIn: Date | string;
  checkOut: Date | string;
  nights: number;
  adults: number;
  roomNames: string[];
  amountPaid: number;
  totalPrice: number;
  locale?: ReservationEmailLocale;
};

export type BuildReservationRejectedEmailParams = {
  guestFirstName: string;
  reservationId: string;
  checkIn: Date | string;
  checkOut: Date | string;
  roomNames: string[];
  rejectionReason: string;
  locale?: ReservationEmailLocale;
};

export type BuildReservationCancelledEmailParams = {
  guestFirstName: string;
  reservationId: string;
  checkIn: Date | string;
  checkOut: Date | string;
  roomNames: string[];
  cancellationReason: string;
  previouslyPaidAmount: number;
  refundedAmount: number;
  retainedAmount: number;
  locale?: ReservationEmailLocale;
};

@Injectable()
export class ReservationEmailBuilder {
  async buildReservationCreated(
    params: BuildReservationCreatedEmailParams,
  ): Promise<EmailContent> {
    const locale = params.locale ?? 'RO';

    const subject =
      locale === 'RO'
        ? 'Cererea dumneavoastră de rezervare a fost înregistrată'
        : 'Your reservation request has been received';

    const component = createElement(
      ReservationCreatedEmail,
      {
        guestFirstName: params.guestFirstName,
        reservationId: params.reservationId,
        checkIn: this.formatDateValue(
          params.checkIn,
        ),
        checkOut: this.formatDateValue(
          params.checkOut,
        ),
        nights: params.nights,
        adults: params.adults,
        roomNames: params.roomNames,
        approvalDeadline:
          this.formatOptionalDateTime(
            params.approvalDeadline,
          ),
        locale,
      },
    );

    return this.renderEmail(subject, component);
  }

  async buildReservationApproved(
    params: BuildReservationApprovedEmailParams,
  ): Promise<EmailContent> {
    const locale = params.locale ?? 'RO';

    const subject =
      locale === 'RO'
        ? 'Rezervarea dumneavoastră a fost aprobată'
        : 'Your reservation has been approved';

    const component = createElement(
      ReservationApprovedEmail,
      {
        guestFirstName: params.guestFirstName,
        reservationId: params.reservationId,
        checkIn: this.formatDateValue(
          params.checkIn,
        ),
        checkOut: this.formatDateValue(
          params.checkOut,
        ),
        nights: params.nights,
        adults: params.adults,
        roomNames: params.roomNames,
        totalPrice: params.totalPrice,
        depositAmount: params.depositAmount,
        paymentDeadline: this.formatDateTime(
          params.paymentDeadline,
        ),
        paymentUrl: params.paymentUrl,
        locale,
      },
    );

    return this.renderEmail(subject, component);
  }

  async buildPaymentConfirmed(
    params: BuildPaymentConfirmedEmailParams,
  ): Promise<EmailContent> {
    const locale = params.locale ?? 'RO';

    const subject =
      locale === 'RO'
        ? 'Plata a fost confirmată'
        : 'Your payment has been confirmed';

    const component = createElement(
      ReservationPaymentConfirmedEmail,
      {
        guestFirstName: params.guestFirstName,
        reservationId: params.reservationId,
        checkIn: this.formatDateValue(
          params.checkIn,
        ),
        checkOut: this.formatDateValue(
          params.checkOut,
        ),
        nights: params.nights,
        adults: params.adults,
        roomNames: params.roomNames,
        amountPaid: params.amountPaid,
        totalPrice: params.totalPrice,
        locale,
      },
    );

    return this.renderEmail(subject, component);
  }

  async buildReservationRejected(
    params: BuildReservationRejectedEmailParams,
  ): Promise<EmailContent> {
    const locale = params.locale ?? 'RO';

    const subject =
      locale === 'RO'
        ? 'Actualizare privind cererea dumneavoastră de rezervare'
        : 'An update regarding your reservation request';

    const component = createElement(
      ReservationRejectedEmail,
      {
        guestFirstName: params.guestFirstName,
        reservationId: params.reservationId,
        checkIn: this.formatDateValue(
          params.checkIn,
        ),
        checkOut: this.formatDateValue(
          params.checkOut,
        ),
        roomNames: params.roomNames,
        rejectionReason:
          params.rejectionReason,
        locale,
      },
    );

    return this.renderEmail(subject, component);
  }

  async buildReservationCancelled(
    params: BuildReservationCancelledEmailParams,
  ): Promise<EmailContent> {
    const locale = params.locale ?? 'RO';

    const subject =
      locale === 'RO'
        ? 'Rezervarea dumneavoastră a fost anulată'
        : 'Your reservation has been cancelled';

    const component = createElement(
      ReservationCancelledEmail,
      {
        guestFirstName: params.guestFirstName,
        reservationId: params.reservationId,
        checkIn: this.formatDateValue(
          params.checkIn,
        ),
        checkOut: this.formatDateValue(
          params.checkOut,
        ),
        roomNames: params.roomNames,
        cancellationReason:
          params.cancellationReason,
        previouslyPaidAmount:
          params.previouslyPaidAmount,
        refundedAmount:
          params.refundedAmount,
        retainedAmount:
          params.retainedAmount,
        locale,
      },
    );

    return this.renderEmail(subject, component);
  }

  private async renderEmail(
    subject: string,
    component: ReactElement,
  ): Promise<EmailContent> {
    const html = await render(component);

    const text = await render(component, {
      plainText: true,
    });

    return {
      subject,
      html,
      text,
    };
  }

  private formatDateValue(
    value: Date | string,
  ): string {
    if (value instanceof Date) {
      return value.toISOString().slice(0, 10);
    }

    return value.slice(0, 10);
  }

  private formatDateTime(
    value: Date | string,
  ): string {
    if (value instanceof Date) {
      return value.toISOString();
    }

    return value;
  }

  private formatOptionalDateTime(
    value: Date | string | null | undefined,
  ): string | null {
    if (!value) {
      return null;
    }

    return this.formatDateTime(value);
  }
}
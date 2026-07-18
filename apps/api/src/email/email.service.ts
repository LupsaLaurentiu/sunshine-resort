import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { render } from '@react-email/render';
import { createElement } from 'react';
import { Resend } from 'resend';
import {
  ReservationEmailBuilder,
  type ReservationEmailLocale,
} from './builders/reservation-email.builder';
import { AdminReservationChangeRequestedEmail } from './templates/AdminReservationChangeRequestedEmail';
import { AdminReservationCreatedEmail } from './templates/AdminReservationCreatedEmail';
import { AdminPaymentConfirmedEmail } from './templates/AdminPaymentConfirmedEmail';
import { AdminReservationCancelledEmail } from './templates/AdminReservationCancelledEmail';
import { TestEmail } from './templates/TestEmail';

export type EmailTag = {
  name: string;
  value: string;
};

export type SendEmailParams = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  tags?: EmailTag[];
};

export type SendEmailResult = {
  id: string;
  recipients: string[];
  subject: string;
};

type SendTestEmailParams = {
  to: string;
  subject: string;
  message: string;
};

export type SendReservationCreatedEmailParams = {
  to: string;
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

export type SendReservationApprovedEmailParams = {
  to: string;
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

export type SendPaymentConfirmedEmailParams = {
  to: string;
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

export type SendReservationRejectedEmailParams = {
  to: string;
  guestFirstName: string;
  reservationId: string;
  checkIn: Date | string;
  checkOut: Date | string;
  roomNames: string[];
  rejectionReason: string;
  locale?: ReservationEmailLocale;
};

export type SendReservationCancelledEmailParams = {
  to: string;
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

export type SendAdminReservationChangeRequestedEmailParams = {
  to: string;

  reservationId: string;
  reservationChangeId: string;

  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  guestPhone: string;

  currentCheckIn: Date | string;
  currentCheckOut: Date | string;

  requestedCheckIn: Date | string;
  requestedCheckOut: Date | string;

  roomNames: string[];

  guestReason?: string | null;
  approvalDeadline?: Date | string | null;
};

export type SendSevenDayReminderEmailParams = {
  to: string;
  guestFirstName: string;
  reservationId: string;

  checkIn: Date | string;
  checkOut: Date | string;

  checkInTime: string;
  checkOutTime: string;

  nights: number;
  adults: number;

  roomNames: string[];

  resortAddress: string;
  resortPhone: string;

  mapsUrl?: string;

  locale?: ReservationEmailLocale;
};

export type SendOneDayReminderEmailParams = {
  to: string;
  guestFirstName: string;
  reservationId: string;

  checkIn: Date | string;
  checkOut: Date | string;

  checkInTime: string;
  checkOutTime: string;

  roomNames: string[];

  resortAddress: string;
  resortPhone: string;

  parkingInstructions?: string;
  accessInstructions?: string;

  mapsUrl?: string;

  locale?: ReservationEmailLocale;
};

export type SendPostStayEmailParams = {
  to: string;
  guestFirstName: string;
  reservationId: string;

  checkIn: Date | string;
  checkOut: Date | string;

  roomNames: string[];

  googleReviewUrl?: string;
  bookingReviewUrl?: string;
  directBookingUrl?: string;

  locale?: ReservationEmailLocale;
};

export type SendAdminReservationCreatedEmailParams = {
  to: string;

  reservationId: string;

  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  guestPhone: string;
  guestCountry?: string | null;

  checkIn: Date | string;
  checkOut: Date | string;

  nights: number;
  adults: number;

  roomNames: string[];

  totalPrice: number;
  depositAmount: number;

  guestNotes?: string | null;
  approvalDeadline?: Date | string | null;
};

export type SendAdminPaymentConfirmedEmailParams = {
  to: string;

  reservationId: string;

  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  guestPhone: string;

  checkIn: Date | string;
  checkOut: Date | string;

  nights: number;
  adults: number;

  roomNames: string[];

  paymentType: string;
  amountPaid: number;
  totalPrice: number;
  remainingAmount: number;

  paymentId: string;
  stripePaymentIntentId?: string | null;
  paidAt: Date | string;
};

export type SendAdminReservationCancelledEmailParams = {
  to: string;

  reservationId: string;

  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  guestPhone: string;

  checkIn: Date | string;
  checkOut: Date | string;

  nights: number;
  adults: number;

  roomNames: string[];

  cancellationReason: string;

  previouslyPaidAmount: number;
  refundedAmount: number;
  retainedAmount: number;

  cancelledAt: Date | string;
};

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(
    EmailService.name,
  );

  private readonly resend: Resend;
  private readonly fromName: string;
  private readonly fromAddress: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly reservationEmailBuilder: ReservationEmailBuilder,
  ) {
    const apiKey =
      this.configService.get<string>(
        'RESEND_API_KEY',
      );

    const fromName =
      this.configService.get<string>(
        'EMAIL_FROM_NAME',
      ) ?? 'Sunshine Resort';

    const fromAddress =
      this.configService.get<string>(
        'EMAIL_FROM_ADDRESS',
      );

    if (!apiKey?.trim()) {
      throw new Error(
        'RESEND_API_KEY is not configured.',
      );
    }

    if (!fromAddress?.trim()) {
      throw new Error(
        'EMAIL_FROM_ADDRESS is not configured.',
      );
    }

    this.resend = new Resend(
      apiKey.trim(),
    );

    this.fromName =
      fromName.trim();

    this.fromAddress =
      fromAddress
        .trim()
        .toLowerCase();
  }

  onModuleInit(): void {
    this.logger.log(
      `EmailService activ. Expeditor: ${this.fromName} <${this.fromAddress}>`,
    );
  }

  async sendEmail(
    params: SendEmailParams,
  ): Promise<SendEmailResult> {
    const recipients =
      this.normalizeRecipients(
        params.to,
      );

    if (recipients.length === 0) {
      throw new InternalServerErrorException({
        code: 'EMAIL_RECIPIENTS_MISSING',
        message:
          'Emailul nu conține destinatari valizi.',
      });
    }

    const subject =
      params.subject.trim();

    if (!subject) {
      throw new InternalServerErrorException({
        code: 'EMAIL_SUBJECT_MISSING',
        message:
          'Emailul nu conține un subiect valid.',
      });
    }

    try {
      const { data, error } =
        await this.resend.emails.send({
          from:
            `${this.fromName} <${this.fromAddress}>`,

          to: recipients,
          subject,
          html: params.html,
          text: params.text,
          replyTo: params.replyTo,
          tags: params.tags,
        });

      if (error) {
        this.logger.error(
          `Resend a respins emailul "${subject}": ${error.message}`,
        );

        throw new InternalServerErrorException({
          code: 'EMAIL_PROVIDER_ERROR',
          message:
            'Furnizorul de email nu a acceptat mesajul.',
          providerMessage:
            error.message,
        });
      }

      if (!data?.id) {
        throw new InternalServerErrorException({
          code: 'EMAIL_PROVIDER_MISSING_ID',
          message:
            'Furnizorul de email nu a returnat identificatorul mesajului.',
        });
      }

      this.logger.log(
        [
          'Email trimis.',
          `id=${data.id}`,
          `to=${recipients.join(',')}`,
          `subject="${subject}"`,
        ].join(' '),
      );

      return {
        id: data.id,
        recipients,
        subject,
      };
    } catch (error: unknown) {
      if (
        error instanceof
        InternalServerErrorException
      ) {
        throw error;
      }

      this.logger.error(
        `Trimiterea emailului "${subject}" a eșuat.`,
        error instanceof Error
          ? error.stack
          : String(error),
      );

      throw new InternalServerErrorException({
        code: 'EMAIL_SEND_FAILED',
        message:
          'Emailul nu a putut fi trimis.',
      });
    }
  }

  async sendTestEmail(
    params: SendTestEmailParams,
  ): Promise<SendEmailResult> {
    const emailComponent =
      createElement(TestEmail, {
        subject: params.subject,
        message: params.message,
      });

    const html =
      await render(emailComponent);

    const text =
      await render(emailComponent, {
        plainText: true,
      });

    return this.sendEmail({
      to: params.to,
      subject: params.subject,
      html,
      text,
      tags: [
        {
          name: 'type',
          value: 'test-email',
        },
      ],
    });
  }

  async sendReservationCreatedEmail(
    params: SendReservationCreatedEmailParams,
  ): Promise<SendEmailResult> {
    const emailContent =
      await this.reservationEmailBuilder.buildReservationCreated(
        {
          guestFirstName:
            params.guestFirstName,

          reservationId:
            params.reservationId,

          checkIn:
            params.checkIn,

          checkOut:
            params.checkOut,

          nights:
            params.nights,

          adults:
            params.adults,

          roomNames:
            params.roomNames,

          approvalDeadline:
            params.approvalDeadline,

          locale:
            params.locale ?? 'RO',
        },
      );

    return this.sendEmail({
      to: params.to,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,

      tags:
        this.buildReservationTags(
          'reservation-created',
          params.reservationId,
          params.locale,
        ),
    });
  }

  async sendReservationApprovedEmail(
    params: SendReservationApprovedEmailParams,
  ): Promise<SendEmailResult> {
    const emailContent =
      await this.reservationEmailBuilder.buildReservationApproved(
        {
          guestFirstName:
            params.guestFirstName,

          reservationId:
            params.reservationId,

          checkIn:
            params.checkIn,

          checkOut:
            params.checkOut,

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
            params.locale ?? 'RO',
        },
      );

    return this.sendEmail({
      to: params.to,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,

      tags:
        this.buildReservationTags(
          'reservation-approved',
          params.reservationId,
          params.locale,
        ),
    });
  }

  async sendPaymentConfirmedEmail(
    params: SendPaymentConfirmedEmailParams,
  ): Promise<SendEmailResult> {
    const emailContent =
      await this.reservationEmailBuilder.buildPaymentConfirmed(
        {
          guestFirstName:
            params.guestFirstName,

          reservationId:
            params.reservationId,

          checkIn:
            params.checkIn,

          checkOut:
            params.checkOut,

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
            params.locale ?? 'RO',
        },
      );

    return this.sendEmail({
      to: params.to,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,

      tags:
        this.buildReservationTags(
          'payment-confirmed',
          params.reservationId,
          params.locale,
        ),
    });
  }

  async sendReservationRejectedEmail(
    params: SendReservationRejectedEmailParams,
  ): Promise<SendEmailResult> {
    const emailContent =
      await this.reservationEmailBuilder.buildReservationRejected(
        {
          guestFirstName:
            params.guestFirstName,

          reservationId:
            params.reservationId,

          checkIn:
            params.checkIn,

          checkOut:
            params.checkOut,

          roomNames:
            params.roomNames,

          rejectionReason:
            params.rejectionReason,

          locale:
            params.locale ?? 'RO',
        },
      );

    return this.sendEmail({
      to: params.to,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,

      tags:
        this.buildReservationTags(
          'reservation-rejected',
          params.reservationId,
          params.locale,
        ),
    });
  }

  async sendReservationCancelledEmail(
    params: SendReservationCancelledEmailParams,
  ): Promise<SendEmailResult> {
    const emailContent =
      await this.reservationEmailBuilder.buildReservationCancelled(
        {
          guestFirstName:
            params.guestFirstName,

          reservationId:
            params.reservationId,

          checkIn:
            params.checkIn,

          checkOut:
            params.checkOut,

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
            params.locale ?? 'RO',
        },
      );

    return this.sendEmail({
      to: params.to,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,

      tags:
        this.buildReservationTags(
          'reservation-cancelled',
          params.reservationId,
          params.locale,
        ),
    });
  }

  async sendAdminReservationChangeRequestedEmail(
    params: SendAdminReservationChangeRequestedEmailParams,
  ): Promise<SendEmailResult> {
    const guestFullName =
      `${params.guestFirstName} ${params.guestLastName}`.trim();

    const subject =
      `Cerere nouă de modificare – ${guestFullName}`;

    const emailComponent =
      createElement(
        AdminReservationChangeRequestedEmail,
        {
          reservationId:
            params.reservationId,

          reservationChangeId:
            params.reservationChangeId,

          guestFirstName:
            params.guestFirstName,

          guestLastName:
            params.guestLastName,

          guestEmail:
            params.guestEmail,

          guestPhone:
            params.guestPhone,

          currentCheckIn:
            this.formatDateValue(
              params.currentCheckIn,
            ),

          currentCheckOut:
            this.formatDateValue(
              params.currentCheckOut,
            ),

          requestedCheckIn:
            this.formatDateValue(
              params.requestedCheckIn,
            ),

          requestedCheckOut:
            this.formatDateValue(
              params.requestedCheckOut,
            ),

          roomNames:
            params.roomNames,

          guestReason:
            params.guestReason ?? null,

          approvalDeadline:
            params.approvalDeadline
              ? this.formatDateTimeValue(
                  params.approvalDeadline,
                )
              : null,
        },
      );

    const html =
      await render(emailComponent);

    const text =
      await render(emailComponent, {
        plainText: true,
      });

    return this.sendEmail({
      to: params.to,
      subject,
      html,
      text,

      tags: [
        {
          name: 'type',
          value:
            'admin-reservation-change-requested',
        },
        {
          name: 'reservation_id',
          value:
            this.normalizeTagValue(
              params.reservationId,
            ),
        },
        {
          name: 'reservation_change_id',
          value:
            this.normalizeTagValue(
              params.reservationChangeId,
            ),
        },
      ],
    });
  }

  async sendSevenDayReminderEmail(
    params: SendSevenDayReminderEmailParams,
  ): Promise<SendEmailResult> {
    const emailContent =
      await this.reservationEmailBuilder.buildSevenDayReminder(
        {
          guestFirstName:
            params.guestFirstName,

          reservationId:
            params.reservationId,

          checkIn:
            params.checkIn,

          checkOut:
            params.checkOut,

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
            params.locale ?? 'RO',
        },
      );

    return this.sendEmail({
      to: params.to,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,

      tags:
        this.buildReservationTags(
          'seven-day-reminder',
          params.reservationId,
          params.locale,
        ),
    });
  }

  async sendOneDayReminderEmail(
    params: SendOneDayReminderEmailParams,
  ): Promise<SendEmailResult> {
    const emailContent =
      await this.reservationEmailBuilder.buildOneDayReminder(
        {
          guestFirstName:
            params.guestFirstName,

          reservationId:
            params.reservationId,

          checkIn:
            params.checkIn,

          checkOut:
            params.checkOut,

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
            params.locale ?? 'RO',
        },
      );

    return this.sendEmail({
      to: params.to,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,

      tags:
        this.buildReservationTags(
          'one-day-reminder',
          params.reservationId,
          params.locale,
        ),
    });
  }

  async sendPostStayEmail(
    params: SendPostStayEmailParams,
  ): Promise<SendEmailResult> {
    const emailContent =
      await this.reservationEmailBuilder.buildPostStay(
        {
          guestFirstName:
            params.guestFirstName,

          reservationId:
            params.reservationId,

          checkIn:
            params.checkIn,

          checkOut:
            params.checkOut,

          roomNames:
            params.roomNames,

          googleReviewUrl:
            params.googleReviewUrl,

          bookingReviewUrl:
            params.bookingReviewUrl,

          directBookingUrl:
            params.directBookingUrl,

          locale:
            params.locale ?? 'RO',
        },
      );

    return this.sendEmail({
      to: params.to,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,

      tags:
        this.buildReservationTags(
          'post-stay',
          params.reservationId,
          params.locale,
        ),
    });
  }
  async sendAdminReservationCreatedEmail(
      params: SendAdminReservationCreatedEmailParams,
    ): Promise<SendEmailResult> {
      const guestFullName =
        `${params.guestFirstName} ${params.guestLastName}`.trim();

      const subject =
        `Cerere nouă de rezervare – ${guestFullName}`;

      const emailComponent = createElement(
        AdminReservationCreatedEmail,
        {
          reservationId:
            params.reservationId,

          guestFirstName:
            params.guestFirstName,

          guestLastName:
            params.guestLastName,

          guestEmail:
            params.guestEmail,

          guestPhone:
            params.guestPhone,

          guestCountry:
            params.guestCountry ?? null,

          checkIn:
            this.formatDateValue(
              params.checkIn,
            ),

          checkOut:
            this.formatDateValue(
              params.checkOut,
            ),

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
            params.approvalDeadline
              ? this.formatDateTimeValue(
                  params.approvalDeadline,
                )
              : null,
        },
      );

      const html = await render(
        emailComponent,
      );

      const text = await render(
        emailComponent,
        {
          plainText: true,
        },
      );

      return this.sendEmail({
        to: params.to,
        subject,
        html,
        text,

        tags: [
          {
            name: 'type',
            value:
              'admin-reservation-created',
          },
          {
            name: 'reservation_id',
            value:
              this.normalizeTagValue(
                params.reservationId,
              ),
          },
        ],
      });
    }

    async sendAdminPaymentConfirmedEmail(
      params: SendAdminPaymentConfirmedEmailParams,
    ): Promise<SendEmailResult> {
      const guestFullName =
        `${params.guestFirstName} ${params.guestLastName}`.trim();

      const subject =
        `Plată confirmată – ${guestFullName}`;

      const emailComponent =
        createElement(
          AdminPaymentConfirmedEmail,
          {
            reservationId:
              params.reservationId,

            guestFirstName:
              params.guestFirstName,

            guestLastName:
              params.guestLastName,

            guestEmail:
              params.guestEmail,

            guestPhone:
              params.guestPhone,

            checkIn:
              this.formatDateValue(
                params.checkIn,
              ),

            checkOut:
              this.formatDateValue(
                params.checkOut,
              ),

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
              params.stripePaymentIntentId ??
              null,

            paidAt:
              this.formatDateTimeValue(
                params.paidAt,
              ),
          },
        );

      const html =
        await render(emailComponent);

      const text =
        await render(emailComponent, {
          plainText: true,
        });

      return this.sendEmail({
        to: params.to,
        subject,
        html,
        text,

        tags: [
          {
            name: 'type',
            value:
              'admin-payment-confirmed',
          },
          {
            name: 'reservation_id',
            value:
              this.normalizeTagValue(
                params.reservationId,
              ),
          },
          {
            name: 'payment_id',
            value:
              this.normalizeTagValue(
                params.paymentId,
              ),
          },
        ],
      });
    }

    async sendAdminReservationCancelledEmail(
    params: SendAdminReservationCancelledEmailParams,
  ): Promise<SendEmailResult> {
    const guestFullName =
      `${params.guestFirstName} ${params.guestLastName}`.trim();

    const subject =
      `Rezervare anulată – ${guestFullName}`;

    const emailComponent = createElement(
      AdminReservationCancelledEmail,
      {
        reservationId:
          params.reservationId,

        guestFirstName:
          params.guestFirstName,

        guestLastName:
          params.guestLastName,

        guestEmail:
          params.guestEmail,

        guestPhone:
          params.guestPhone,

        checkIn:
          this.formatDateValue(
            params.checkIn,
          ),

        checkOut:
          this.formatDateValue(
            params.checkOut,
          ),

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
          this.formatDateTimeValue(
            params.cancelledAt,
          ),
      },
    );

    const html =
      await render(emailComponent);

    const text =
      await render(emailComponent, {
        plainText: true,
      });

    return this.sendEmail({
      to: params.to,
      subject,
      html,
      text,

      tags: [
        {
          name: 'type',
          value:
            'admin-reservation-cancelled',
        },
        {
          name: 'reservation_id',
          value:
            this.normalizeTagValue(
              params.reservationId,
            ),
        },
      ],
    });
  }

  private buildReservationTags(
    type: string,
    reservationId: string,
    locale?: ReservationEmailLocale,
  ): EmailTag[] {
    return [
      {
        name: 'type',
        value:
          this.normalizeTagValue(
            type,
          ),
      },
      {
        name: 'reservation_id',
        value:
          this.normalizeTagValue(
            reservationId,
          ),
      },
      {
        name: 'locale',
        value:
          (
            locale ?? 'RO'
          ).toLowerCase(),
      },
    ];
  }

  private normalizeRecipients(
    recipients:
      | string
      | string[],
  ): string[] {
    const values =
      Array.isArray(recipients)
        ? recipients
        : [recipients];

    return values
      .map((recipient) =>
        recipient
          .trim()
          .toLowerCase(),
      )
      .filter(
        (
          recipient,
          index,
          allRecipients,
        ) =>
          recipient.length > 0 &&
          allRecipients.indexOf(
            recipient,
          ) === index,
      );
  }

  private normalizeTagValue(
    value: string,
  ): string {
    return value
      .trim()
      .toLowerCase()
      .replace(
        /[^a-z0-9_-]/g,
        '-',
      )
      .slice(0, 256);
  }

  private formatDateValue(
    value: Date | string,
  ): string {
    if (value instanceof Date) {
      return value
        .toISOString()
        .slice(0, 10);
    }

    return value.slice(0, 10);
  }

  private formatDateTimeValue(
    value: Date | string,
  ): string {
    if (value instanceof Date) {
      return value.toISOString();
    }

    return value;
  }
}
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Locale,
  PaymentProvider,
  PaymentStatus,
  PaymentType,
  Prisma,
  ReservationChangeStatus,
  ReservationStatus,
} from '@prisma/client';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { ReservationAllocationService } from '../reservations/services/reservation-allocation.service';
import { ReservationChangeReviewService } from '../reservations/services/reservation-change-review.service';
import { ReservationNotificationService } from '../reservations/services/reservation-notification.service';
import { ReservationPaymentAccessService } from '../reservations/services/reservation-payment-access.service';
import { ReservationStatusService } from '../reservations/services/reservation-status.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { CreatePublicCheckoutSessionDto } from './dto/create-public-checkout-session.dto';
import { CreateReservationChangeCheckoutDto } from './dto/create-reservation-change-checkout.dto';
import type { CheckoutResponse } from './types/checkout-response.type';

type PaymentConfirmationNotification = {
  reservationId: string;

  guest: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };

  locale: Locale;

  checkInDate: Date;
  checkOutDate: Date;

  nights: number;
  adults: number;

  roomNames: string[];

  paymentType: PaymentType;
  paymentId: string;

  amountPaid: number;
  totalPrice: number;
  remainingAmount: number;

  stripePaymentIntentId: string | null;
  paidAt: Date;
};

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe;
  private readonly frontendBaseUrl: string;
  private readonly webhookSecret: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly allocationService: ReservationAllocationService,
    private readonly statusService: ReservationStatusService,
    private readonly reservationChangeReviewService: ReservationChangeReviewService,
    private readonly reservationPaymentAccessService: ReservationPaymentAccessService,
    private readonly reservationNotificationService: ReservationNotificationService,
  ) {
    const stripeSecretKey =
      this.configService.get<string>(
        'STRIPE_SECRET_KEY',
      );

    const frontendBaseUrl =
      this.configService.get<string>(
        'FRONTEND_BASE_URL',
      );

    const webhookSecret =
      this.configService.get<string>(
        'STRIPE_WEBHOOK_SECRET',
      );

    if (!stripeSecretKey) {
      throw new Error(
        'STRIPE_SECRET_KEY is not configured.',
      );
    }

    if (!frontendBaseUrl?.trim()) {
      throw new Error(
        'FRONTEND_BASE_URL is not configured.',
      );
    }

    if (!webhookSecret) {
      throw new Error(
        'STRIPE_WEBHOOK_SECRET is not configured.',
      );
    }

    this.stripe = new Stripe(stripeSecretKey);
    this.frontendBaseUrl = frontendBaseUrl
      .trim()
      .replace(/\/+$/, '');
    this.webhookSecret = webhookSecret;
  }

  async createPublicCheckoutSession(
    dto: CreatePublicCheckoutSessionDto,
  ): Promise<CheckoutResponse> {
    this.validateInitialPaymentType(
      dto.paymentType,
    );

    const publicReservation =
      await this.reservationPaymentAccessService.getReservationByToken(
        dto.token,
      );

    if (
      !publicReservation.availablePaymentTypes.includes(
        dto.paymentType,
      )
    ) {
      throw new ConflictException({
        code: 'PAYMENT_TYPE_NOT_AVAILABLE',
        message:
          'Tipul de plată selectat nu mai este disponibil pentru această rezervare.',
        paymentType: dto.paymentType,
        availablePaymentTypes:
          publicReservation.availablePaymentTypes,
      });
    }

    return this.createCheckoutSession({
      reservationId:
        publicReservation.reservationId,
      paymentType: dto.paymentType,
    });
  }

  async createCheckoutSession(
    dto: CreateCheckoutSessionDto,
  ): Promise<CheckoutResponse> {
    this.validateInitialPaymentType(
      dto.paymentType,
    );

    const reservation =
      await this.prisma.reservation.findUnique({
        where: {
          id: dto.reservationId,
        },

        include: {
          guest: true,

          payments: {
            where: {
              status: PaymentStatus.PENDING,
              reservationChangeId: null,
            },

            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

    if (!reservation) {
      throw new NotFoundException(
        'Rezervarea nu a fost găsită.',
      );
    }

    if (
      reservation.status !==
      ReservationStatus.APPROVED_AWAITING_PAYMENT
    ) {
      throw new ConflictException({
        code: 'RESERVATION_NOT_AWAITING_PAYMENT',
        message:
          'Rezervarea nu se află în starea de așteptare a plății.',
        currentStatus: reservation.status,
      });
    }

    const now = new Date();

    if (
      !reservation.paymentExpiresAt ||
      reservation.paymentExpiresAt <= now
    ) {
      throw new ConflictException({
        code: 'RESERVATION_PAYMENT_EXPIRED',
        message:
          'Termenul disponibil pentru plată a expirat.',
      });
    }

    if (
      reservation.paidAmount.greaterThan(0)
    ) {
      throw new ConflictException({
        code: 'RESERVATION_ALREADY_PAID',
        message:
          'Rezervarea are deja o plată înregistrată.',
      });
    }

    const existingPayment =
      reservation.payments.find(
        (payment) =>
          payment.type === dto.paymentType &&
          payment.paymentUrl &&
          payment.stripeCheckoutSessionId,
      );

    if (
      existingPayment?.paymentUrl &&
      existingPayment.stripeCheckoutSessionId
    ) {
      return this.mapCheckoutResponse({
        payment: existingPayment,
        reservationId: reservation.id,

        checkoutSessionId:
          existingPayment.stripeCheckoutSessionId,

        checkoutUrl:
          existingPayment.paymentUrl,

        expiresAt:
          reservation.paymentExpiresAt,
      });
    }

    const amount =
      dto.paymentType === PaymentType.FULL
        ? reservation.totalPrice
        : reservation.depositAmount;

    if (amount.lessThanOrEqualTo(0)) {
      throw new BadRequestException({
        code: 'INVALID_PAYMENT_AMOUNT',
        message:
          'Suma de plată trebuie să fie mai mare decât zero.',
      });
    }

    const payment =
      await this.prisma.payment.create({
        data: {
          reservationId: reservation.id,
          reservationChangeId: null,

          type: dto.paymentType,
          status: PaymentStatus.PENDING,
          provider: PaymentProvider.STRIPE,

          amount,
          currency: 'RON',
        },
      });

    try {
      const returnUrls =
        this.buildStripeReturnUrls(
          reservation.locale,
        );

      const checkoutSession =
        await this.stripe.checkout.sessions.create({
          mode: 'payment',

          customer_email:
            reservation.guest.email,

          client_reference_id:
            reservation.id,

          metadata: {
            flow: 'INITIAL_RESERVATION',
            reservationId: reservation.id,
            paymentId: payment.id,
            paymentType: dto.paymentType,
          },

          payment_intent_data: {
            metadata: {
              flow: 'INITIAL_RESERVATION',
              reservationId:
                reservation.id,
              paymentId: payment.id,
            },
          },

          line_items: [
            {
              quantity: 1,

              price_data: {
                currency: 'ron',

                unit_amount:
                  this.toStripeAmount(
                    amount.toNumber(),
                  ),

                product_data: {
                  name:
                    dto.paymentType ===
                    PaymentType.FULL
                      ? 'Plată integrală rezervare Sunshine Resort'
                      : 'Avans rezervare Sunshine Resort',

                  description:
                    this.buildDescription(
                      reservation.checkInDate,
                      reservation.checkOutDate,
                    ),
                },
              },
            },
          ],

          success_url:
            `${returnUrls.successUrl}?session_id={CHECKOUT_SESSION_ID}`,

          cancel_url:
            `${returnUrls.cancelUrl}?reservationId=${encodeURIComponent(
              reservation.id,
            )}`,

          expires_at: Math.floor(
            reservation.paymentExpiresAt.getTime() /
              1000,
          ),
        });

      if (!checkoutSession.url) {
        throw new ConflictException({
          code: 'STRIPE_CHECKOUT_URL_MISSING',
          message:
            'Stripe nu a returnat URL-ul sesiunii de plată.',
        });
      }

      const updatedPayment =
        await this.prisma.payment.update({
          where: {
            id: payment.id,
          },

          data: {
            stripeCheckoutSessionId:
              checkoutSession.id,

            paymentUrl:
              checkoutSession.url,
          },
        });

      return this.mapCheckoutResponse({
        payment: updatedPayment,
        reservationId: reservation.id,

        checkoutSessionId:
          checkoutSession.id,

        checkoutUrl:
          checkoutSession.url,

        expiresAt:
          reservation.paymentExpiresAt,
      });
    } catch (error: unknown) {
      await this.markPaymentAsFailed(
        payment.id,
        error,
      );

      throw error;
    }
  }

  async createReservationChangeCheckoutSession(
    dto: CreateReservationChangeCheckoutDto,
  ): Promise<CheckoutResponse> {
    const change =
      await this.prisma.reservationChange.findUnique({
        where: {
          id: dto.reservationChangeId,
        },

        include: {
          reservation: {
            include: {
              guest: true,
            },
          },

          payments: {
            where: {
              status: PaymentStatus.PENDING,
              type:
                PaymentType.REMAINING_BALANCE,
            },

            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

    if (!change) {
      throw new NotFoundException(
        'Solicitarea de modificare nu a fost găsită.',
      );
    }

    if (
      change.status !==
      ReservationChangeStatus.APPROVED_AWAITING_PAYMENT
    ) {
      throw new ConflictException({
        code: 'RESERVATION_CHANGE_NOT_AWAITING_PAYMENT',
        message:
          'Solicitarea de modificare nu se află în starea de așteptare a plății.',
        currentStatus: change.status,
      });
    }

    if (
      change.reservation.status !==
      ReservationStatus.CONFIRMED
    ) {
      throw new ConflictException({
        code: 'RESERVATION_NOT_CONFIRMED',
        message:
          'Rezervarea asociată modificării nu mai este confirmată.',
        currentStatus:
          change.reservation.status,
      });
    }

    const now = new Date();

    if (
      !change.paymentExpiresAt ||
      change.paymentExpiresAt <= now
    ) {
      throw new ConflictException({
        code: 'RESERVATION_CHANGE_PAYMENT_EXPIRED',
        message:
          'Termenul disponibil pentru plata diferenței a expirat.',
      });
    }

    if (
      change.amountDue.lessThanOrEqualTo(0)
    ) {
      throw new BadRequestException({
        code: 'NO_ADDITIONAL_PAYMENT_REQUIRED',
        message:
          'Această modificare nu necesită o plată suplimentară.',
      });
    }

    const existingPayment =
      change.payments.find(
        (payment) =>
          payment.paymentUrl &&
          payment.stripeCheckoutSessionId,
      );

    if (
      existingPayment?.paymentUrl &&
      existingPayment.stripeCheckoutSessionId
    ) {
      return this.mapCheckoutResponse({
        payment: existingPayment,
        reservationId:
          change.reservationId,

        checkoutSessionId:
          existingPayment.stripeCheckoutSessionId,

        checkoutUrl:
          existingPayment.paymentUrl,

        expiresAt:
          change.paymentExpiresAt,
      });
    }

    const payment =
      await this.prisma.payment.create({
        data: {
          reservationId:
            change.reservationId,

          reservationChangeId:
            change.id,

          type:
            PaymentType.REMAINING_BALANCE,

          status:
            PaymentStatus.PENDING,

          provider:
            PaymentProvider.STRIPE,

          amount: change.amountDue,
          currency: 'RON',
        },
      });

    try {
      const returnUrls =
        this.buildStripeReturnUrls(
          change.reservation.locale,
        );

      const checkoutSession =
        await this.stripe.checkout.sessions.create({
          mode: 'payment',

          customer_email:
            change.reservation.guest.email,

          client_reference_id:
            change.reservationId,

          metadata: {
            flow: 'RESERVATION_CHANGE',

            reservationId:
              change.reservationId,

            reservationChangeId:
              change.id,

            paymentId: payment.id,

            paymentType:
              PaymentType.REMAINING_BALANCE,
          },

          payment_intent_data: {
            metadata: {
              flow: 'RESERVATION_CHANGE',

              reservationId:
                change.reservationId,

              reservationChangeId:
                change.id,

              paymentId: payment.id,
            },
          },

          line_items: [
            {
              quantity: 1,

              price_data: {
                currency: 'ron',

                unit_amount:
                  this.toStripeAmount(
                    change.amountDue.toNumber(),
                  ),

                product_data: {
                  name:
                    'Diferență de preț modificare rezervare Sunshine Resort',

                  description:
                    `Modificare sejur: ${this.formatDate(
                      change.requestedCheckInDate,
                    )} – ${this.formatDate(
                      change.requestedCheckOutDate,
                    )}`,
                },
              },
            },
          ],

          success_url:
            `${returnUrls.successUrl}?session_id={CHECKOUT_SESSION_ID}`,

          cancel_url:
            `${returnUrls.cancelUrl}?reservationChangeId=${encodeURIComponent(
              change.id,
            )}`,

          expires_at: Math.floor(
            change.paymentExpiresAt.getTime() /
              1000,
          ),
        });

      if (!checkoutSession.url) {
        throw new ConflictException({
          code: 'STRIPE_CHECKOUT_URL_MISSING',
          message:
            'Stripe nu a returnat URL-ul sesiunii de plată.',
        });
      }

      const updatedPayment =
        await this.prisma.payment.update({
          where: {
            id: payment.id,
          },

          data: {
            stripeCheckoutSessionId:
              checkoutSession.id,

            paymentUrl:
              checkoutSession.url,
          },
        });

      return this.mapCheckoutResponse({
        payment: updatedPayment,

        reservationId:
          change.reservationId,

        checkoutSessionId:
          checkoutSession.id,

        checkoutUrl:
          checkoutSession.url,

        expiresAt:
          change.paymentExpiresAt,
      });
    } catch (error: unknown) {
      await this.markPaymentAsFailed(
        payment.id,
        error,
      );

      throw error;
    }
  }

  async handleWebhook(
    rawBody: Buffer | undefined,
    stripeSignature: string | undefined,
  ): Promise<{ received: true }> {
    if (!rawBody) {
      throw new BadRequestException(
        'Body-ul brut al webhook-ului lipsește.',
      );
    }

    if (!stripeSignature) {
      throw new BadRequestException(
        'Headerul Stripe-Signature lipsește.',
      );
    }

    let event: Stripe.Event;

    try {
      event =
        this.stripe.webhooks.constructEvent(
          rawBody,
          stripeSignature,
          this.webhookSecret,
        );
    } catch (error: unknown) {
      throw new BadRequestException(
        error instanceof Error
          ? `Semnătura webhook-ului este invalidă: ${error.message}`
          : 'Semnătura webhook-ului este invalidă.',
      );
    }

    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session =
          event.data.object;

        if (
          session.payment_status === 'paid'
        ) {
          await this.processSuccessfulCheckout(
            session,
            event.id,
          );
        }

        break;
      }

      case 'checkout.session.expired': {
        await this.processExpiredCheckout(
          event.data.object,
          event.id,
        );

        break;
      }

      case 'checkout.session.async_payment_failed': {
        await this.processFailedCheckout(
          event.data.object,
          event.id,
          'Plata asincronă Stripe a eșuat.',
        );

        break;
      }

      default:
        break;
    }

    return {
      received: true,
    };
  }

  private async processSuccessfulCheckout(
    session: Stripe.Checkout.Session,
    stripeEventId: string,
  ): Promise<void> {
    const paymentId =
      session.metadata?.paymentId;

    const reservationId =
      session.metadata?.reservationId;

    if (!paymentId || !reservationId) {
      throw new BadRequestException(
        'Metadata webhook-ului este incompletă.',
      );
    }

    try {
      const notification =
        await this.prisma.$transaction<
          PaymentConfirmationNotification | null
        >(
          async (transaction) => {
            const payment =
              await transaction.payment.findUnique({
                where: {
                  id: paymentId,
                },
              });

            if (!payment) {
              throw new NotFoundException(
                'Plata asociată webhook-ului nu a fost găsită.',
              );
            }

            if (
              payment.reservationId !==
                reservationId ||
              payment.stripeCheckoutSessionId !==
                session.id
            ) {
              throw new ConflictException({
                code: 'PAYMENT_WEBHOOK_MISMATCH',
                message:
                  'Datele sesiunii Stripe nu corespund plății interne.',
              });
            }

            const reservation =
              await transaction.reservation.findUnique({
                where: {
                  id: reservationId,
                },

                include: {
                  guest: true,

                  rooms: {
                    include: {
                      roomType: true,
                    },

                    orderBy: {
                      id: 'asc',
                    },
                  },
                },
              });

            if (!reservation) {
              throw new NotFoundException(
                'Rezervarea asociată plății nu a fost găsită.',
              );
            }

            const isReservationChangePayment =
              payment.type ===
                PaymentType.REMAINING_BALANCE &&
              payment.reservationChangeId !== null;

            /*
            * Webhook idempotent:
            * nu repetăm actualizarea și notificările
            * dacă plata a fost deja procesată.
            */
            if (
              payment.status ===
              PaymentStatus.PAID
            ) {
              if (isReservationChangePayment) {
                const change =
                  await transaction.reservationChange.findUnique({
                    where: {
                      id: payment.reservationChangeId!,
                    },

                    select: {
                      status: true,
                    },
                  });

                if (
                  change?.status ===
                  ReservationChangeStatus.APPLIED
                ) {
                  return null;
                }
              } else if (
                reservation.status ===
                ReservationStatus.CONFIRMED
              ) {
                return null;
              }
            }

            if (
              !isReservationChangePayment &&
              reservation.status !==
                ReservationStatus.APPROVED_AWAITING_PAYMENT
            ) {
              throw new ConflictException({
                code: 'RESERVATION_NOT_AWAITING_PAYMENT',
                message:
                  'Rezervarea nu mai așteaptă confirmarea plății.',
                currentStatus:
                  reservation.status,
              });
            }

            if (
              isReservationChangePayment &&
              reservation.status !==
                ReservationStatus.CONFIRMED
            ) {
              throw new ConflictException({
                code: 'RESERVATION_NOT_CONFIRMED',
                message:
                  'Rezervarea asociată modificării nu mai este confirmată.',
                currentStatus:
                  reservation.status,
              });
            }

            const stripeAmount =
              session.amount_total ?? 0;

            const expectedAmount =
              this.toStripeAmount(
                payment.amount.toNumber(),
              );

            if (
              stripeAmount !==
              expectedAmount
            ) {
              throw new ConflictException({
                code: 'STRIPE_AMOUNT_MISMATCH',
                message:
                  'Suma achitată prin Stripe nu corespunde plății interne.',
                expectedAmount,
                receivedAmount:
                  stripeAmount,
              });
            }

            const paymentIntentId =
              typeof session.payment_intent ===
              'string'
                ? session.payment_intent
                : session.payment_intent?.id;

            const paymentConfirmedAt =
              new Date();

            if (
              payment.status !==
              PaymentStatus.PAID
            ) {
              await transaction.payment.update({
                where: {
                  id: payment.id,
                },

                data: {
                  status:
                    PaymentStatus.PAID,

                  paidAt:
                    paymentConfirmedAt,

                  providerEventId:
                    stripeEventId,

                  stripePaymentIntentId:
                    paymentIntentId ?? null,

                  failureReason: null,
                },
              });
            }

            if (
              isReservationChangePayment
            ) {
              if (
                !payment.reservationChangeId
              ) {
                throw new ConflictException({
                  code: 'RESERVATION_CHANGE_REFERENCE_MISSING',
                  message:
                    'Plata diferenței nu are asociată solicitarea de modificare.',
                });
              }

              await this.reservationChangeReviewService.applyPaidChangeInTransaction(
                transaction,
                payment.reservationChangeId,
                paymentConfirmedAt,
              );

              await transaction.reservation.update({
                where: {
                  id: reservation.id,
                },

                data: {
                  paidAmount:
                    reservation.paidAmount.plus(
                      payment.amount,
                    ),
                },
              });

              /*
              * Pentru moment nu trimitem emailul standard
              * de confirmare a rezervării pentru plata
              * unei modificări.
              */
              return null;
            }

            await this.allocationService.allocateRoomsInTransaction(
              transaction,
              reservation.id,
            );

            const confirmationUpdate =
              this.statusService.buildConfirmationUpdate(
                reservation.status,
              );

            await transaction.reservation.update({
              where: {
                id: reservation.id,
              },

              data: {
                ...confirmationUpdate,

                paidAmount:
                  payment.amount,

                paymentAccessTokenHash:
                  null,

                paymentAccessTokenExpiresAt:
                  null,
              },
            });

            const roomNames =
              reservation.rooms.map(
                (reservationRoom) =>
                  reservation.locale ===
                  Locale.EN
                    ? reservationRoom.roomType
                        .nameEn
                    : reservationRoom.roomType
                        .nameRo,
              );

            const amountPaid =
              payment.amount.toNumber();

            const totalPrice =
              reservation.totalPrice.toNumber();

            const remainingAmount =
              Math.max(
                0,
                new Prisma.Decimal(
                  reservation.totalPrice,
                )
                  .minus(payment.amount)
                  .toNumber(),
              );

            return {
              reservationId:
                reservation.id,

              guest: {
                firstName:
                  reservation.guest.firstName,

                lastName:
                  reservation.guest.lastName,

                email:
                  reservation.guest.email,

                phone:
                  reservation.guest.phone,
              },

              locale:
                reservation.locale,

              checkInDate:
                reservation.checkInDate,

              checkOutDate:
                reservation.checkOutDate,

              nights:
                reservation.nights,

              adults:
                reservation.adults,

              roomNames,

              paymentType:
                payment.type,

              paymentId:
                payment.id,

              amountPaid,

              totalPrice,

              remainingAmount,

              stripePaymentIntentId:
                paymentIntentId ?? null,

              paidAt:
                paymentConfirmedAt,
            };
          },
          {
            isolationLevel:
              Prisma.TransactionIsolationLevel.Serializable,
          },
        );

      /*
      * Notificările se trimit doar după commit.
      * Fiecare metodă tratează intern erorile Resend,
      * astfel încât webhook-ul Stripe să poată răspunde cu 200.
      */
      if (notification) {
        await Promise.all([
          this.reservationNotificationService.sendPaymentConfirmed(
            {
              reservationId:
                notification.reservationId,

              guest: {
                firstName:
                  notification.guest.firstName,

                email:
                  notification.guest.email,
              },

              locale:
                notification.locale,

              checkInDate:
                notification.checkInDate,

              checkOutDate:
                notification.checkOutDate,

              nights:
                notification.nights,

              adults:
                notification.adults,

              roomNames:
                notification.roomNames,

              amountPaid:
                notification.amountPaid,

              totalPrice:
                notification.totalPrice,
            },
          ),

          this.reservationNotificationService.sendPaymentConfirmedToAdmin(
            {
              reservationId:
                notification.reservationId,

              guest: {
                firstName:
                  notification.guest.firstName,

                lastName:
                  notification.guest.lastName,

                email:
                  notification.guest.email,

                phone:
                  notification.guest.phone,
              },

              checkInDate:
                notification.checkInDate,

              checkOutDate:
                notification.checkOutDate,

              nights:
                notification.nights,

              adults:
                notification.adults,

              roomNames:
                notification.roomNames,

              paymentType:
                notification.paymentType,

              amountPaid:
                notification.amountPaid,

              totalPrice:
                notification.totalPrice,

              remainingAmount:
                notification.remainingAmount,

              paymentId:
                notification.paymentId,

              stripePaymentIntentId:
                notification.stripePaymentIntentId,

              paidAt:
                notification.paidAt,
            },
          ),
        ]);
      }
    } catch (error: unknown) {
      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2034'
      ) {
        throw new ConflictException({
          code: 'PAYMENT_CONFIRMATION_CONFLICT',
          message:
            'Confirmarea plății a intrat în conflict cu o altă operațiune. Stripe va reîncerca webhook-ul.',
        });
      }

      throw error;
    }
  }

  private async processExpiredCheckout(
    session: Stripe.Checkout.Session,
    stripeEventId: string,
  ): Promise<void> {
    const paymentId =
      session.metadata?.paymentId;

    if (!paymentId) {
      return;
    }

    const payment =
      await this.prisma.payment.findUnique({
        where: {
          id: paymentId,
        },
      });

    if (!payment) {
      return;
    }

    await this.prisma.payment.updateMany({
      where: {
        id: payment.id,
        status: PaymentStatus.PENDING,
      },

      data: {
        status:
          PaymentStatus.CANCELLED,

        cancelledAt:
          new Date(),

        providerEventId:
          stripeEventId,

        failureReason:
          'Sesiunea Stripe Checkout a expirat.',
      },
    });

    if (payment.reservationChangeId) {
      await this.prisma.reservationChange.updateMany({
        where: {
          id: payment.reservationChangeId,

          status:
            ReservationChangeStatus.APPROVED_AWAITING_PAYMENT,
        },

        data: {
          status:
            ReservationChangeStatus.EXPIRED,

          expiredAt:
            new Date(),

          paymentExpiresAt:
            null,
        },
      });

      return;
    }

    /*
     * Expirarea unei singure sesiuni Stripe nu expiră automat
     * rezervarea dacă termenul general de 24h încă este activ.
     * ReservationExpirationService gestionează termenul final.
     */
  }

  private async processFailedCheckout(
    session: Stripe.Checkout.Session,
    stripeEventId: string,
    reason: string,
  ): Promise<void> {
    const paymentId =
      session.metadata?.paymentId;

    if (!paymentId) {
      return;
    }

    await this.prisma.payment.updateMany({
      where: {
        id: paymentId,
        status: PaymentStatus.PENDING,
      },

      data: {
        status:
          PaymentStatus.FAILED,

        failedAt:
          new Date(),

        providerEventId:
          stripeEventId,

        failureReason:
          reason,
      },
    });
  }

  private validateInitialPaymentType(
    paymentType: PaymentType,
  ): void {
    const allowedTypes: PaymentType[] = [
      PaymentType.DEPOSIT,
      PaymentType.FULL,
    ];

    if (
      !allowedTypes.includes(paymentType)
    ) {
      throw new BadRequestException({
        code: 'INVALID_INITIAL_PAYMENT_TYPE',
        message:
          'Pentru rezervarea inițială poți alege doar plata avansului sau plata integrală.',
      });
    }
  }

  private async markPaymentAsFailed(
    paymentId: string,
    error: unknown,
  ): Promise<void> {
    await this.prisma.payment.update({
      where: {
        id: paymentId,
      },

      data: {
        status:
          PaymentStatus.FAILED,

        failedAt:
          new Date(),

        failureReason:
          error instanceof Error
            ? error.message
            : 'Eroare necunoscută la crearea checkout-ului.',
      },
    });
  }

  private mapCheckoutResponse(params: {
    payment: {
      id: string;
      type: PaymentType;
      status: PaymentStatus;
      amount: Prisma.Decimal;
      currency: string;
    };

    reservationId: string;

    checkoutSessionId: string;
    checkoutUrl: string;

    expiresAt: Date | null;
  }): CheckoutResponse {
    return {
      paymentId:
        params.payment.id,

      reservationId:
        params.reservationId,

      paymentType:
        params.payment.type,

      paymentStatus:
        params.payment.status,

      amount:
        params.payment.amount.toNumber(),

      currency:
        params.payment.currency,

      checkoutSessionId:
        params.checkoutSessionId,

      checkoutUrl:
        params.checkoutUrl,

      expiresAt:
        params.expiresAt?.toISOString() ??
        null,
    };
  }

  private buildStripeReturnUrls(
    locale: Locale,
  ): {
    successUrl: string;
    cancelUrl: string;
  } {
    const localePath =
      locale === Locale.EN ? 'en' : 'ro';

    return {
      successUrl:
        `${this.frontendBaseUrl}/${localePath}/booking/payment-success`,

      cancelUrl:
        `${this.frontendBaseUrl}/${localePath}/booking/payment-cancelled`,
    };
  }

  private toStripeAmount(
    amount: number,
  ): number {
    return new Prisma.Decimal(amount)
      .mul(100)
      .toDecimalPlaces(0)
      .toNumber();
  }

  private buildDescription(
    checkInDate: Date,
    checkOutDate: Date,
  ): string {
    return `Sejur ${this.formatDate(
      checkInDate,
    )} – ${this.formatDate(
      checkOutDate,
    )}`;
  }

  private formatDate(
    date: Date,
  ): string {
    return date
      .toISOString()
      .slice(0, 10);
  }
}
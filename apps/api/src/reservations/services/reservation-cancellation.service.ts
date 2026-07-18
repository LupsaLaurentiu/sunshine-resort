import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Locale,
  PaymentProvider,
  PaymentStatus,
  Prisma,
} from '@prisma/client';
import Stripe from 'stripe';
import { PrismaService } from '../../prisma/prisma.service';
import { CancelReservationDto } from '../dto/cancel-reservation.dto';
import { ReservationNotificationService } from './reservation-notification.service';
import { ReservationStatusService } from './reservation-status.service';

type RefundPlan = {
  daysBeforeCheckIn: number;
  refundable: boolean;
  refundAmount: Prisma.Decimal;
  retainedAmount: Prisma.Decimal;
};

@Injectable()
export class ReservationCancellationService {
  private static readonly FREE_CANCELLATION_DAYS = 15;

  private readonly stripe: Stripe;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly statusService: ReservationStatusService,
    private readonly reservationNotificationService: ReservationNotificationService,
  ) {
    const stripeSecretKey =
      this.configService.get<string>(
        'STRIPE_SECRET_KEY',
      );

    if (!stripeSecretKey) {
      throw new Error(
        'STRIPE_SECRET_KEY is not configured.',
      );
    }

    this.stripe = new Stripe(
      stripeSecretKey,
    );
  }

  async cancel(
    reservationId: string,
    adminId: string,
    dto: CancelReservationDto,
  ) {
    const reservation =
      await this.prisma.reservation.findUnique({
        where: {
          id: reservationId,
        },

        include: {
          guest: true,

          rooms: {
            include: {
              roomType: true,
              room: true,
            },
          },

          payments: {
            where: {
              status: {
                in: [
                  PaymentStatus.PAID,
                  PaymentStatus.REFUNDED,
                ],
              },
            },

            orderBy: {
              paidAt: 'asc',
            },
          },
        },
      });

    if (!reservation) {
      throw new NotFoundException(
        'Rezervarea nu a fost găsită.',
      );
    }

    const cancellationUpdate =
      this.statusService.buildCancellationUpdate(
        reservation.status,
        dto.reason,
      );

    const refundPlan =
      this.calculateRefundPlan({
        checkInDate:
          reservation.checkInDate,

        paidAmount:
          reservation.paidAmount,

        depositAmount:
          reservation.depositAmount,
      });

    const refundablePayments =
      reservation.payments.filter(
        (payment) =>
          payment.provider ===
            PaymentProvider.STRIPE &&
          payment.status ===
            PaymentStatus.PAID &&
          payment.stripePaymentIntentId !==
            null &&
          payment.amount
            .minus(
              payment.refundedAmount,
            )
            .greaterThan(0),
      );

    const availableStripeRefundAmount =
      refundablePayments.reduce(
        (total, payment) =>
          total.plus(
            payment.amount.minus(
              payment.refundedAmount,
            ),
          ),
        new Prisma.Decimal(0),
      );

    if (
      refundPlan.refundAmount.greaterThan(
        availableStripeRefundAmount,
      )
    ) {
      throw new ConflictException({
        code:
          'INSUFFICIENT_REFUNDABLE_STRIPE_AMOUNT',

        message:
          'Suma rambursabilă nu poate fi asociată integral plăților Stripe existente.',

        requestedRefund:
          refundPlan.refundAmount.toNumber(),

        availableStripeRefund:
          availableStripeRefundAmount.toNumber(),
      });
    }

    /*
     * Refundurile sunt create înaintea tranzacției DB deoarece
     * Stripe este un sistem extern și nu poate participa la
     * tranzacția Prisma.
     *
     * Folosim idempotencyKey pentru a evita dublarea unui refund
     * dacă requestul este retrimis.
     */
    const processedRefunds =
      refundPlan.refundAmount.greaterThan(
        0,
      )
        ? await this.createStripeRefunds(
            reservation.id,
            refundablePayments,
            refundPlan.refundAmount,
          )
        : [];

    try {
      const updatedReservation =
        await this.prisma.$transaction(
          async (transaction) => {
            for (
              const processedRefund of processedRefunds
            ) {
              const payment =
                await transaction.payment.findUnique({
                  where: {
                    id: processedRefund.paymentId,
                  },
                });

              if (!payment) {
                throw new NotFoundException(
                  'Plata rambursată nu a fost găsită.',
                );
              }

              const newRefundedAmount =
                payment.refundedAmount.plus(
                  processedRefund.amount,
                );

              const fullyRefunded =
                newRefundedAmount.greaterThanOrEqualTo(
                  payment.amount,
                );

              await transaction.payment.update({
                where: {
                  id: payment.id,
                },

                data: {
                  refundedAmount:
                    newRefundedAmount,

                  stripeRefundId:
                    processedRefund.stripeRefundId,

                  refundedAt:
                    new Date(),

                  refundReason:
                    dto.reason.trim(),

                  status:
                    fullyRefunded
                      ? PaymentStatus.REFUNDED
                      : PaymentStatus.PAID,
                },
              });
            }

            const remainingPaidAmount =
              Prisma.Decimal.max(
                reservation.paidAmount.minus(
                  refundPlan.refundAmount,
                ),
                new Prisma.Decimal(0),
              );

            const updateResult =
              await transaction.reservation.updateMany({
                where: {
                  id: reservation.id,
                  status: reservation.status,
                },

                data: {
                  ...cancellationUpdate,

                  paidAmount:
                    remainingPaidAmount,

                  adminNotes:
                    this.buildAdminNotes(
                      reservation.adminNotes,
                      dto.adminNotes,
                      adminId,
                      refundPlan,
                    ),
                },
              });

            if (
              updateResult.count !== 1
            ) {
              throw new ConflictException({
                code:
                  'RESERVATION_CANCELLATION_CONFLICT',

                message:
                  'Rezervarea a fost modificată între timp și nu mai poate fi anulată.',
              });
            }

            return transaction.reservation.findUniqueOrThrow(
              {
                where: {
                  id: reservation.id,
                },

                include: {
                  guest: true,

                  rooms: {
                    include: {
                      roomType: true,
                      room: true,
                    },

                    orderBy: {
                      id: 'asc',
                    },
                  },

                  payments: {
                    orderBy: {
                      createdAt: 'desc',
                    },
                  },
                },
              },
            );
          },
          {
            isolationLevel:
              Prisma.TransactionIsolationLevel
                .Serializable,
          },
        );

      const roomNames =
        updatedReservation.rooms.map(
          (reservationRoom) =>
            updatedReservation.locale ===
            Locale.EN
              ? reservationRoom.roomType
                  .nameEn
              : reservationRoom.roomType
                  .nameRo,
        );

      const cancellationReason =
        updatedReservation.cancellationReason ??
        dto.reason;

      const previouslyPaidAmount =
        reservation.paidAmount.toNumber();

      const refundedAmount =
        refundPlan.refundAmount.toNumber();

      const retainedAmount =
        refundPlan.retainedAmount.toNumber();

      const cancelledAt =
        updatedReservation.cancelledAt ??
        new Date();

      /*
       * Notificările sunt trimise numai după commit-ul tranzacției.
       * ReservationNotificationService tratează intern erorile de
       * email, astfel încât anularea efectuată cu succes să nu fie
       * anulată logic dacă furnizorul de email nu răspunde.
       */
      await Promise.all([
        this.reservationNotificationService.sendReservationCancelled(
          {
            reservationId:
              updatedReservation.id,

            guest: {
              firstName:
                updatedReservation.guest
                  .firstName,

              email:
                updatedReservation.guest
                  .email,
            },

            locale:
              updatedReservation.locale,

            checkInDate:
              updatedReservation.checkInDate,

            checkOutDate:
              updatedReservation.checkOutDate,

            roomNames,

            cancellationReason,

            previouslyPaidAmount,
            refundedAmount,
            retainedAmount,
          },
        ),

        this.reservationNotificationService.sendReservationCancelledToAdmin(
          {
            reservationId:
              updatedReservation.id,

            guest: {
              firstName:
                updatedReservation.guest
                  .firstName,

              lastName:
                updatedReservation.guest
                  .lastName,

              email:
                updatedReservation.guest
                  .email,

              phone:
                updatedReservation.guest
                  .phone,
            },

            checkInDate:
              updatedReservation.checkInDate,

            checkOutDate:
              updatedReservation.checkOutDate,

            nights:
              updatedReservation.nights,

            adults:
              updatedReservation.adults,

            roomNames,

            cancellationReason,

            previouslyPaidAmount,
            refundedAmount,
            retainedAmount,

            cancelledAt,
          },
        ),
      ]);

      return {
        id:
          updatedReservation.id,

        status:
          updatedReservation.status,

        checkIn:
          this.formatDate(
            updatedReservation.checkInDate,
          ),

        checkOut:
          this.formatDate(
            updatedReservation.checkOutDate,
          ),

        cancellationReason:
          updatedReservation.cancellationReason,

        cancelledAt:
          updatedReservation.cancelledAt?.toISOString() ??
          null,

        daysBeforeCheckIn:
          refundPlan.daysBeforeCheckIn,

        freeCancellation:
          refundPlan.refundable,

        previouslyPaidAmount,

        refundedAmount,

        retainedAmount,

        remainingPaidAmount:
          updatedReservation.paidAmount.toNumber(),

        refunds:
          processedRefunds.map(
            (refund) => ({
              paymentId:
                refund.paymentId,

              stripeRefundId:
                refund.stripeRefundId,

              amount:
                refund.amount.toNumber(),
            }),
          ),

        roomsReleased: true,

        message:
          refundPlan.refundAmount.greaterThan(
            0,
          )
            ? 'Rezervarea a fost anulată, iar rambursarea a fost inițiată prin Stripe.'
            : 'Rezervarea a fost anulată. Conform politicii de anulare, nu se rambursează nicio sumă.',
      };
    } catch (error: unknown) {
      /*
       * Dacă Stripe a acceptat refundul, dar tranzacția DB eșuează,
       * situația trebuie reconciliată manual sau prin webhookurile
       * refund.created/refund.updated. Nu ascundem această situație.
       */
      if (
        processedRefunds.length > 0
      ) {
        throw new ConflictException({
          code:
            'REFUND_CREATED_DATABASE_UPDATE_FAILED',

          message:
            'Stripe a creat rambursarea, dar actualizarea internă a rezervării a eșuat. Verifică rambursarea în Stripe Dashboard și reconciliază plata.',

          stripeRefundIds:
            processedRefunds.map(
              (refund) =>
                refund.stripeRefundId,
            ),
        });
      }

      throw error;
    }
  }

  private calculateRefundPlan(params: {
    checkInDate: Date;
    paidAmount: Prisma.Decimal;
    depositAmount: Prisma.Decimal;
  }): RefundPlan {
    const today =
      this.getTodayInRomania();

    const checkInDate =
      new Date(params.checkInDate);

    const daysBeforeCheckIn =
      this.getDifferenceInDays(
        today,
        checkInDate,
      );

    if (
      daysBeforeCheckIn < 0
    ) {
      throw new ConflictException({
        code:
          'CHECK_IN_ALREADY_PASSED',

        message:
          'Rezervarea nu poate fi anulată după începerea perioadei de cazare.',
      });
    }

    const qualifiesForFreeCancellation =
      daysBeforeCheckIn >=
      ReservationCancellationService
        .FREE_CANCELLATION_DAYS;

    if (
      params.paidAmount.lessThanOrEqualTo(
        0,
      )
    ) {
      return {
        daysBeforeCheckIn,

        refundable:
          qualifiesForFreeCancellation,

        refundAmount:
          new Prisma.Decimal(0),

        retainedAmount:
          new Prisma.Decimal(0),
      };
    }

    if (
      qualifiesForFreeCancellation
    ) {
      return {
        daysBeforeCheckIn,
        refundable: true,

        refundAmount:
          params.paidAmount,

        retainedAmount:
          new Prisma.Decimal(0),
      };
    }

    /*
     * Sub 15 zile resortul păstrează cel mult avansul contractual.
     *
     * Avans achitat:
     * paid = deposit -> refund = 0
     *
     * Integral achitat:
     * paid = total -> refund = total - deposit
     */
    const retainedAmount =
      Prisma.Decimal.min(
        params.paidAmount,
        params.depositAmount,
      );

    const refundAmount =
      Prisma.Decimal.max(
        params.paidAmount.minus(
          retainedAmount,
        ),
        new Prisma.Decimal(0),
      );

    return {
      daysBeforeCheckIn,
      refundable: false,
      refundAmount,
      retainedAmount,
    };
  }

  private async createStripeRefunds(
    reservationId: string,

    payments: Array<{
      id: string;
      amount: Prisma.Decimal;
      refundedAmount: Prisma.Decimal;
      stripePaymentIntentId:
        | string
        | null;
    }>,

    requestedRefundAmount:
      Prisma.Decimal,
  ): Promise<
    Array<{
      paymentId: string;
      stripeRefundId: string;
      amount: Prisma.Decimal;
    }>
  > {
    const results: Array<{
      paymentId: string;
      stripeRefundId: string;
      amount: Prisma.Decimal;
    }> = [];

    let remainingAmount =
      new Prisma.Decimal(
        requestedRefundAmount,
      );

    for (
      const payment of payments
    ) {
      if (
        remainingAmount.lessThanOrEqualTo(
          0,
        )
      ) {
        break;
      }

      if (
        !payment.stripePaymentIntentId
      ) {
        continue;
      }

      const refundableOnPayment =
        payment.amount.minus(
          payment.refundedAmount,
        );

      const amountForThisPayment =
        Prisma.Decimal.min(
          refundableOnPayment,
          remainingAmount,
        );

      if (
        amountForThisPayment.lessThanOrEqualTo(
          0,
        )
      ) {
        continue;
      }

      const stripeRefund =
        await this.stripe.refunds.create(
          {
            payment_intent:
              payment.stripePaymentIntentId,

            amount:
              this.toStripeAmount(
                amountForThisPayment,
              ),

            reason:
              'requested_by_customer',

            metadata: {
              reservationId,
              paymentId:
                payment.id,

              refundType:
                amountForThisPayment.equals(
                  refundableOnPayment,
                )
                  ? 'FULL'
                  : 'PARTIAL',
            },
          },
          {
            idempotencyKey:
              `reservation-cancel-${reservationId}-${payment.id}-${amountForThisPayment.toFixed(
                2,
              )}`,
          },
        );

      results.push({
        paymentId:
          payment.id,

        stripeRefundId:
          stripeRefund.id,

        amount:
          amountForThisPayment,
      });

      remainingAmount =
        remainingAmount.minus(
          amountForThisPayment,
        );
    }

    if (
      remainingAmount.greaterThan(0)
    ) {
      throw new ConflictException({
        code:
          'REFUND_ALLOCATION_FAILED',

        message:
          'Suma de rambursat nu a putut fi distribuită integral pe plățile Stripe.',

        remainingAmount:
          remainingAmount.toNumber(),
      });
    }

    return results;
  }

  private buildAdminNotes(
    existingNotes: string | null,
    newNotes: string | undefined,
    adminId: string,
    refundPlan: RefundPlan,
  ): string {
    const entries = [
      existingNotes?.trim(),
      newNotes?.trim(),

      `Rezervare anulată de administratorul ${adminId}.`,

      `Rambursat: ${refundPlan.refundAmount.toFixed(
        2,
      )} RON. Reținut: ${refundPlan.retainedAmount.toFixed(
        2,
      )} RON.`,
    ].filter(
      (
        entry,
      ): entry is string =>
        Boolean(
          entry &&
            entry.length > 0,
        ),
    );

    return entries.join('\n');
  }

  private getTodayInRomania(): Date {
    const dateString =
      new Intl.DateTimeFormat(
        'en-CA',
        {
          timeZone:
            'Europe/Bucharest',

          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        },
      ).format(new Date());

    return new Date(
      `${dateString}T00:00:00.000Z`,
    );
  }

  private getDifferenceInDays(
    startDate: Date,
    endDate: Date,
  ): number {
    const millisecondsPerDay =
      24 * 60 * 60 * 1000;

    return Math.floor(
      (endDate.getTime() -
        startDate.getTime()) /
        millisecondsPerDay,
    );
  }

  private toStripeAmount(
    amount: Prisma.Decimal,
  ): number {
    return amount
      .mul(100)
      .toDecimalPlaces(0)
      .toNumber();
  }

  private formatDate(
    date: Date,
  ): string {
    return date
      .toISOString()
      .slice(0, 10);
  }
}
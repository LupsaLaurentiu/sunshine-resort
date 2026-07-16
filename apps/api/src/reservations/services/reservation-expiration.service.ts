import {
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import {
  Cron,
  CronExpression,
} from '@nestjs/schedule';
import {
  PaymentStatus,
  Prisma,
  ReservationChangeStatus,
  ReservationStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

type ExpirationResult = {
  pendingApprovalReservations: number;
  awaitingPaymentReservations: number;
  pendingApprovalChanges: number;
  awaitingPaymentChanges: number;
  cancelledPayments: number;
};

@Injectable()
export class ReservationExpirationService
  implements OnModuleInit
{
  private readonly logger = new Logger(
    ReservationExpirationService.name,
  );

  /**
   * Împiedică suprapunerea execuțiilor în aceeași instanță Node.
   *
   * Dacă un ciclu durează mai mult de un minut, următorul ciclu
   * va fi ignorat până la finalizarea celui curent.
   */
  private isRunning = false;

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit(): void {
    this.logger.log(
      'Serviciul de expirare automată a rezervărilor este activ.',
    );
  }

  /**
   * Rulează la fiecare minut.
   *
   * Pentru producție putem modifica ulterior frecvența la
   * fiecare 2-5 minute, fără să schimbăm logica serviciului.
   */
  @Cron(CronExpression.EVERY_MINUTE, {
    name: 'reservation-expiration',
    timeZone: 'Europe/Bucharest',
  })
  async handleExpirationCron(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn(
        'Ciclul anterior de expirare încă rulează. Execuția curentă este omisă.',
      );
      return;
    }

    this.isRunning = true;

    try {
      const result = await this.expireAll();

      const totalExpired =
        result.pendingApprovalReservations +
        result.awaitingPaymentReservations +
        result.pendingApprovalChanges +
        result.awaitingPaymentChanges;

      if (
        totalExpired > 0 ||
        result.cancelledPayments > 0
      ) {
        this.logger.log(
          [
            'Procesare expirări finalizată:',
            `rezervări neaprobate=${result.pendingApprovalReservations}`,
            `rezervări neplătite=${result.awaitingPaymentReservations}`,
            `modificări neaprobate=${result.pendingApprovalChanges}`,
            `modificări neplătite=${result.awaitingPaymentChanges}`,
            `plăți anulate=${result.cancelledPayments}`,
          ].join(' '),
        );
      }
    } catch (error: unknown) {
      this.logger.error(
        'Procesarea expirărilor automate a eșuat.',
        error instanceof Error
          ? error.stack
          : String(error),
      );
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Metodă publică utilă și pentru teste sau comenzi administrative.
   */
  async expireAll(
    now = new Date(),
  ): Promise<ExpirationResult> {
    const pendingApprovalReservations =
      await this.expirePendingApprovalReservations(now);

    const awaitingPaymentReservations =
      await this.expireAwaitingPaymentReservations(now);

    const pendingApprovalChanges =
      await this.expirePendingApprovalChanges(now);

    const awaitingPaymentChanges =
      await this.expireAwaitingPaymentChanges(now);

    return {
      pendingApprovalReservations:
        pendingApprovalReservations.expiredCount,

      awaitingPaymentReservations:
        awaitingPaymentReservations.expiredCount,

      pendingApprovalChanges:
        pendingApprovalChanges.expiredCount,

      awaitingPaymentChanges:
        awaitingPaymentChanges.expiredCount,

      cancelledPayments:
        awaitingPaymentReservations.cancelledPayments +
        awaitingPaymentChanges.cancelledPayments,
    };
  }

  /**
   * PENDING_APPROVAL -> EXPIRED
   *
   * Se aplică rezervărilor pentru care adminul nu a răspuns
   * în fereastra de 24 de ore.
   */
  private async expirePendingApprovalReservations(
    now: Date,
  ): Promise<{
    expiredCount: number;
    cancelledPayments: number;
  }> {
    try {
      return await this.prisma.$transaction(
        async (transaction) => {
          const expiredReservations =
            await transaction.reservation.findMany({
              where: {
                status:
                  ReservationStatus.PENDING_APPROVAL,

                approvalExpiresAt: {
                  not: null,
                  lte: now,
                },
              },

              select: {
                id: true,
              },
            });

          if (expiredReservations.length === 0) {
            return {
              expiredCount: 0,
              cancelledPayments: 0,
            };
          }

          const reservationIds =
            expiredReservations.map(
              (reservation) => reservation.id,
            );

          /**
           * În mod normal nu există plăți pentru acest status,
           * dar anulăm preventiv orice plată PENDING asociată.
           */
          const cancelledPayments =
            await transaction.payment.updateMany({
              where: {
                reservationId: {
                  in: reservationIds,
                },

                status: PaymentStatus.PENDING,
              },

              data: {
                status: PaymentStatus.CANCELLED,
                cancelledAt: now,
                failureReason:
                  'Rezervarea a expirat înainte de aprobarea administratorului.',
              },
            });

          const expiredResult =
            await transaction.reservation.updateMany({
              where: {
                id: {
                  in: reservationIds,
                },

                status:
                  ReservationStatus.PENDING_APPROVAL,

                approvalExpiresAt: {
                  not: null,
                  lte: now,
                },
              },

              data: {
                status: ReservationStatus.EXPIRED,
                approvalExpiresAt: null,
                paymentExpiresAt: null,
              },
            });

          return {
            expiredCount: expiredResult.count,
            cancelledPayments:
              cancelledPayments.count,
          };
        },
        {
          isolationLevel:
            Prisma.TransactionIsolationLevel.Serializable,
        },
      );
    } catch (error: unknown) {
      this.handleTransactionError(
        error,
        'expirarea rezervărilor neaprobate',
      );

      throw error;
    }
  }

  /**
   * APPROVED_AWAITING_PAYMENT -> EXPIRED
   *
   * Se aplică rezervărilor aprobate pentru care clientul nu a
   * achitat avansul sau suma integrală în 24 de ore.
   */
  private async expireAwaitingPaymentReservations(
    now: Date,
  ): Promise<{
    expiredCount: number;
    cancelledPayments: number;
  }> {
    try {
      return await this.prisma.$transaction(
        async (transaction) => {
          const expiredReservations =
            await transaction.reservation.findMany({
              where: {
                status:
                  ReservationStatus.APPROVED_AWAITING_PAYMENT,

                paymentExpiresAt: {
                  not: null,
                  lte: now,
                },
              },

              select: {
                id: true,
              },
            });

          if (expiredReservations.length === 0) {
            return {
              expiredCount: 0,
              cancelledPayments: 0,
            };
          }

          const reservationIds =
            expiredReservations.map(
              (reservation) => reservation.id,
            );

          const cancelledPayments =
            await transaction.payment.updateMany({
              where: {
                reservationId: {
                  in: reservationIds,
                },

                reservationChangeId: null,

                status: PaymentStatus.PENDING,
              },

              data: {
                status: PaymentStatus.CANCELLED,
                cancelledAt: now,
                failureReason:
                  'Termenul pentru plata rezervării a expirat.',
              },
            });

          const expiredResult =
            await transaction.reservation.updateMany({
              where: {
                id: {
                  in: reservationIds,
                },

                status:
                  ReservationStatus.APPROVED_AWAITING_PAYMENT,

                paymentExpiresAt: {
                  not: null,
                  lte: now,
                },
              },

              data: {
                status: ReservationStatus.EXPIRED,
                approvalExpiresAt: null,
                paymentExpiresAt: null,
              },
            });

          return {
            expiredCount: expiredResult.count,
            cancelledPayments:
              cancelledPayments.count,
          };
        },
        {
          isolationLevel:
            Prisma.TransactionIsolationLevel.Serializable,
        },
      );
    } catch (error: unknown) {
      this.handleTransactionError(
        error,
        'expirarea rezervărilor neplătite',
      );

      throw error;
    }
  }

  /**
   * ReservationChange:
   * PENDING_APPROVAL -> EXPIRED
   */
  private async expirePendingApprovalChanges(
    now: Date,
  ): Promise<{
    expiredCount: number;
    cancelledPayments: number;
  }> {
    try {
      return await this.prisma.$transaction(
        async (transaction) => {
          const expiredChanges =
            await transaction.reservationChange.findMany({
              where: {
                status:
                  ReservationChangeStatus.PENDING_APPROVAL,

                approvalExpiresAt: {
                  not: null,
                  lte: now,
                },
              },

              select: {
                id: true,
              },
            });

          if (expiredChanges.length === 0) {
            return {
              expiredCount: 0,
              cancelledPayments: 0,
            };
          }

          const changeIds = expiredChanges.map(
            (change) => change.id,
          );

          /**
           * Nu ar trebui să existe checkout înainte de aprobare,
           * dar păstrăm această operație pentru consistență.
           */
          const cancelledPayments =
            await transaction.payment.updateMany({
              where: {
                reservationChangeId: {
                  in: changeIds,
                },

                status: PaymentStatus.PENDING,
              },

              data: {
                status: PaymentStatus.CANCELLED,
                cancelledAt: now,
                failureReason:
                  'Solicitarea de modificare a expirat înainte de aprobare.',
              },
            });

          const expiredResult =
            await transaction.reservationChange.updateMany({
              where: {
                id: {
                  in: changeIds,
                },

                status:
                  ReservationChangeStatus.PENDING_APPROVAL,

                approvalExpiresAt: {
                  not: null,
                  lte: now,
                },
              },

              data: {
                status:
                  ReservationChangeStatus.EXPIRED,

                expiredAt: now,
                approvalExpiresAt: null,
                paymentExpiresAt: null,
              },
            });

          return {
            expiredCount: expiredResult.count,
            cancelledPayments:
              cancelledPayments.count,
          };
        },
        {
          isolationLevel:
            Prisma.TransactionIsolationLevel.Serializable,
        },
      );
    } catch (error: unknown) {
      this.handleTransactionError(
        error,
        'expirarea solicitărilor de modificare neaprobate',
      );

      throw error;
    }
  }

  /**
   * ReservationChange:
   * APPROVED_AWAITING_PAYMENT -> EXPIRED
   *
   * Rezervarea originală rămâne CONFIRMED și neschimbată.
   */
  private async expireAwaitingPaymentChanges(
    now: Date,
  ): Promise<{
    expiredCount: number;
    cancelledPayments: number;
  }> {
    try {
      return await this.prisma.$transaction(
        async (transaction) => {
          const expiredChanges =
            await transaction.reservationChange.findMany({
              where: {
                status:
                  ReservationChangeStatus.APPROVED_AWAITING_PAYMENT,

                paymentExpiresAt: {
                  not: null,
                  lte: now,
                },
              },

              select: {
                id: true,
              },
            });

          if (expiredChanges.length === 0) {
            return {
              expiredCount: 0,
              cancelledPayments: 0,
            };
          }

          const changeIds = expiredChanges.map(
            (change) => change.id,
          );

          const cancelledPayments =
            await transaction.payment.updateMany({
              where: {
                reservationChangeId: {
                  in: changeIds,
                },

                status: PaymentStatus.PENDING,
              },

              data: {
                status: PaymentStatus.CANCELLED,
                cancelledAt: now,
                failureReason:
                  'Termenul pentru plata diferenței de preț a expirat.',
              },
            });

          const expiredResult =
            await transaction.reservationChange.updateMany({
              where: {
                id: {
                  in: changeIds,
                },

                status:
                  ReservationChangeStatus.APPROVED_AWAITING_PAYMENT,

                paymentExpiresAt: {
                  not: null,
                  lte: now,
                },
              },

              data: {
                status:
                  ReservationChangeStatus.EXPIRED,

                expiredAt: now,
                approvalExpiresAt: null,
                paymentExpiresAt: null,
              },
            });

          return {
            expiredCount: expiredResult.count,
            cancelledPayments:
              cancelledPayments.count,
          };
        },
        {
          isolationLevel:
            Prisma.TransactionIsolationLevel.Serializable,
        },
      );
    } catch (error: unknown) {
      this.handleTransactionError(
        error,
        'expirarea solicitărilor de modificare neplătite',
      );

      throw error;
    }
  }

  private handleTransactionError(
    error: unknown,
    operation: string,
  ): void {
    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2034'
    ) {
      this.logger.warn(
        `Conflict de tranzacție în timpul operației: ${operation}. Operația va fi reluată la următorul ciclu cron.`,
      );

      return;
    }

    this.logger.error(
      `Eroare la ${operation}.`,
      error instanceof Error
        ? error.stack
        : String(error),
    );
  }
}
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Locale,
  Prisma,
  ReservationStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ApproveReservationDto } from '../dto/approve-reservation.dto';
import { RejectReservationDto } from '../dto/reject-reservation.dto';
import { ReservationNotificationService } from './reservation-notification.service';
import { ReservationPaymentAccessService } from './reservation-payment-access.service';
import { ReservationStatusService } from './reservation-status.service';

@Injectable()
export class ReservationReviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly statusService: ReservationStatusService,
    private readonly notificationService: ReservationNotificationService,
    private readonly paymentAccessService: ReservationPaymentAccessService,
  ) {}

  async approve(
    reservationId: string,
    adminId: string,
    dto: ApproveReservationDto,
  ) {
    const now = new Date();

    await this.expireIfApprovalWindowPassed(
      reservationId,
      now,
    );

    try {
      const result = await this.prisma.$transaction(
        async (transaction) => {
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
                    room: true,
                  },
                  orderBy: {
                    id: 'asc',
                  },
                },
              },
            });

          if (!reservation) {
            throw new NotFoundException(
              'Rezervarea nu a fost găsită.',
            );
          }

          if (reservation.isComplimentary) {
            throw new ConflictException({
              code: 'COMPLIMENTARY_RESERVATION_REVIEW',
              message:
                'Rezervările gratuite trebuie create manual și confirmate direct de administrator.',
            });
          }

          const statusUpdate =
            this.statusService.buildApprovalUpdate(
              reservation.status,
              now,
            );

          if (!statusUpdate.paymentExpiresAt) {
            throw new ConflictException({
              code: 'PAYMENT_DEADLINE_NOT_CONFIGURED',
              message:
                'Termenul de plată al rezervării nu a fost configurat.',
            });
          }

          const paymentAccess =
            this.paymentAccessService.preparePaymentAccess({
              locale: reservation.locale,
              expiresAt:
                statusUpdate.paymentExpiresAt,
            });

          const updateResult =
            await transaction.reservation.updateMany({
              where: {
                id: reservationId,

                status:
                  ReservationStatus.PENDING_APPROVAL,

                OR: [
                  {
                    approvalExpiresAt: null,
                  },
                  {
                    approvalExpiresAt: {
                      gt: now,
                    },
                  },
                ],
              },

              data: {
                ...statusUpdate,

                approvedByAdminId: adminId,

                paymentAccessTokenHash:
                  paymentAccess.tokenHash,

                paymentAccessTokenExpiresAt:
                  paymentAccess.expiresAt,

                ...(dto.adminNotes !== undefined && {
                  adminNotes: dto.adminNotes.trim(),
                }),
              },
            });

          if (updateResult.count !== 1) {
            throw new ConflictException({
              code: 'RESERVATION_REVIEW_CONFLICT',
              message:
                'Rezervarea a fost modificată între timp și nu mai poate fi aprobată.',
            });
          }

          const updatedReservation =
            await transaction.reservation.findUniqueOrThrow({
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
                  orderBy: {
                    id: 'asc',
                  },
                },

                approvedByAdmin: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            });

          return {
            reservation: updatedReservation,
            paymentUrl: paymentAccess.paymentUrl,
          };
        },
        {
          isolationLevel:
            Prisma.TransactionIsolationLevel.Serializable,
        },
      );

      const reservation = result.reservation;

      if (!reservation.paymentExpiresAt) {
        throw new ConflictException({
          code: 'PAYMENT_DEADLINE_NOT_CONFIGURED',
          message:
            'Rezervarea a fost aprobată, dar termenul de plată lipsește.',
        });
      }

      const roomNames = reservation.rooms.map(
        (reservationRoom) =>
          reservation.locale === Locale.EN
            ? reservationRoom.roomType.nameEn
            : reservationRoom.roomType.nameRo,
      );

      await this.notificationService.sendReservationApproved(
        {
          reservationId: reservation.id,

          guest: {
            firstName:
              reservation.guest.firstName,
            email: reservation.guest.email,
          },

          locale: reservation.locale,

          checkInDate:
            reservation.checkInDate,

          checkOutDate:
            reservation.checkOutDate,

          nights: reservation.nights,
          adults: reservation.adults,

          roomNames,

          totalPrice:
            reservation.totalPrice.toNumber(),

          depositAmount:
            reservation.depositAmount.toNumber(),

          paymentDeadline:
            reservation.paymentExpiresAt,

          paymentUrl: result.paymentUrl,
        },
      );

      return {
        ...this.mapReviewResponse(
          reservation,
          'Rezervarea a fost aprobată. Clientul a primit linkul securizat pentru plată.',
        ),

        paymentUrl: result.paymentUrl,
      };
    } catch (error: unknown) {
      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2034'
      ) {
        throw new ConflictException({
          code: 'CONCURRENT_RESERVATION_REVIEW',
          message:
            'Rezervarea a fost modificată simultan. Reîncarcă datele și încearcă din nou.',
        });
      }

      throw error;
    }
  }

  async reject(
    reservationId: string,
    adminId: string,
    dto: RejectReservationDto,
  ) {
    const now = new Date();

    await this.expireIfApprovalWindowPassed(
      reservationId,
      now,
    );

    try {
      const reservation =
        await this.prisma.$transaction(
          async (transaction) => {
            const existingReservation =
              await transaction.reservation.findUnique({
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
                    orderBy: {
                      id: 'asc',
                    },
                  },
                },
              });

            if (!existingReservation) {
              throw new NotFoundException(
                'Rezervarea nu a fost găsită.',
              );
            }

            const statusUpdate =
              this.statusService.buildRejectionUpdate(
                existingReservation.status,
                dto.reason,
                now,
              );

            const updateResult =
              await transaction.reservation.updateMany({
                where: {
                  id: reservationId,

                  status:
                    ReservationStatus.PENDING_APPROVAL,

                  OR: [
                    {
                      approvalExpiresAt: null,
                    },
                    {
                      approvalExpiresAt: {
                        gt: now,
                      },
                    },
                  ],
                },

                data: {
                  ...statusUpdate,

                  paymentAccessTokenHash: null,
                  paymentAccessTokenExpiresAt: null,

                  adminNotes: this.buildAdminNotes(
                    dto.adminNotes,
                    adminId,
                  ),
                },
              });

            if (updateResult.count !== 1) {
              throw new ConflictException({
                code: 'RESERVATION_REVIEW_CONFLICT',
                message:
                  'Rezervarea a fost modificată între timp și nu mai poate fi respinsă.',
              });
            }

            return transaction.reservation.findUniqueOrThrow({
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
                  orderBy: {
                    id: 'asc',
                  },
                },
              },
            });
          },
          {
            isolationLevel:
              Prisma.TransactionIsolationLevel.Serializable,
          },
        );

      const roomNames = reservation.rooms.map(
        (reservationRoom) =>
          reservation.locale === Locale.EN
            ? reservationRoom.roomType.nameEn
            : reservationRoom.roomType.nameRo,
      );

      await this.notificationService.sendReservationRejected(
        {
          reservationId: reservation.id,

          guest: {
            firstName:
              reservation.guest.firstName,
            email: reservation.guest.email,
          },

          locale: reservation.locale,

          checkInDate:
            reservation.checkInDate,

          checkOutDate:
            reservation.checkOutDate,

          roomNames,

          rejectionReason:
            reservation.rejectionReason ??
            dto.reason.trim(),
        },
      );

      return this.mapReviewResponse(
        reservation,
        'Rezervarea a fost respinsă, iar clientul a fost notificat.',
      );
    } catch (error: unknown) {
      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2034'
      ) {
        throw new ConflictException({
          code: 'CONCURRENT_RESERVATION_REVIEW',
          message:
            'Rezervarea a fost modificată simultan. Reîncarcă datele și încearcă din nou.',
        });
      }

      throw error;
    }
  }

  private async expireIfApprovalWindowPassed(
    reservationId: string,
    now: Date,
  ): Promise<void> {
    const reservation =
      await this.prisma.reservation.findUnique({
        where: {
          id: reservationId,
        },

        select: {
          id: true,
          status: true,
          approvalExpiresAt: true,
        },
      });

    if (!reservation) {
      throw new NotFoundException(
        'Rezervarea nu a fost găsită.',
      );
    }

    if (
      reservation.status ===
        ReservationStatus.PENDING_APPROVAL &&
      reservation.approvalExpiresAt &&
      reservation.approvalExpiresAt <= now
    ) {
      const statusUpdate =
        this.statusService.buildExpirationUpdate(
          reservation.status,
        );

      await this.prisma.reservation.updateMany({
        where: {
          id: reservationId,
          status:
            ReservationStatus.PENDING_APPROVAL,
        },

        data: {
          ...statusUpdate,

          paymentAccessTokenHash: null,
          paymentAccessTokenExpiresAt: null,
        },
      });

      throw new ConflictException({
        code: 'RESERVATION_APPROVAL_EXPIRED',
        message:
          'Termenul de 24 de ore pentru aprobarea rezervării a expirat.',
      });
    }
  }

  private buildAdminNotes(
    notes: string | undefined,
    adminId: string,
  ): string {
    const rejectionAuditNote =
      `Rezervare respinsă de administratorul ${adminId}.`;

    if (!notes?.trim()) {
      return rejectionAuditNote;
    }

    return `${notes.trim()}\n${rejectionAuditNote}`;
  }

  private mapReviewResponse(
    reservation: {
      id: string;
      status: ReservationStatus;

      approvedAt: Date | null;
      rejectedAt: Date | null;

      approvalExpiresAt: Date | null;
      paymentExpiresAt: Date | null;

      paymentAccessTokenExpiresAt:
        Date | null;

      rejectionReason: string | null;
      adminNotes: string | null;

      guest: {
        firstName: string;
        lastName: string;
        email: string;
      };

      rooms: Array<{
        id: string;
        roomTypeId: string;
        roomId: string | null;

        roomType: {
          id: string;
          nameRo: string;
          nameEn: string;
        };

        room: {
          id: string;
          code: string;
          name: string;
        } | null;
      }>;

      approvedByAdmin?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
      } | null;
    },
    message: string,
  ) {
    return {
      id: reservation.id,
      status: reservation.status,

      guest: {
        firstName:
          reservation.guest.firstName,

        lastName:
          reservation.guest.lastName,

        email: reservation.guest.email,
      },

      rooms: reservation.rooms.map((room) => ({
        reservationRoomId: room.id,
        roomTypeId: room.roomTypeId,

        roomTypeNameRo:
          room.roomType.nameRo,

        roomTypeNameEn:
          room.roomType.nameEn,

        allocatedRoom: room.room
          ? {
              id: room.room.id,
              code: room.room.code,
              name: room.room.name,
            }
          : null,
      })),

      approvedByAdmin:
        reservation.approvedByAdmin ?? null,

      approvedAt:
        reservation.approvedAt?.toISOString() ??
        null,

      rejectedAt:
        reservation.rejectedAt?.toISOString() ??
        null,

      approvalExpiresAt:
        reservation.approvalExpiresAt?.toISOString() ??
        null,

      paymentExpiresAt:
        reservation.paymentExpiresAt?.toISOString() ??
        null,

      paymentAccessTokenExpiresAt:
        reservation.paymentAccessTokenExpiresAt?.toISOString() ??
        null,

      rejectionReason:
        reservation.rejectionReason,

      adminNotes: reservation.adminNotes,

      message,
    };
  }
}
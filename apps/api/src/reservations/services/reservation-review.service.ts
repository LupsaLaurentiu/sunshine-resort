import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  ReservationStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ApproveReservationDto } from '../dto/approve-reservation.dto';
import { RejectReservationDto } from '../dto/reject-reservation.dto';
import { ReservationStatusService } from './reservation-status.service';

@Injectable()
export class ReservationReviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly statusService: ReservationStatusService,
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
      return await this.prisma.$transaction(
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
                },
              },
            });

          if (!reservation) {
            throw new NotFoundException(
              'Rezervarea nu a fost găsită.',
            );
          }

          const statusUpdate =
            this.statusService.buildApprovalUpdate(
              reservation.status,
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
                approvedByAdminId: adminId,

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

          return this.mapReviewResponse(
            updatedReservation,
            'Rezervarea a fost aprobată și așteaptă plata clientului.',
          );
        },
        {
          isolationLevel:
            Prisma.TransactionIsolationLevel.Serializable,
        },
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
      return await this.prisma.$transaction(
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
                },
              },
            });

          if (!reservation) {
            throw new NotFoundException(
              'Rezervarea nu a fost găsită.',
            );
          }

          const statusUpdate =
            this.statusService.buildRejectionUpdate(
              reservation.status,
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

                /*
                 * Schema nu are încă rejectedByAdminId.
                 * Păstrăm administratorul în adminNotes până la
                 * introducerea unui AuditLog.
                 */
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
                },
              },
            });

          return this.mapReviewResponse(
            updatedReservation,
            'Rezervarea a fost respinsă.',
          );
        },
        {
          isolationLevel:
            Prisma.TransactionIsolationLevel.Serializable,
        },
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
        data: statusUpdate,
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
        firstName: reservation.guest.firstName,
        lastName: reservation.guest.lastName,
        email: reservation.guest.email,
      },

      rooms: reservation.rooms.map((room) => ({
        reservationRoomId: room.id,
        roomTypeId: room.roomTypeId,
        roomTypeNameRo: room.roomType.nameRo,
        roomTypeNameEn: room.roomType.nameEn,

        /*
         * Va rămâne null până când plata este confirmată.
         */
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

      rejectionReason:
        reservation.rejectionReason,

      adminNotes: reservation.adminNotes,

      message,
    };
  }
}
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
import { ReservationStatusService } from './reservation-status.service';

@Injectable()
export class ReservationCheckInService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly statusService: ReservationStatusService,
  ) {}

  async checkIn(reservationId: string, adminId: string) {
    const now = new Date();
    const today = this.getTodayInRomania();

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
            });

          if (!reservation) {
            throw new NotFoundException(
              'Rezervarea nu a fost găsită.',
            );
          }

          if (
            reservation.status !==
            ReservationStatus.CONFIRMED
          ) {
            throw new ConflictException({
              code: 'RESERVATION_CHECK_IN_NOT_ALLOWED',
              message:
                'Check-in-ul este permis doar pentru rezervările confirmate.',
              currentStatus: reservation.status,
            });
          }

          if (today < reservation.checkInDate) {
            throw new ConflictException({
              code: 'CHECK_IN_TOO_EARLY',
              message:
                'Check-in-ul nu poate fi efectuat înainte de data rezervată.',
              checkInDate: this.formatDate(
                reservation.checkInDate,
              ),
              currentDate: this.formatDate(today),
            });
          }

          if (today >= reservation.checkOutDate) {
            throw new ConflictException({
              code: 'CHECK_IN_PERIOD_ENDED',
              message:
                'Perioada rezervării s-a încheiat și check-in-ul nu mai poate fi efectuat.',
              checkOutDate: this.formatDate(
                reservation.checkOutDate,
              ),
              currentDate: this.formatDate(today),
            });
          }

          if (reservation.rooms.length === 0) {
            throw new ConflictException({
              code: 'RESERVATION_HAS_NO_ROOMS',
              message:
                'Rezervarea nu conține apartamente.',
            });
          }

          const unallocatedRooms =
            reservation.rooms.filter(
              (reservationRoom) =>
                reservationRoom.roomId === null ||
                reservationRoom.room === null,
            );

          if (unallocatedRooms.length > 0) {
            throw new ConflictException({
              code: 'RESERVATION_ROOMS_NOT_ALLOCATED',
              message:
                'Toate apartamentele trebuie alocate înainte de check-in.',
              unallocatedReservationRoomIds:
                unallocatedRooms.map(
                  (reservationRoom) =>
                    reservationRoom.id,
                ),
            });
          }

          const inactiveRooms =
            reservation.rooms.filter(
              (reservationRoom) =>
                !reservationRoom.room?.isActive,
            );

          if (inactiveRooms.length > 0) {
            throw new ConflictException({
              code: 'ALLOCATED_ROOM_INACTIVE',
              message:
                'Unul dintre apartamentele alocate este inactiv.',
              roomIds: inactiveRooms
                .map(
                  (reservationRoom) =>
                    reservationRoom.roomId,
                )
                .filter(
                  (roomId): roomId is string =>
                    roomId !== null,
                ),
            });
          }

          const statusUpdate =
            this.statusService.buildCheckInUpdate(
              reservation.status,
              now,
            );

          const updateResult =
            await transaction.reservation.updateMany({
              where: {
                id: reservation.id,
                status: ReservationStatus.CONFIRMED,
              },
              data: {
                ...statusUpdate,
                adminNotes: this.appendAdminNote(
                  reservation.adminNotes,
                  `Check-in efectuat de administratorul ${adminId} la ${now.toISOString()}.`,
                ),
              },
            });

          if (updateResult.count !== 1) {
            throw new ConflictException({
              code: 'RESERVATION_CHECK_IN_CONFLICT',
              message:
                'Rezervarea a fost modificată simultan și nu mai poate fi trecută în check-in.',
            });
          }

          const updatedReservation =
            await transaction.reservation.findUniqueOrThrow({
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
              },
            });

          return this.mapStayResponse(
            updatedReservation,
            'Check-in-ul a fost efectuat cu succes.',
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
          code: 'CONCURRENT_CHECK_IN_CONFLICT',
          message:
            'Check-in-ul a intrat în conflict cu o altă operațiune. Reîncarcă rezervarea și încearcă din nou.',
        });
      }

      throw error;
    }
  }

  async checkOut(reservationId: string, adminId: string) {
    const now = new Date();
    const today = this.getTodayInRomania();

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

          if (
            reservation.status !==
            ReservationStatus.CHECKED_IN
          ) {
            throw new ConflictException({
              code: 'RESERVATION_CHECK_OUT_NOT_ALLOWED',
              message:
                'Check-out-ul este permis doar pentru rezervările aflate în check-in.',
              currentStatus: reservation.status,
            });
          }

          if (today < reservation.checkOutDate) {
            throw new ConflictException({
              code: 'CHECK_OUT_TOO_EARLY',
              message:
                'Check-out-ul nu poate fi efectuat înainte de data stabilită.',
              checkOutDate: this.formatDate(
                reservation.checkOutDate,
              ),
              currentDate: this.formatDate(today),
            });
          }

          const statusUpdate =
            this.statusService.buildCheckOutUpdate(
              reservation.status,
              now,
            );

          const updateResult =
            await transaction.reservation.updateMany({
              where: {
                id: reservation.id,
                status: ReservationStatus.CHECKED_IN,
              },
              data: {
                ...statusUpdate,
                adminNotes: this.appendAdminNote(
                  reservation.adminNotes,
                  `Check-out efectuat de administratorul ${adminId} la ${now.toISOString()}.`,
                ),
              },
            });

          if (updateResult.count !== 1) {
            throw new ConflictException({
              code: 'RESERVATION_CHECK_OUT_CONFLICT',
              message:
                'Rezervarea a fost modificată simultan și nu mai poate fi trecută în check-out.',
            });
          }

          /*
           * Nu eliminăm roomId.
           *
           * Alocarea rămâne salvată pentru istoric, iar apartamentul
           * devine disponibil deoarece CHECKED_OUT nu este un status
           * care blochează inventarul.
           */

          const updatedReservation =
            await transaction.reservation.findUniqueOrThrow({
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
              },
            });

          return this.mapStayResponse(
            updatedReservation,
            'Check-out-ul a fost efectuat cu succes.',
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
          code: 'CONCURRENT_CHECK_OUT_CONFLICT',
          message:
            'Check-out-ul a intrat în conflict cu o altă operațiune. Reîncarcă rezervarea și încearcă din nou.',
        });
      }

      throw error;
    }
  }

  private mapStayResponse(
    reservation: {
      id: string;
      status: ReservationStatus;
      checkInDate: Date;
      checkOutDate: Date;
      checkInTime: string;
      checkOutTime: string;
      checkedInAt: Date | null;
      checkedOutAt: Date | null;

      guest: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
      };

      rooms: Array<{
        id: string;
        roomType: {
          id: string;
          nameRo: string;
          nameEn: string;
        };
        room: {
          id: string;
          name: string;
          code: string;
          tvDeviceId: string | null;
        } | null;
      }>;
    },
    message: string,
  ) {
    return {
      id: reservation.id,
      status: reservation.status,

      checkIn: this.formatDate(
        reservation.checkInDate,
      ),
      checkOut: this.formatDate(
        reservation.checkOutDate,
      ),

      checkInTime: reservation.checkInTime,
      checkOutTime: reservation.checkOutTime,

      checkedInAt:
        reservation.checkedInAt?.toISOString() ??
        null,

      checkedOutAt:
        reservation.checkedOutAt?.toISOString() ??
        null,

      guest: {
        id: reservation.guest.id,
        firstName: reservation.guest.firstName,
        lastName: reservation.guest.lastName,
        email: reservation.guest.email,
        phone: reservation.guest.phone,
      },

      rooms: reservation.rooms.map(
        (reservationRoom) => ({
          reservationRoomId:
            reservationRoom.id,

          roomType: {
            id: reservationRoom.roomType.id,
            nameRo:
              reservationRoom.roomType.nameRo,
            nameEn:
              reservationRoom.roomType.nameEn,
          },

          allocatedRoom: reservationRoom.room
            ? {
                id: reservationRoom.room.id,
                name: reservationRoom.room.name,
                code: reservationRoom.room.code,
                tvDeviceId:
                  reservationRoom.room.tvDeviceId,
              }
            : null,
        }),
      ),

      tvWelcomeActive:
        reservation.status ===
        ReservationStatus.CHECKED_IN,

      roomsReleased:
        reservation.status ===
        ReservationStatus.CHECKED_OUT,

      message,
    };
  }

  private appendAdminNote(
    existingNotes: string | null,
    newEntry: string,
  ): string {
    if (!existingNotes?.trim()) {
      return newEntry;
    }

    return `${existingNotes.trim()}\n${newEntry}`;
  }

  private getTodayInRomania(): Date {
    const dateString = new Intl.DateTimeFormat(
      'en-CA',
      {
        timeZone: 'Europe/Bucharest',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      },
    ).format(new Date());

    return new Date(
      `${dateString}T00:00:00.000Z`,
    );
  }

  private formatDate(value: Date): string {
    return value.toISOString().slice(0, 10);
  }
}
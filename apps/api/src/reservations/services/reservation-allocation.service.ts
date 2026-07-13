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

const ALLOCATION_ALLOWED_STATUSES: ReservationStatus[] = [
  ReservationStatus.APPROVED_AWAITING_PAYMENT,
  ReservationStatus.CONFIRMED,
];

const PHYSICAL_ROOM_BLOCKING_STATUSES: ReservationStatus[] = [
  ReservationStatus.APPROVED_AWAITING_PAYMENT,
  ReservationStatus.CONFIRMED,
  ReservationStatus.CHECKED_IN,
];

export type AllocatedReservationRoom = {
  reservationRoomId: string;
  roomTypeId: string;
  roomId: string;
  roomCode: string;
  roomName: string;
};

export type ReservationAllocationResult = {
  reservationId: string;
  allocatedRooms: AllocatedReservationRoom[];
};

@Injectable()
export class ReservationAllocationService {
  constructor(private readonly prisma: PrismaService) {}

  async allocateRooms(
    reservationId: string,
  ): Promise<ReservationAllocationResult> {
    return this.prisma.$transaction(
      async (transaction) =>
        this.allocateRoomsInTransaction(
          transaction,
          reservationId,
        ),
      {
        isolationLevel:
          Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  }

  async allocateRoomsInTransaction(
    transaction: Prisma.TransactionClient,
    reservationId: string,
  ): Promise<ReservationAllocationResult> {
    const reservation =
      await transaction.reservation.findUnique({
        where: {
          id: reservationId,
        },
        include: {
          rooms: {
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
      !ALLOCATION_ALLOWED_STATUSES.includes(
        reservation.status,
      )
    ) {
      throw new ConflictException({
        code: 'ROOM_ALLOCATION_NOT_ALLOWED',
        message:
          'Apartamentele nu pot fi alocate în statusul actual al rezervării.',
        currentStatus: reservation.status,
      });
    }

    if (reservation.rooms.length === 0) {
      throw new ConflictException({
        code: 'RESERVATION_HAS_NO_ROOMS',
        message:
          'Rezervarea nu conține apartamente care pot fi alocate.',
      });
    }

    const existingAssignments =
      reservation.rooms.filter(
        (
          reservationRoom,
        ): reservationRoom is typeof reservationRoom & {
          roomId: string;
        } => reservationRoom.roomId !== null,
      );

    const pendingAssignments =
      reservation.rooms.filter(
        (reservationRoom) =>
          reservationRoom.roomId === null,
      );

    /*
     * Idempotency:
     * dacă toate camerele sunt deja alocate, returnăm rezultatul existent.
     */
    if (pendingAssignments.length === 0) {
      return this.buildExistingAllocationResult(
        transaction,
        reservationId,
        existingAssignments,
      );
    }

    const alreadyAllocatedRoomIds = new Set(
      existingAssignments.map(
        (reservationRoom) => reservationRoom.roomId,
      ),
    );

    const pendingByRoomType = new Map<
      string,
      typeof pendingAssignments
    >();

    for (const reservationRoom of pendingAssignments) {
      const current =
        pendingByRoomType.get(
          reservationRoom.roomTypeId,
        ) ?? [];

      current.push(reservationRoom);

      pendingByRoomType.set(
        reservationRoom.roomTypeId,
        current,
      );
    }

    const newlyAllocatedRooms: AllocatedReservationRoom[] =
      [];

    for (const [
      roomTypeId,
      reservationRooms,
    ] of pendingByRoomType.entries()) {
      const availableRooms =
        await transaction.room.findMany({
          where: {
            roomTypeId,
            isActive: true,

            ...(alreadyAllocatedRoomIds.size > 0 && {
              id: {
                notIn: Array.from(
                  alreadyAllocatedRoomIds,
                ),
              },
            }),

            reservationRooms: {
              none: {
                reservationId: {
                  not: reservationId,
                },
                reservation: {
                  status: {
                    in: PHYSICAL_ROOM_BLOCKING_STATUSES,
                  },
                  checkInDate: {
                    lt: reservation.checkOutDate,
                  },
                  checkOutDate: {
                    gt: reservation.checkInDate,
                  },
                },
              },
            },

            blockedPeriods: {
              none: {
                startDate: {
                  lt: reservation.checkOutDate,
                },
                endDate: {
                  gt: reservation.checkInDate,
                },
              },
            },

            externalCalendars: {
              none: {
                isActive: true,
                events: {
                  some: {
                    cancelledAt: null,
                    startDate: {
                      lt: reservation.checkOutDate,
                    },
                    endDate: {
                      gt: reservation.checkInDate,
                    },
                  },
                },
              },
            },
          },
          orderBy: {
            code: 'asc',
          },
          take: reservationRooms.length,
        });

      if (
        availableRooms.length <
        reservationRooms.length
      ) {
        throw new ConflictException({
          code: 'ROOM_ALLOCATION_FAILED',
          message:
            'Nu mai există suficiente apartamente concrete disponibile pentru finalizarea rezervării.',
          roomTypeId,
          requiredUnits: reservationRooms.length,
          availableUnits: availableRooms.length,
        });
      }

      for (
        let index = 0;
        index < reservationRooms.length;
        index += 1
      ) {
        const reservationRoom =
          reservationRooms[index];
        const physicalRoom = availableRooms[index];

        if (!reservationRoom || !physicalRoom) {
          throw new ConflictException({
            code: 'ROOM_ALLOCATION_FAILED',
            message:
              'Alocarea apartamentelor nu a putut fi finalizată.',
          });
        }

        await transaction.reservationRoom.update({
          where: {
            id: reservationRoom.id,
          },
          data: {
            roomId: physicalRoom.id,
          },
        });

        alreadyAllocatedRoomIds.add(
          physicalRoom.id,
        );

        newlyAllocatedRooms.push({
          reservationRoomId: reservationRoom.id,
          roomTypeId,
          roomId: physicalRoom.id,
          roomCode: physicalRoom.code,
          roomName: physicalRoom.name,
        });
      }
    }

    const existingAllocationResult =
      await this.buildExistingAllocationResult(
        transaction,
        reservationId,
        existingAssignments,
      );

    return {
      reservationId,
      allocatedRooms: [
        ...existingAllocationResult.allocatedRooms,
        ...newlyAllocatedRooms,
      ],
    };
  }

  private async buildExistingAllocationResult(
    transaction: Prisma.TransactionClient,
    reservationId: string,
    assignments: Array<{
      id: string;
      roomTypeId: string;
      roomId: string;
    }>,
  ): Promise<ReservationAllocationResult> {
    if (assignments.length === 0) {
      return {
        reservationId,
        allocatedRooms: [],
      };
    }

    const rooms = await transaction.room.findMany({
      where: {
        id: {
          in: assignments.map(
            (assignment) => assignment.roomId,
          ),
        },
      },
    });

    const roomsById = new Map(
      rooms.map((room) => [room.id, room]),
    );

    return {
      reservationId,
      allocatedRooms: assignments.map(
        (assignment) => {
          const room = roomsById.get(
            assignment.roomId,
          );

          if (!room) {
            throw new ConflictException({
              code: 'ALLOCATED_ROOM_NOT_FOUND',
              message:
                'Un apartament alocat rezervării nu mai există.',
              roomId: assignment.roomId,
            });
          }

          return {
            reservationRoomId: assignment.id,
            roomTypeId: assignment.roomTypeId,
            roomId: room.id,
            roomCode: room.code,
            roomName: room.name,
          };
        },
      ),
    };
  }
}
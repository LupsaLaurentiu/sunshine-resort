import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  ReservationStatus,
} from '@prisma/client';
import type { Room } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

const ALLOCATION_ALLOWED_STATUSES: ReservationStatus[] = [
  ReservationStatus.APPROVED_AWAITING_PAYMENT,
  ReservationStatus.CONFIRMED,
];

const PREDICTION_ALLOWED_STATUSES: ReservationStatus[] = [
  ReservationStatus.PENDING_APPROVAL,
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
  hasExtraAdult: boolean;
  allowsExtraAdult: boolean;
};

export type ReservationAllocationResult = {
  reservationId: string;
  allocatedRooms: AllocatedReservationRoom[];
};

export type FindAvailableRoomsParams = {
  reservationId: string;
  roomTypeId: string;

  checkInDate: Date;
  checkOutDate: Date;

  quantity: number;

  /**
   * Camere care trebuie excluse suplimentar.
   *
   * CalendarService poate folosi acest câmp pentru a evita
   * suprapunerea între placeholder-ele calculate în memorie.
   */
  excludedRoomIds?: Iterable<string>;
};

type ReservationWithRooms = Prisma.ReservationGetPayload<{
  include: {
    rooms: {
      orderBy: {
        id: 'asc';
      };
    };
  };
}>;

type AssignedReservationRoom =
  ReservationWithRooms['rooms'][number] & {
    roomId: string;
  };

@Injectable()
export class ReservationAllocationService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

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
      await this.getReservationWithRooms(
        transaction,
        reservationId,
      );

    this.validateReservationForAllocation(
      reservation,
    );

    const existingAssignments =
      this.getExistingAssignments(
        reservation,
      );

    const pendingAssignments =
      reservation.rooms.filter(
        (reservationRoom) =>
          reservationRoom.roomId === null,
      );

    /*
     * Idempotency:
     * dacă toate camerele sunt deja alocate,
     * întoarcem alocările existente.
     */
    if (pendingAssignments.length === 0) {
      return this.buildExistingAllocationResult(
        transaction,
        reservationId,
        existingAssignments,
      );
    }

    const excludedRoomIds = new Set(
      existingAssignments.map(
        (reservationRoom) =>
          reservationRoom.roomId,
      ),
    );

    const pendingByRoomType =
      this.groupPendingAssignmentsByRoomType(
        pendingAssignments,
      );

    const newlyAllocatedRooms:
      AllocatedReservationRoom[] = [];

    for (const [
      roomTypeId,
      reservationRooms,
    ] of pendingByRoomType.entries()) {
      const availableRooms =
        await this.findAvailableRoomsForPeriodInTransaction(
          transaction,
          {
            reservationId,
            roomTypeId,

            checkInDate:
              reservation.checkInDate,

            checkOutDate:
              reservation.checkOutDate,

            quantity:
              reservationRooms.length,

            excludedRoomIds,
          },
        );

      this.ensureEnoughRoomsAvailable({
        roomTypeId,
        requiredUnits:
          reservationRooms.length,
        availableUnits:
          availableRooms.length,
      });

      const allocationPairs =
        this.buildAllocationPairs(
          roomTypeId,
          reservationRooms,
          availableRooms,
        );

      for (const {
        reservationRoom,
        physicalRoom,
      } of allocationPairs) {
        await transaction.reservationRoom.update({
          where: {
            id: reservationRoom.id,
          },

          data: {
            roomId:
              physicalRoom.id,
          },
        });

        excludedRoomIds.add(
          physicalRoom.id,
        );

        newlyAllocatedRooms.push(
          this.mapAllocatedRoom(
            reservationRoom.id,
            roomTypeId,
            reservationRoom.hasExtraAdult,
            physicalRoom,
          ),
        );
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

  /**
   * Calculează camerele care ar fi alocate,
   * fără să modifice ReservationRoom.
   *
   * Este folosită de CalendarService pentru
   * afișarea placeholder-elor PENDING_APPROVAL și
   * APPROVED_AWAITING_PAYMENT.
   */
  async predictRoomsInTransaction(
    transaction: Prisma.TransactionClient,
    reservationId: string,
    excludedRoomIds: Iterable<string> = [],
  ): Promise<ReservationAllocationResult> {
    const reservation =
      await this.getReservationWithRooms(
        transaction,
        reservationId,
      );

    this.validateReservationForPrediction(
      reservation,
    );

    const existingAssignments =
      this.getExistingAssignments(
        reservation,
      );

    const pendingAssignments =
      reservation.rooms.filter(
        (reservationRoom) =>
          reservationRoom.roomId === null,
      );

    if (pendingAssignments.length === 0) {
      return this.buildExistingAllocationResult(
        transaction,
        reservationId,
        existingAssignments,
      );
    }

    const locallyExcludedRoomIds =
      new Set<string>(excludedRoomIds);

    for (const assignment of existingAssignments) {
      locallyExcludedRoomIds.add(
        assignment.roomId,
      );
    }

    const pendingByRoomType =
      this.groupPendingAssignmentsByRoomType(
        pendingAssignments,
      );

    const predictedRooms:
      AllocatedReservationRoom[] = [];

    for (const [
      roomTypeId,
      reservationRooms,
    ] of pendingByRoomType.entries()) {
      const availableRooms =
        await this.findAvailableRoomsForPeriodInTransaction(
          transaction,
          {
            reservationId,
            roomTypeId,

            checkInDate:
              reservation.checkInDate,

            checkOutDate:
              reservation.checkOutDate,

            quantity:
              reservationRooms.length,

            excludedRoomIds:
              locallyExcludedRoomIds,
          },
        );

      /*
       * Pentru calendar nu aruncăm eroare când nu pot fi
       * poziționate toate unitățile. Construim doar perechile
       * compatibile, respectând însă obligatoriu regula
       * adultului suplimentar.
       */
      const allocationPairs =
        this.buildPredictionPairs(
          reservationRooms,
          availableRooms,
        );

      for (const {
        reservationRoom,
        physicalRoom,
      } of allocationPairs) {
        locallyExcludedRoomIds.add(
          physicalRoom.id,
        );

        predictedRooms.push(
          this.mapAllocatedRoom(
            reservationRoom.id,
            roomTypeId,
            reservationRoom.hasExtraAdult,
            physicalRoom,
          ),
        );
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
        ...predictedRooms,
      ],
    };
  }

  /**
   * Singura metodă care conține regula efectivă
   * de selecție a camerelor.
   *
   * Este reutilizată atât de alocarea reală,
   * cât și de predicția pentru calendar.
   */
  async findAvailableRoomsForPeriodInTransaction(
    transaction: Prisma.TransactionClient,
    params: FindAvailableRoomsParams,
  ): Promise<Room[]> {
    if (params.quantity <= 0) {
      return [];
    }

    const excludedRoomIds = Array.from(
      new Set(
        params.excludedRoomIds ?? [],
      ),
    );

    return transaction.room.findMany({
      where: {
        roomTypeId:
          params.roomTypeId,

        isActive: true,

        ...(excludedRoomIds.length > 0 && {
          id: {
            notIn:
              excludedRoomIds,
          },
        }),

        reservationRooms: {
          none: {
            reservationId: {
              not:
                params.reservationId,
            },

            reservation: {
              status: {
                in:
                  PHYSICAL_ROOM_BLOCKING_STATUSES,
              },

              checkInDate: {
                lt:
                  params.checkOutDate,
              },

              checkOutDate: {
                gt:
                  params.checkInDate,
              },
            },
          },
        },

        blockedPeriods: {
          none: {
            startDate: {
              lt:
                params.checkOutDate,
            },

            endDate: {
              gt:
                params.checkInDate,
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
                  lt:
                    params.checkOutDate,
                },

                endDate: {
                  gt:
                    params.checkInDate,
                },
              },
            },
          },
        },
      },

      orderBy: [
        {
          allowsExtraAdult: 'asc',
        },
        {
          code: 'asc',
        },
      ],
    });
  }

  private async getReservationWithRooms(
    transaction: Prisma.TransactionClient,
    reservationId: string,
  ): Promise<ReservationWithRooms> {
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

    return reservation;
  }

  private validateReservationForAllocation(
    reservation: ReservationWithRooms,
  ): void {
    if (
      !ALLOCATION_ALLOWED_STATUSES.includes(
        reservation.status,
      )
    ) {
      throw new ConflictException({
        code: 'ROOM_ALLOCATION_NOT_ALLOWED',

        message:
          'Apartamentele nu pot fi alocate în statusul actual al rezervării.',

        currentStatus:
          reservation.status,
      });
    }

    this.ensureReservationHasRooms(
      reservation,
    );
  }

  private validateReservationForPrediction(
    reservation: ReservationWithRooms,
  ): void {
    if (
      !PREDICTION_ALLOWED_STATUSES.includes(
        reservation.status,
      )
    ) {
      throw new ConflictException({
        code:
          'ROOM_ALLOCATION_PREDICTION_NOT_ALLOWED',

        message:
          'Alocarea estimată nu poate fi calculată în statusul actual al rezervării.',

        currentStatus:
          reservation.status,
      });
    }

    this.ensureReservationHasRooms(
      reservation,
    );
  }

  private ensureReservationHasRooms(
    reservation: ReservationWithRooms,
  ): void {
    if (
      reservation.rooms.length === 0
    ) {
      throw new ConflictException({
        code:
          'RESERVATION_HAS_NO_ROOMS',

        message:
          'Rezervarea nu conține apartamente care pot fi alocate.',
      });
    }
  }

  private getExistingAssignments(
    reservation: ReservationWithRooms,
  ): AssignedReservationRoom[] {
    return reservation.rooms.filter(
      (
        reservationRoom,
      ): reservationRoom is AssignedReservationRoom =>
        reservationRoom.roomId !== null,
    );
  }

  private groupPendingAssignmentsByRoomType(
    pendingAssignments:
      ReservationWithRooms['rooms'],
  ): Map<
    string,
    ReservationWithRooms['rooms']
  > {
    const pendingByRoomType = new Map<
      string,
      ReservationWithRooms['rooms']
    >();

    for (const reservationRoom of pendingAssignments) {
      const current =
        pendingByRoomType.get(
          reservationRoom.roomTypeId,
        ) ?? [];

      current.push(
        reservationRoom,
      );

      pendingByRoomType.set(
        reservationRoom.roomTypeId,
        current,
      );
    }

    return pendingByRoomType;
  }

  private buildAllocationPairs(
    roomTypeId: string,
    reservationRooms:
      ReservationWithRooms['rooms'],
    availableRooms: Room[],
  ): Array<{
    reservationRoom:
      ReservationWithRooms['rooms'][number];
    physicalRoom: Room;
  }> {
    const extraAdultReservationRooms =
      reservationRooms.filter(
        (reservationRoom) =>
          reservationRoom.hasExtraAdult,
      );

    const standardReservationRooms =
      reservationRooms.filter(
        (reservationRoom) =>
          !reservationRoom.hasExtraAdult,
      );

    const extraAdultPhysicalRooms =
      availableRooms.filter(
        (room) =>
          room.allowsExtraAdult,
      );

    if (
      extraAdultPhysicalRooms.length <
      extraAdultReservationRooms.length
    ) {
      throw new ConflictException({
        code:
          'EXTRA_ADULT_ROOM_ALLOCATION_FAILED',

        message:
          'Nu mai există suficiente apartamente concrete care permit un adult suplimentar.',

        roomTypeId,

        requiredExtraAdultUnits:
          extraAdultReservationRooms.length,

        availableExtraAdultUnits:
          extraAdultPhysicalRooms.length,
      });
    }

    const selectedExtraAdultRooms =
      extraAdultPhysicalRooms.slice(
        0,
        extraAdultReservationRooms.length,
      );

    const selectedExtraAdultRoomIds =
      new Set(
        selectedExtraAdultRooms.map(
          (room) =>
            room.id,
        ),
      );

    /*
     * Rezervările standard folosesc cu prioritate camerele care
     * nu permit adult suplimentar. Camerele speciale rămân astfel
     * disponibile cât mai mult timp pentru rezervările care chiar
     * au nevoie de ele.
     */
    const remainingPhysicalRooms =
      availableRooms
        .filter(
          (room) =>
            !selectedExtraAdultRoomIds.has(
              room.id,
            ),
        )
        .sort((firstRoom, secondRoom) => {
          if (
            firstRoom.allowsExtraAdult !==
            secondRoom.allowsExtraAdult
          ) {
            return firstRoom.allowsExtraAdult
              ? 1
              : -1;
          }

          return firstRoom.code.localeCompare(
            secondRoom.code,
          );
        });

    if (
      remainingPhysicalRooms.length <
      standardReservationRooms.length
    ) {
      throw new ConflictException({
        code:
          'ROOM_ALLOCATION_FAILED',

        message:
          'Nu mai există suficiente apartamente concrete disponibile pentru finalizarea rezervării.',

        roomTypeId,

        requiredUnits:
          reservationRooms.length,

        availableUnits:
          availableRooms.length,
      });
    }

    return [
      ...extraAdultReservationRooms.map(
        (reservationRoom, index) => ({
          reservationRoom,

          physicalRoom:
            selectedExtraAdultRooms[
              index
            ]!,
        }),
      ),

      ...standardReservationRooms.map(
        (reservationRoom, index) => ({
          reservationRoom,

          physicalRoom:
            remainingPhysicalRooms[
              index
            ]!,
        }),
      ),
    ];
  }

  private buildPredictionPairs(
    reservationRooms:
      ReservationWithRooms['rooms'],
    availableRooms: Room[],
  ): Array<{
    reservationRoom:
      ReservationWithRooms['rooms'][number];
    physicalRoom: Room;
  }> {
    const extraAdultReservationRooms =
      reservationRooms.filter(
        (reservationRoom) =>
          reservationRoom.hasExtraAdult,
      );

    const standardReservationRooms =
      reservationRooms.filter(
        (reservationRoom) =>
          !reservationRoom.hasExtraAdult,
      );

    const extraAdultPhysicalRooms =
      availableRooms.filter(
        (room) =>
          room.allowsExtraAdult,
      );

    const extraAdultPairCount =
      Math.min(
        extraAdultReservationRooms.length,
        extraAdultPhysicalRooms.length,
      );

    const selectedExtraAdultRooms =
      extraAdultPhysicalRooms.slice(
        0,
        extraAdultPairCount,
      );

    const selectedExtraAdultRoomIds =
      new Set(
        selectedExtraAdultRooms.map(
          (room) =>
            room.id,
        ),
      );

    const remainingPhysicalRooms =
      availableRooms
        .filter(
          (room) =>
            !selectedExtraAdultRoomIds.has(
              room.id,
            ),
        )
        .sort((firstRoom, secondRoom) => {
          if (
            firstRoom.allowsExtraAdult !==
            secondRoom.allowsExtraAdult
          ) {
            return firstRoom.allowsExtraAdult
              ? 1
              : -1;
          }

          return firstRoom.code.localeCompare(
            secondRoom.code,
          );
        });

    const standardPairCount =
      Math.min(
        standardReservationRooms.length,
        remainingPhysicalRooms.length,
      );

    return [
      ...extraAdultReservationRooms
        .slice(
          0,
          extraAdultPairCount,
        )
        .map(
          (reservationRoom, index) => ({
            reservationRoom,

            physicalRoom:
              selectedExtraAdultRooms[
                index
              ]!,
          }),
        ),

      ...standardReservationRooms
        .slice(
          0,
          standardPairCount,
        )
        .map(
          (reservationRoom, index) => ({
            reservationRoom,

            physicalRoom:
              remainingPhysicalRooms[
                index
              ]!,
          }),
        ),
    ];
  }

  private ensureEnoughRoomsAvailable(params: {
    roomTypeId: string;
    requiredUnits: number;
    availableUnits: number;
  }): void {
    if (
      params.availableUnits <
      params.requiredUnits
    ) {
      throw new ConflictException({
        code:
          'ROOM_ALLOCATION_FAILED',

        message:
          'Nu mai există suficiente apartamente concrete disponibile pentru finalizarea rezervării.',

        roomTypeId:
          params.roomTypeId,

        requiredUnits:
          params.requiredUnits,

        availableUnits:
          params.availableUnits,
      });
    }
  }

  private mapAllocatedRoom(
    reservationRoomId: string,
    roomTypeId: string,
    hasExtraAdult: boolean,
    room: Pick<
      Room,
      | 'id'
      | 'code'
      | 'name'
      | 'allowsExtraAdult'
    >,
  ): AllocatedReservationRoom {
    return {
      reservationRoomId,
      roomTypeId,

      roomId:
        room.id,

      roomCode:
        room.code,

      roomName:
        room.name,

      hasExtraAdult,

      allowsExtraAdult:
        room.allowsExtraAdult,
    };
  }

  private async buildExistingAllocationResult(
    transaction: Prisma.TransactionClient,
    reservationId: string,
    assignments: Array<{
      id: string;
      roomTypeId: string;
      roomId: string;
      hasExtraAdult: boolean;
    }>,
  ): Promise<ReservationAllocationResult> {
    if (assignments.length === 0) {
      return {
        reservationId,
        allocatedRooms: [],
      };
    }

    const rooms =
      await transaction.room.findMany({
        where: {
          id: {
            in: assignments.map(
              (assignment) =>
                assignment.roomId,
            ),
          },
        },
      });

    const roomsById = new Map(
      rooms.map((room) => [
        room.id,
        room,
      ]),
    );

    return {
      reservationId,

      allocatedRooms:
        assignments.map(
          (assignment) => {
            const room =
              roomsById.get(
                assignment.roomId,
              );

            if (!room) {
              throw new ConflictException({
                code:
                  'ALLOCATED_ROOM_NOT_FOUND',

                message:
                  'Un apartament alocat rezervării nu mai există.',

                roomId:
                  assignment.roomId,
              });
            }

            return this.mapAllocatedRoom(
              assignment.id,
              assignment.roomTypeId,
              assignment.hasExtraAdult,
              room,
            );
          },
        ),
    };
  }
}
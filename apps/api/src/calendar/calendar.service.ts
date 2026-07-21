import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import {
  Locale,
  Prisma,
  ReservationStatus,
} from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { ReservationAllocationService } from '../reservations/services/reservation-allocation.service';

import { FindCalendarQueryDto } from './dto/find-calendar-query.dto';

import type {
  CalendarEvent,
  CalendarExternalEvent,
  CalendarReservationEvent,
  CalendarResponse,
  CalendarRoom,
  CalendarUnassignedReservation,
} from './calendar.types';

const CONFIRMED_CALENDAR_STATUSES: ReservationStatus[] = [
  ReservationStatus.CONFIRMED,
  ReservationStatus.CHECKED_IN,
  ReservationStatus.CHECKED_OUT,
];

const PENDING_CALENDAR_STATUSES: ReservationStatus[] = [
  ReservationStatus.PENDING_APPROVAL,
  ReservationStatus.APPROVED_AWAITING_PAYMENT,
];

type ProvisionalOccupancy = {
  roomId: string;
  start: string;
  end: string;
};

@Injectable()
export class CalendarService {
  private static readonly MAXIMUM_RANGE_DAYS = 370;

  constructor(
    private readonly prisma: PrismaService,
    private readonly reservationAllocationService: ReservationAllocationService,
  ) {}

  async findCalendar(
    query: FindCalendarQueryDto,
  ): Promise<CalendarResponse> {
    const fromDate = this.parseDate(
      query.from,
      'from',
    );

    const toDate = this.parseDate(
      query.to,
      'to',
    );

    this.validateRange(
      fromDate,
      toDate,
    );

    const includePending =
      query.includePending ?? true;

    const reservationStatuses =
      includePending
        ? [
            ...CONFIRMED_CALENDAR_STATUSES,
            ...PENDING_CALENDAR_STATUSES,
          ]
        : CONFIRMED_CALENDAR_STATUSES;

    return this.prisma.$transaction(
      async (
        transaction: Prisma.TransactionClient,
      ) => {
        const [
          rooms,
          reservationRooms,
          blockedPeriods,
          externalEvents,
        ] = await Promise.all([
          transaction.room.findMany({
            where: {
              isActive: true,
            },

            include: {
              roomType: true,
            },

            orderBy: [
              {
                roomType: {
                  nameRo: 'asc',
                },
              },
              {
                code: 'asc',
              },
            ],
          }),

          transaction.reservationRoom.findMany({
            where: {
              reservation: {
                status: {
                  in: reservationStatuses,
                },

                cancelledAt: null,

                checkInDate: {
                  lt: toDate,
                },

                checkOutDate: {
                  gt: fromDate,
                },
              },
            },

            include: {
              room: true,
              roomType: true,

              reservation: {
                include: {
                  guest: true,
                },
              },
            },

            orderBy: [
              {
                reservation: {
                  checkInDate: 'asc',
                },
              },
              {
                reservation: {
                  checkOutDate: 'asc',
                },
              },
              {
                reservationId: 'asc',
              },
              {
                id: 'asc',
              },
            ],
          }),

          transaction.blockedPeriod.findMany({
            where: {
              room: {
                isActive: true,
              },

              startDate: {
                lt: toDate,
              },

              endDate: {
                gt: fromDate,
              },
            },

            include: {
              room: true,
            },

            orderBy: {
              startDate: 'asc',
            },
          }),

          transaction.externalCalendarEvent.findMany({
            where: {
              cancelledAt: null,

              startDate: {
                lt: toDate,
              },

              endDate: {
                gt: fromDate,
              },

              externalCalendar: {
                isActive: true,

                room: {
                  isActive: true,
                },
              },
            },

            include: {
              externalCalendar: {
                include: {
                  room: true,
                },
              },
            },

            orderBy: {
              startDate: 'asc',
            },
          }),
        ]);

        const calendarRooms: CalendarRoom[] =
          rooms.map((room) => ({
            id: room.id,
            name: room.name,
            code: room.code,
            floor: room.floor,
            roomTypeId: room.roomTypeId,
            roomTypeName:
              room.roomType.nameRo,
          }));

        const roomNameById = new Map(
          calendarRooms.map((room) => [
            room.id,
            room.name,
          ]),
        );

        const reservationEvents:
          CalendarReservationEvent[] = [];

        const unassignedReservations:
          CalendarUnassignedReservation[] = [];

        for (
          const reservationRoom of reservationRooms
        ) {
          const reservation =
            reservationRoom.reservation;

          const guestName =
            `${reservation.guest.firstName} ${reservation.guest.lastName}`.trim();

          const roomTypeName =
            reservation.locale === Locale.EN
              ? reservationRoom.roomType.nameEn
              : reservationRoom.roomType.nameRo;

          const start =
            this.formatDate(
              reservation.checkInDate,
            );

          const end =
            this.formatDate(
              reservation.checkOutDate,
            );

          const totalPrice =
            reservation.totalPrice.toNumber();

          const paidAmount =
            reservation.paidAmount.toNumber();

          if (!reservationRoom.roomId) {
            unassignedReservations.push({
              reservationId:
                reservation.id,

              reservationRoomId:
                reservationRoom.id,

              roomTypeId:
                reservationRoom.roomTypeId,

              roomTypeName,

              start,
              end,

              guestName,

              status:
                reservation.status,

              adults:
                reservationRoom.adults,

              source:
                reservation.source,

              totalPrice,
              paidAmount,

              predictedRoomId: null,
              predictedRoomName: null,
              predictedRoomCode: null,
            });

            continue;
          }

          reservationEvents.push({
            id:
              `reservation:${reservationRoom.id}`,

            type:
              'RESERVATION',

            roomId:
              reservationRoom.roomId,

            roomName:
              reservationRoom.room?.name ??
              roomNameById.get(
                reservationRoom.roomId,
              ) ??
              roomTypeName,

            reservationId:
              reservation.id,

            reservationRoomId:
              reservationRoom.id,

            start,
            end,

            guestName,

            status:
              reservation.status,

            adults:
              reservationRoom.adults,

            source:
              reservation.source,

            totalPrice,
            paidAmount,

            isProvisional: false,
          });
        }

        const blockedPeriodEvents:
          CalendarEvent[] =
          blockedPeriods.map(
            (blockedPeriod) => ({
              id:
                `blocked:${blockedPeriod.id}`,

              type:
                'BLOCKED_PERIOD',

              roomId:
                blockedPeriod.roomId,

              roomName:
                blockedPeriod.room.name,

              start:
                this.formatDate(
                  blockedPeriod.startDate,
                ),

              end:
                this.formatDate(
                  blockedPeriod.endDate,
                ),

              reason:
                blockedPeriod.reason ??
                'Cameră blocată',
            }),
          );

        const externalCalendarEvents:
          CalendarExternalEvent[] =
          externalEvents.map(
            (externalEvent) => ({
              id:
                `external:${externalEvent.id}`,

              type:
                'EXTERNAL_CALENDAR',

              roomId:
                externalEvent.externalCalendar
                  .roomId,

              roomName:
                externalEvent.externalCalendar
                  .room.name,

              start:
                this.formatDate(
                  externalEvent.startDate,
                ),

              end:
                this.formatDate(
                  externalEvent.endDate,
                ),

              source:
                'ICAL',
            }),
          );

        const provisionalReservationEvents =
          includePending
            ? await this.buildProvisionalReservationEvents(
                transaction,
                unassignedReservations,
              )
            : [];

        const events: CalendarEvent[] = [
          ...reservationEvents,
          ...provisionalReservationEvents,
          ...blockedPeriodEvents,
          ...externalCalendarEvents,
        ].sort((firstEvent, secondEvent) => {
          const dateComparison =
            firstEvent.start.localeCompare(
              secondEvent.start,
            );

          if (dateComparison !== 0) {
            return dateComparison;
          }

          const roomComparison =
            firstEvent.roomId.localeCompare(
              secondEvent.roomId,
            );

          if (roomComparison !== 0) {
            return roomComparison;
          }

          return firstEvent.id.localeCompare(
            secondEvent.id,
          );
        });

        return {
          range: {
            from: query.from,
            to: query.to,
          },

          rooms:
            calendarRooms,

          events,

          unassignedReservations,

          summary: {
            roomCount:
              calendarRooms.length,

            reservationEventCount:
              reservationEvents.length +
              provisionalReservationEvents.length,

            provisionalReservationCount:
              provisionalReservationEvents.length,

            blockedPeriodCount:
              blockedPeriodEvents.length,

            externalEventCount:
              externalCalendarEvents.length,

            unassignedReservationCount:
              unassignedReservations.length,
          },
        };
      },
    );
  }

  private async buildProvisionalReservationEvents(
    transaction: Prisma.TransactionClient,
    unassignedReservations:
      CalendarUnassignedReservation[],
  ): Promise<CalendarReservationEvent[]> {
    if (
      unassignedReservations.length === 0
    ) {
      return [];
    }

    const reservationsById = new Map<
      string,
      CalendarUnassignedReservation[]
    >();

    for (
      const reservationRoom of unassignedReservations
    ) {
      const current =
        reservationsById.get(
          reservationRoom.reservationId,
        ) ?? [];

      current.push(
        reservationRoom,
      );

      reservationsById.set(
        reservationRoom.reservationId,
        current,
      );
    }

    const reservationGroups =
      Array.from(
        reservationsById.entries(),
      ).sort(
        (
          [firstReservationId, firstRooms],
          [secondReservationId, secondRooms],
        ) => {
          const firstRoom =
            firstRooms[0];

          const secondRoom =
            secondRooms[0];

          if (!firstRoom || !secondRoom) {
            return firstReservationId.localeCompare(
              secondReservationId,
            );
          }

          const startComparison =
            firstRoom.start.localeCompare(
              secondRoom.start,
            );

          if (startComparison !== 0) {
            return startComparison;
          }

          const endComparison =
            firstRoom.end.localeCompare(
              secondRoom.end,
            );

          if (endComparison !== 0) {
            return endComparison;
          }

          return firstReservationId.localeCompare(
            secondReservationId,
          );
        },
      );

    const provisionalOccupancies:
      ProvisionalOccupancy[] = [];

    const provisionalEvents:
      CalendarReservationEvent[] = [];

    for (const [
      reservationId,
      reservationRooms,
    ] of reservationGroups) {
      const firstReservationRoom =
        reservationRooms[0];

      if (!firstReservationRoom) {
        continue;
      }

      const excludedRoomIds =
        provisionalOccupancies
          .filter((occupancy) =>
            this.periodsOverlap(
              firstReservationRoom.start,
              firstReservationRoom.end,
              occupancy.start,
              occupancy.end,
            ),
          )
          .map(
            (occupancy) =>
              occupancy.roomId,
          );

      const prediction =
        await this.reservationAllocationService.predictRoomsInTransaction(
          transaction,
          reservationId,
          excludedRoomIds,
        );

      const predictedRoomByReservationRoomId =
        new Map(
          prediction.allocatedRooms.map(
            (allocatedRoom) => [
              allocatedRoom.reservationRoomId,
              allocatedRoom,
            ],
          ),
        );

      for (
        const reservationRoom of reservationRooms
      ) {
        const predictedRoom =
          predictedRoomByReservationRoomId.get(
            reservationRoom.reservationRoomId,
          );

        if (!predictedRoom) {
          continue;
        }

        reservationRoom.predictedRoomId =
          predictedRoom.roomId;

        reservationRoom.predictedRoomName =
          predictedRoom.roomName;

        reservationRoom.predictedRoomCode =
          predictedRoom.roomCode;

        provisionalOccupancies.push({
          roomId:
            predictedRoom.roomId,

          start:
            reservationRoom.start,

          end:
            reservationRoom.end,
        });

        provisionalEvents.push({
          id:
            `provisional:${reservationRoom.reservationRoomId}`,

          type:
            'RESERVATION',

          roomId:
            predictedRoom.roomId,

          roomName:
            predictedRoom.roomName,

          reservationId:
            reservationRoom.reservationId,

          reservationRoomId:
            reservationRoom.reservationRoomId,

          start:
            reservationRoom.start,

          end:
            reservationRoom.end,

          guestName:
            reservationRoom.guestName,

          status:
            reservationRoom.status,

          adults:
            reservationRoom.adults,

          source:
            reservationRoom.source,

          totalPrice:
            reservationRoom.totalPrice,

          paidAmount:
            reservationRoom.paidAmount,

          isProvisional: true,
        });
      }
    }

    return provisionalEvents;
  }

  private periodsOverlap(
    firstStart: string,
    firstEnd: string,
    secondStart: string,
    secondEnd: string,
  ): boolean {
    return (
      firstStart < secondEnd &&
      firstEnd > secondStart
    );
  }

  private parseDate(
    value: string,
    fieldName: string,
  ): Date {
    const date = new Date(
      `${value}T00:00:00.000Z`,
    );

    if (
      Number.isNaN(
        date.getTime(),
      ) ||
      this.formatDate(date) !==
        value
    ) {
      throw new BadRequestException({
        code:
          'INVALID_CALENDAR_DATE',

        message:
          `${fieldName} nu reprezintă o dată validă.`,

        field:
          fieldName,
      });
    }

    return date;
  }

  private validateRange(
    fromDate: Date,
    toDate: Date,
  ): void {
    if (
      toDate <= fromDate
    ) {
      throw new BadRequestException({
        code:
          'INVALID_CALENDAR_RANGE',

        message:
          'Data finală trebuie să fie după data inițială.',
      });
    }

    const rangeDays =
      this.getDifferenceInDays(
        fromDate,
        toDate,
      );

    if (
      rangeDays >
      CalendarService
        .MAXIMUM_RANGE_DAYS
    ) {
      throw new BadRequestException({
        code:
          'CALENDAR_RANGE_TOO_LARGE',

        message:
          `Intervalul calendarului nu poate depăși ${CalendarService.MAXIMUM_RANGE_DAYS} zile.`,

        maximumDays:
          CalendarService
            .MAXIMUM_RANGE_DAYS,

        requestedDays:
          rangeDays,
      });
    }
  }

  private getDifferenceInDays(
    startDate: Date,
    endDate: Date,
  ): number {
    const millisecondsPerDay =
      24 * 60 * 60 * 1000;

    return Math.floor(
      (
        endDate.getTime() -
        startDate.getTime()
      ) /
        millisecondsPerDay,
    );
  }

  private formatDate(
    value: Date,
  ): string {
    return value
      .toISOString()
      .slice(0, 10);
  }
}
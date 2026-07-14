import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  ReservationChangeStatus,
  ReservationStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReservationChangeDto } from '../dto/create-reservation-change.dto';
import { ReservationPricingService } from './reservation-pricing.service';

const INVENTORY_BLOCKING_STATUSES: ReservationStatus[] = [
  ReservationStatus.PENDING_APPROVAL,
  ReservationStatus.APPROVED_AWAITING_PAYMENT,
  ReservationStatus.CONFIRMED,
  ReservationStatus.CHECKED_IN,
];

@Injectable()
export class ReservationChangeService {
  private static readonly MINIMUM_DAYS_BEFORE_CHECK_IN = 30;
  private static readonly APPROVAL_WINDOW_HOURS = 24;

  constructor(
    private readonly prisma: PrismaService,
    private readonly pricingService: ReservationPricingService,
  ) {}

  async create(
    reservationId: string,
    dto: CreateReservationChangeDto,
  ) {
    const requestedCheckInDate = this.parseDate(
      dto.checkIn,
      'checkIn',
    );

    const requestedCheckOutDate = this.parseDate(
      dto.checkOut,
      'checkOut',
    );

    this.validateDateRange(
      requestedCheckInDate,
      requestedCheckOutDate,
    );

    this.validateMinimumStay(
      requestedCheckInDate,
      requestedCheckOutDate,
    );

    const reservation =
      await this.prisma.reservation.findUnique({
        where: {
          id: reservationId,
        },
        include: {
          rooms: {
            include: {
              roomType: true,
            },
          },
          changes: {
            where: {
              status: {
                in: [
                  ReservationChangeStatus.PENDING_APPROVAL,
                  ReservationChangeStatus.APPROVED_AWAITING_PAYMENT,
                ],
              },
            },
            select: {
              id: true,
              status: true,
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
      reservation.status !== ReservationStatus.CONFIRMED
    ) {
      throw new ConflictException({
        code: 'RESERVATION_CHANGE_NOT_ALLOWED',
        message:
          'Doar rezervările confirmate pot fi modificate.',
        currentStatus: reservation.status,
      });
    }

    if (reservation.changes.length > 0) {
      throw new ConflictException({
        code: 'ACTIVE_RESERVATION_CHANGE_EXISTS',
        message:
          'Există deja o solicitare de modificare activă pentru această rezervare.',
        reservationChangeId: reservation.changes[0]?.id,
      });
    }

    this.validateModificationDeadline(
      reservation.checkInDate,
    );

    if (
      this.sameDate(
        reservation.checkInDate,
        requestedCheckInDate,
      ) &&
      this.sameDate(
        reservation.checkOutDate,
        requestedCheckOutDate,
      )
    ) {
      throw new BadRequestException({
        code: 'RESERVATION_DATES_UNCHANGED',
        message:
          'Noua perioadă trebuie să fie diferită de perioada rezervării actuale.',
      });
    }

    const selections =
      this.buildCurrentRoomSelections(reservation.rooms);

    await this.assertAvailabilityForChange({
      reservationId: reservation.id,
      checkInDate: requestedCheckInDate,
      checkOutDate: requestedCheckOutDate,
      selections,
    });

    const pricing =
      await this.pricingService.calculateReservationPrice({
        checkIn: dto.checkIn,
        checkOut: dto.checkOut,
        rooms: selections.map((selection) => ({
          roomTypeId: selection.roomTypeId,
          quantity: selection.quantity,
        })),
      });

    const oldSubtotalPrice =
      reservation.subtotalPrice;

    const newSubtotalPrice = new Prisma.Decimal(
      pricing.subtotalPrice,
    );

    const priceDifference =
      newSubtotalPrice.minus(oldSubtotalPrice);

    const amountDue = Prisma.Decimal.max(
      priceDifference,
      new Prisma.Decimal(0),
    );

    const retainedAmount = Prisma.Decimal.max(
      priceDifference.negated(),
      new Prisma.Decimal(0),
    );

    const now = new Date();

    try {
      const reservationChange =
        await this.prisma.reservationChange.create({
          data: {
            reservationId: reservation.id,

            status:
              ReservationChangeStatus.PENDING_APPROVAL,

            requestedCheckInDate,
            requestedCheckOutDate,

            oldCheckInDate: reservation.checkInDate,
            oldCheckOutDate: reservation.checkOutDate,

            oldSubtotalPrice,
            newSubtotalPrice,
            priceDifference,

            amountDue,
            retainedAmount,

            guestReason: dto.guestReason?.trim(),

            approvalExpiresAt: this.addHours(
              now,
              ReservationChangeService.APPROVAL_WINDOW_HOURS,
            ),

            paymentExpiresAt: null,
          },
        });

      return {
        id: reservationChange.id,
        reservationId: reservation.id,
        status: reservationChange.status,

        oldPeriod: {
          checkIn: this.formatDate(
            reservationChange.oldCheckInDate,
          ),
          checkOut: this.formatDate(
            reservationChange.oldCheckOutDate,
          ),
        },

        requestedPeriod: {
          checkIn: this.formatDate(
            reservationChange.requestedCheckInDate,
          ),
          checkOut: this.formatDate(
            reservationChange.requestedCheckOutDate,
          ),
        },

        oldSubtotalPrice:
          reservationChange.oldSubtotalPrice.toNumber(),

        newSubtotalPrice:
          reservationChange.newSubtotalPrice.toNumber(),

        priceDifference:
          reservationChange.priceDifference.toNumber(),

        amountDue:
          reservationChange.amountDue.toNumber(),

        retainedAmount:
          reservationChange.retainedAmount.toNumber(),

        approvalExpiresAt:
          reservationChange.approvalExpiresAt?.toISOString() ??
          null,

        guestReason: reservationChange.guestReason,

        message:
          'Solicitarea de modificare a fost înregistrată și așteaptă aprobarea administratorului.',
      };
    } catch (error: unknown) {
      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2034'
      ) {
        throw new ConflictException({
          code: 'CONCURRENT_RESERVATION_CHANGE',
          message:
            'Disponibilitatea s-a modificat între timp. Verifică din nou perioada.',
        });
      }

      throw error;
    }
  }
  
  private buildCurrentRoomSelections(
    reservationRooms: Array<{
      roomTypeId: string;
      adults: number;
    }>,
  ): Array<{
    roomTypeId: string;
    quantity: number;
    adultsPerRoom: number;
  }> {
    const selections = new Map<
      string,
      {
        roomTypeId: string;
        quantity: number;
        adultsPerRoom: number;
      }
    >();

    for (const reservationRoom of reservationRooms) {
      const existing = selections.get(
        reservationRoom.roomTypeId,
      );

      if (existing) {
        existing.quantity += 1;

        /*
         * În MVP presupunem aceeași ocupare pentru camerele
         * din același RoomType.
         */
        existing.adultsPerRoom = Math.max(
          existing.adultsPerRoom,
          reservationRoom.adults,
        );
      } else {
        selections.set(reservationRoom.roomTypeId, {
          roomTypeId: reservationRoom.roomTypeId,
          quantity: 1,
          adultsPerRoom: reservationRoom.adults,
        });
      }
    }

    return Array.from(selections.values());
  }

  private async assertAvailabilityForChange(params: {
    reservationId: string;
    checkInDate: Date;
    checkOutDate: Date;
    selections: Array<{
      roomTypeId: string;
      quantity: number;
      adultsPerRoom: number;
    }>;
  }): Promise<void> {
    for (const selection of params.selections) {
      const roomType =
        await this.prisma.roomType.findUnique({
          where: {
            id: selection.roomTypeId,
          },
          include: {
            rooms: {
              where: {
                isActive: true,
              },
              select: {
                id: true,
              },
            },
          },
        });

      if (!roomType || !roomType.isActive) {
        throw new ConflictException({
          code: 'ROOM_TYPE_NOT_AVAILABLE',
          message:
            'Unul dintre tipurile de apartamente nu mai este disponibil.',
          roomTypeId: selection.roomTypeId,
        });
      }

      if (
        selection.adultsPerRoom > roomType.maxAdults
      ) {
        throw new BadRequestException({
          code: 'ROOM_CAPACITY_EXCEEDED',
          message: `Capacitatea maximă pentru ${roomType.nameRo} este de ${roomType.maxAdults} adulți.`,
          roomTypeId: roomType.id,
        });
      }

      const [
        assignedReservationRooms,
        unassignedReservationRooms,
        blockedPeriods,
        externalEvents,
      ] = await Promise.all([
        this.prisma.reservationRoom.findMany({
          where: {
            roomTypeId: selection.roomTypeId,

            reservationId: {
              not: params.reservationId,
            },

            roomId: {
              not: null,
            },

            reservation: {
              status: {
                in: INVENTORY_BLOCKING_STATUSES,
              },

              checkInDate: {
                lt: params.checkOutDate,
              },

              checkOutDate: {
                gt: params.checkInDate,
              },
            },
          },
          select: {
            roomId: true,
          },
        }),

        this.prisma.reservationRoom.count({
          where: {
            roomTypeId: selection.roomTypeId,

            reservationId: {
              not: params.reservationId,
            },

            roomId: null,

            reservation: {
              status: {
                in: INVENTORY_BLOCKING_STATUSES,
              },

              checkInDate: {
                lt: params.checkOutDate,
              },

              checkOutDate: {
                gt: params.checkInDate,
              },
            },
          },
        }),

        this.prisma.blockedPeriod.findMany({
          where: {
            room: {
              roomTypeId: selection.roomTypeId,
              isActive: true,
            },

            startDate: {
              lt: params.checkOutDate,
            },

            endDate: {
              gt: params.checkInDate,
            },
          },
          select: {
            roomId: true,
          },
        }),

        this.prisma.externalCalendarEvent.findMany({
          where: {
            cancelledAt: null,

            startDate: {
              lt: params.checkOutDate,
            },

            endDate: {
              gt: params.checkInDate,
            },

            externalCalendar: {
              isActive: true,

              room: {
                roomTypeId: selection.roomTypeId,
                isActive: true,
              },
            },
          },
          select: {
            externalCalendar: {
              select: {
                roomId: true,
              },
            },
          },
        }),
      ]);

      const unavailablePhysicalRoomIds =
        new Set<string>();

      for (const assigned of assignedReservationRooms) {
        if (assigned.roomId) {
          unavailablePhysicalRoomIds.add(
            assigned.roomId,
          );
        }
      }

      for (const blockedPeriod of blockedPeriods) {
        unavailablePhysicalRoomIds.add(
          blockedPeriod.roomId,
        );
      }

      for (const externalEvent of externalEvents) {
        unavailablePhysicalRoomIds.add(
          externalEvent.externalCalendar.roomId,
        );
      }

      const availableUnits = Math.max(
        0,
        roomType.rooms.length -
          unavailablePhysicalRoomIds.size -
          unassignedReservationRooms,
      );

      if (selection.quantity > availableUnits) {
        throw new ConflictException({
          code: 'INSUFFICIENT_AVAILABILITY_FOR_CHANGE',
          message: `Pentru ${roomType.nameRo} sunt disponibile doar ${availableUnits} unități în noua perioadă.`,
          roomTypeId: roomType.id,
          requestedUnits: selection.quantity,
          availableUnits,
        });
      }
    }
  }

  private validateModificationDeadline(
    currentCheckInDate: Date,
  ): void {
    const today = this.getTodayInRomania();

    const daysUntilCurrentCheckIn =
      this.getDifferenceInDays(
        today,
        currentCheckInDate,
      );

    if (
      daysUntilCurrentCheckIn <
      ReservationChangeService.MINIMUM_DAYS_BEFORE_CHECK_IN
    ) {
      throw new ConflictException({
        code: 'RESERVATION_CHANGE_DEADLINE_PASSED',
        message:
          'Modificarea este permisă doar cu minimum 30 de zile înainte de check-in.',
        minimumDaysBeforeCheckIn:
          ReservationChangeService.MINIMUM_DAYS_BEFORE_CHECK_IN,
        daysUntilCheckIn: daysUntilCurrentCheckIn,
      });
    }
  }

  private validateMinimumStay(
    checkInDate: Date,
    checkOutDate: Date,
  ): void {
    const nights = this.getDifferenceInDays(
      checkInDate,
      checkOutDate,
    );

    const checkInDay = checkInDate.getUTCDay();

    const minimumStay =
      checkInDay === 5 || checkInDay === 6 ? 2 : 1;

    if (nights < minimumStay) {
      throw new BadRequestException({
        code: 'MINIMUM_STAY_NOT_MET',
        message:
          'Pentru check-in vineri sau sâmbătă este necesar un sejur de minimum 2 nopți.',
        minimumStay,
      });
    }
  }

  private parseDate(
    value: string,
    fieldName: string,
  ): Date {
    const date = new Date(
      `${value}T00:00:00.000Z`,
    );

    if (
      Number.isNaN(date.getTime()) ||
      this.formatDate(date) !== value
    ) {
      throw new BadRequestException(
        `${fieldName} nu reprezintă o dată validă.`,
      );
    }

    return date;
  }

  private validateDateRange(
    checkInDate: Date,
    checkOutDate: Date,
  ): void {
    if (checkOutDate <= checkInDate) {
      throw new BadRequestException(
        'Data de check-out trebuie să fie după data de check-in.',
      );
    }

    const today = this.getTodayInRomania();

    if (checkInDate < today) {
      throw new BadRequestException(
        'Noua dată de check-in nu poate fi în trecut.',
      );
    }
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

  private getDifferenceInDays(
    startDate: Date,
    endDate: Date,
  ): number {
    const millisecondsPerDay =
      24 * 60 * 60 * 1000;

    return Math.floor(
      (endDate.getTime() - startDate.getTime()) /
        millisecondsPerDay,
    );
  }

  private addHours(
    value: Date,
    hours: number,
  ): Date {
    return new Date(
      value.getTime() + hours * 60 * 60 * 1000,
    );
  }

  private sameDate(
    firstDate: Date,
    secondDate: Date,
  ): boolean {
    return (
      firstDate.getTime() === secondDate.getTime()
    );
  }

  private formatDate(value: Date): string {
    return value.toISOString().slice(0, 10);
  }
}
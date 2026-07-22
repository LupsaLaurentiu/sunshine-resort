import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import {
  Prisma,
  ReservationStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CheckAvailabilityQueryDto } from './dto/check-availability-query.dto';
import type {
  AvailabilityResponse,
  AvailableRoomType,
  NightlyRate,
} from './types/availability-response.type';

const INVENTORY_BLOCKING_STATUSES: ReservationStatus[] = [
  ReservationStatus.PENDING_APPROVAL,
  ReservationStatus.APPROVED_AWAITING_PAYMENT,
  ReservationStatus.CONFIRMED,
  ReservationStatus.CHECKED_IN,
];

@Injectable()
export class AvailabilityService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async checkAvailability(
    query: CheckAvailabilityQueryDto,
  ): Promise<AvailabilityResponse> {
    const checkInDate =
      this.parseDate(query.checkIn);

    const checkOutDate =
      this.parseDate(query.checkOut);

    this.validateStayDates(
      query.checkIn,
      checkInDate,
      checkOutDate,
    );

    const stayDates =
      this.getStayDates(
        checkInDate,
        checkOutDate,
      );

    const minimumStay =
      this.getMinimumStay(
        checkInDate,
      );

    const [
      roomTypes,
      assignedReservationRooms,
      unassignedReservationRooms,
      blockedPeriods,
      externalCalendarEvents,
    ] = await Promise.all([
      this.findRoomTypesWithRates(
        checkInDate,
        checkOutDate,
      ),

      this.findAssignedReservationRooms(
        checkInDate,
        checkOutDate,
      ),

      this.findUnassignedReservationRooms(
        checkInDate,
        checkOutDate,
      ),

      this.findBlockedPeriods(
        checkInDate,
        checkOutDate,
      ),

      this.findExternalCalendarEvents(
        checkInDate,
        checkOutDate,
      ),
    ]);

    /*
     * Camerele fizice care nu pot fi utilizate în perioada cerută:
     *
     * - sunt deja alocate unei rezervări;
     * - sunt blocate administrativ;
     * - sunt ocupate printr-un calendar extern.
     */
    const unavailableRoomIds =
      new Set<string>();

    for (
      const reservationRoom of
        assignedReservationRooms
    ) {
      if (
        reservationRoom.roomId
      ) {
        unavailableRoomIds.add(
          reservationRoom.roomId,
        );
      }
    }

    for (
      const blockedPeriod of
        blockedPeriods
    ) {
      unavailableRoomIds.add(
        blockedPeriod.roomId,
      );
    }

    for (
      const externalEvent of
        externalCalendarEvents
    ) {
      unavailableRoomIds.add(
        externalEvent.externalCalendar
          .roomId,
      );
    }

    /*
     * Rezervările nealocate trebuie scăzute separat din inventarul
     * tipului de apartament.
     *
     * Separăm:
     *
     * - rezervările normale;
     * - rezervările care necesită un apartament cu adult suplimentar.
     */
    const unassignedHoldsByRoomType =
      new Map<
        string,
        {
          total: number;
          extraAdult: number;
          standard: number;
        }
      >();

    for (
      const reservationRoom of
        unassignedReservationRooms
    ) {
      const current =
        unassignedHoldsByRoomType.get(
          reservationRoom.roomTypeId,
        ) ?? {
          total: 0,
          extraAdult: 0,
          standard: 0,
        };

      current.total += 1;

      if (
        reservationRoom.hasExtraAdult
      ) {
        current.extraAdult += 1;
      } else {
        current.standard += 1;
      }

      unassignedHoldsByRoomType.set(
        reservationRoom.roomTypeId,
        current,
      );
    }

    const availableRoomTypes:
      AvailableRoomType[] =
      roomTypes
        .map((roomType) => {
          const totalUnits =
            roomType.rooms.length;

          /*
           * Camerele fizice care sunt efectiv libere înainte să
           * scădem rezervările nealocate.
           */
          const physicallyAvailableRooms =
            roomType.rooms.filter(
              (room) =>
                !unavailableRoomIds.has(
                  room.id,
                ),
            );

          const physicallyAvailableUnits =
            physicallyAvailableRooms.length;

          const physicallyAvailableExtraAdultUnits =
            physicallyAvailableRooms.filter(
              (room) =>
                room.allowsExtraAdult,
            ).length;

          const physicallyAvailableStandardOnlyUnits =
            physicallyAvailableUnits -
            physicallyAvailableExtraAdultUnits;

          const unassignedHolds =
            unassignedHoldsByRoomType.get(
              roomType.id,
            ) ?? {
              total: 0,
              extraAdult: 0,
              standard: 0,
            };

          /*
           * Disponibilitatea generală:
           *
           * toate camerele fizice libere
           * minus toate rezervările nealocate.
           */
          const availableUnits =
            Math.max(
              0,
              physicallyAvailableUnits -
                unassignedHolds.total,
            );

          /*
           * Disponibilitatea pentru adult suplimentar.
           *
           * 1. Rezervările cu adult suplimentar consumă obligatoriu
           *    camere din inventarul special.
           *
           * 2. Rezervările normale consumă mai întâi camerele care
           *    NU permit adult suplimentar.
           *
           * 3. Dacă rezervările normale depășesc inventarul standard,
           *    diferența consumă și camerele speciale.
           */
          const extraAdultUnitsAfterExtraAdultHolds =
            Math.max(
              0,
              physicallyAvailableExtraAdultUnits -
                unassignedHolds.extraAdult,
            );

          const standardHoldsThatConsumeExtraAdultUnits =
            Math.max(
              0,
              unassignedHolds.standard -
                physicallyAvailableStandardOnlyUnits,
            );

          const availableExtraAdultUnits =
            Math.max(
              0,
              extraAdultUnitsAfterExtraAdultHolds -
                standardHoldsThatConsumeExtraAdultUnits,
            );

          const nightlyRates =
            this.calculateNightlyRates(
              stayDates,
              roomType,
            );

          const totalPrice =
            nightlyRates.reduce(
              (
                total,
                nightlyRate,
              ) =>
                total.plus(
                  nightlyRate.price,
                ),
              new Prisma.Decimal(0),
            );

          const totalPriceAsNumber =
            totalPrice
              .toDecimalPlaces(2)
              .toNumber();

          const extraAdultPrice =
            roomType.extraAdultPrice
              .toDecimalPlaces(2)
              .toNumber();

          return {
            id:
              roomType.id,

            slug:
              roomType.slug,

            nameRo:
              roomType.nameRo,

            nameEn:
              roomType.nameEn,

            descriptionRo:
              roomType.descriptionRo,

            descriptionEn:
              roomType.descriptionEn,

            maxAdults:
              roomType.maxAdults,

            maxExtraAdultsPerRoom:
              1,

            /*
             * Opțiunea este disponibilă numai când:
             *
             * - există cel puțin o cameră eligibilă liberă;
             * - tariful este configurat cu o valoare mai mare decât 0.
             */
            allowsExtraAdult:
              availableExtraAdultUnits >
                0 &&
              extraAdultPrice > 0,

            availableExtraAdultUnits,

            extraAdultPrice,

            sizeSqm:
              roomType.sizeSqm,

            totalUnits,
            availableUnits,

            /*
             * Prețul de bază al unei singure camere pentru sejur,
             * fără costul adultului suplimentar.
             */
            totalPrice:
              totalPriceAsNumber,

            averagePricePerNight:
              stayDates.length > 0
                ? Number(
                    (
                      totalPriceAsNumber /
                      stayDates.length
                    ).toFixed(2),
                  )
                : 0,

            hasPromotion:
              nightlyRates.some(
                (rate) =>
                  rate.isPromotion,
              ),

            nightlyRates,
          };
        })
        .filter(
          (roomType) =>
            roomType.availableUnits >
            0,
        );

    return {
      checkIn:
        query.checkIn,

      checkOut:
        query.checkOut,

      nights:
        stayDates.length,

      adults:
        query.adults,

      minimumStay,

      roomTypes:
        availableRoomTypes,
    };
  }

  private async findRoomTypesWithRates(
    checkInDate: Date,
    checkOutDate: Date,
  ) {
    return this.prisma.roomType.findMany({
      where: {
        isActive: true,
      },

      include: {
        rooms: {
          where: {
            isActive: true,
          },

          orderBy: {
            code: 'asc',
          },
        },

        ratePeriods: {
          where: {
            isActive: true,

            startDate: {
              lt: checkOutDate,
            },

            endDate: {
              gt: checkInDate,
            },
          },

          orderBy: {
            startDate: 'asc',
          },
        },
      },

      orderBy: {
        nameEn: 'asc',
      },
    });
  }

  private async findAssignedReservationRooms(
    checkInDate: Date,
    checkOutDate: Date,
  ) {
    return this.prisma.reservationRoom.findMany({
      where: {
        roomId: {
          not: null,
        },

        reservation: {
          status: {
            in: INVENTORY_BLOCKING_STATUSES,
          },

          checkInDate: {
            lt: checkOutDate,
          },

          checkOutDate: {
            gt: checkInDate,
          },
        },
      },

      select: {
        roomId: true,
        roomTypeId: true,
        hasExtraAdult: true,
      },
    });
  }

  private async findUnassignedReservationRooms(
    checkInDate: Date,
    checkOutDate: Date,
  ) {
    return this.prisma.reservationRoom.findMany({
      where: {
        roomId: null,

        reservation: {
          status: {
            in: INVENTORY_BLOCKING_STATUSES,
          },

          checkInDate: {
            lt: checkOutDate,
          },

          checkOutDate: {
            gt: checkInDate,
          },
        },
      },

      select: {
        roomTypeId: true,
        hasExtraAdult: true,
      },
    });
  }

  private async findBlockedPeriods(
    checkInDate: Date,
    checkOutDate: Date,
  ) {
    return this.prisma.blockedPeriod.findMany({
      where: {
        startDate: {
          lt: checkOutDate,
        },

        endDate: {
          gt: checkInDate,
        },
      },

      select: {
        roomId: true,
      },
    });
  }

  private async findExternalCalendarEvents(
    checkInDate: Date,
    checkOutDate: Date,
  ) {
    return this.prisma.externalCalendarEvent.findMany({
      where: {
        cancelledAt: null,

        startDate: {
          lt: checkOutDate,
        },

        endDate: {
          gt: checkInDate,
        },

        externalCalendar: {
          isActive: true,

          room: {
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
    });
  }

  private calculateNightlyRates(
    stayDates: Date[],
    roomType: Awaited<
      ReturnType<
        AvailabilityService['findRoomTypesWithRates']
      >
    >[number],
  ): NightlyRate[] {
    return stayDates.map(
      (date) => {
        const isWeekend =
          this.isWeekendNight(
            date,
          );

        const applicableRatePeriod =
          roomType.ratePeriods.find(
            (ratePeriod) =>
              ratePeriod.startDate <=
                date &&
              ratePeriod.endDate >
                date,
          );

        if (
          applicableRatePeriod
        ) {
          const price =
            isWeekend
              ? applicableRatePeriod
                  .weekendPrice
              : applicableRatePeriod
                  .weekdayPrice;

          const originalPrice =
            isWeekend
              ? applicableRatePeriod
                  .originalWeekendPrice
              : applicableRatePeriod
                  .originalWeekdayPrice;

          return {
            date:
              this.formatDate(
                date,
              ),

            rateType:
              isWeekend
                ? 'WEEKEND'
                : 'WEEKDAY',

            price:
              price.toNumber(),

            originalPrice:
              originalPrice
                ? originalPrice.toNumber()
                : null,

            isPromotion:
              applicableRatePeriod
                .isPromotion,

            promotionTitleRo:
              applicableRatePeriod
                .titleRo,

            promotionTitleEn:
              applicableRatePeriod
                .titleEn,
          };
        }

        const basePrice =
          isWeekend
            ? roomType.weekendBasePrice
            : roomType.weekdayBasePrice;

        return {
          date:
            this.formatDate(
              date,
            ),

          rateType:
            isWeekend
              ? 'WEEKEND'
              : 'WEEKDAY',

          price:
            basePrice.toNumber(),

          originalPrice:
            null,

          isPromotion:
            false,

          promotionTitleRo:
            null,

          promotionTitleEn:
            null,
        };
      },
    );
  }

  private validateStayDates(
    checkIn: string,
    checkInDate: Date,
    checkOutDate: Date,
  ): void {
    if (
      checkOutDate <=
      checkInDate
    ) {
      throw new BadRequestException(
        'Data de check-out trebuie să fie după data de check-in.',
      );
    }

    const todayInRomania =
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

    if (
      checkIn <
      todayInRomania
    ) {
      throw new BadRequestException(
        'Data de check-in nu poate fi în trecut.',
      );
    }

    const nights =
      this.getDifferenceInDays(
        checkInDate,
        checkOutDate,
      );

    const minimumStay =
      this.getMinimumStay(
        checkInDate,
      );

    if (
      nights <
      minimumStay
    ) {
      throw new BadRequestException({
        code:
          'MINIMUM_STAY_NOT_MET',

        message:
          'Pentru check-in vineri sau sâmbătă este necesar un sejur de minimum 2 nopți.',

        minimumStay,
      });
    }
  }

  private getMinimumStay(
    checkInDate: Date,
  ): number {
    const checkInDay =
      checkInDate.getUTCDay();

    const isFridayOrSaturday =
      checkInDay === 5 ||
      checkInDay === 6;

    return isFridayOrSaturday
      ? 2
      : 1;
  }

  private isWeekendNight(
    date: Date,
  ): boolean {
    const day =
      date.getUTCDay();

    return (
      day === 5 ||
      day === 6
    );
  }

  private getStayDates(
    checkInDate: Date,
    checkOutDate: Date,
  ): Date[] {
    const dates: Date[] = [];

    const currentDate =
      new Date(
        checkInDate,
      );

    while (
      currentDate <
      checkOutDate
    ) {
      dates.push(
        new Date(
          currentDate,
        ),
      );

      currentDate.setUTCDate(
        currentDate.getUTCDate() +
          1,
      );
    }

    return dates;
  }

  private getDifferenceInDays(
    startDate: Date,
    endDate: Date,
  ): number {
    const millisecondsPerDay =
      24 * 60 * 60 * 1000;

    return Math.round(
      (
        endDate.getTime() -
        startDate.getTime()
      ) /
        millisecondsPerDay,
    );
  }

  private parseDate(
    value: string,
  ): Date {
    return new Date(
      `${value}T00:00:00.000Z`,
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
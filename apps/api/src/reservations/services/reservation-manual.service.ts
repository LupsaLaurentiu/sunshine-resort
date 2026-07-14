import {
  ConflictException,
  Injectable,
} from '@nestjs/common';
import {
  Locale,
  Prisma,
  ReservationSource,
  ReservationStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateManualReservationDto } from '../dto/create-manual-reservation.dto';
import { ReservationAllocationService } from './reservation-allocation.service';
import { ReservationAvailabilityService } from './reservation-availability.service';
import { ReservationPricingService } from './reservation-pricing.service';

const INVENTORY_BLOCKING_STATUSES: ReservationStatus[] = [
  ReservationStatus.PENDING_APPROVAL,
  ReservationStatus.APPROVED_AWAITING_PAYMENT,
  ReservationStatus.CONFIRMED,
  ReservationStatus.CHECKED_IN,
];

@Injectable()
export class ReservationManualService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly availabilityService: ReservationAvailabilityService,
    private readonly pricingService: ReservationPricingService,
    private readonly allocationService: ReservationAllocationService,
  ) {}

  async create(
    dto: CreateManualReservationDto,
    adminId: string,
  ) {
    const availability =
      await this.availabilityService.validateReservationRequest({
        checkIn: dto.checkIn,
        checkOut: dto.checkOut,
        rooms: dto.rooms,
      });

    const pricing =
      await this.pricingService.calculateReservationPrice({
        checkIn: dto.checkIn,
        checkOut: dto.checkOut,
        rooms: dto.rooms.map((room) => ({
          roomTypeId: room.roomTypeId,
          quantity: room.quantity,
        })),
      });

    const checkInDate = this.parseDate(dto.checkIn);
    const checkOutDate = this.parseDate(dto.checkOut);

    const isComplimentary = dto.isComplimentary ?? false;

    const calculatedTotalPrice = new Prisma.Decimal(
      pricing.totalPrice,
    );

    const totalPrice = isComplimentary
      ? new Prisma.Decimal(0)
      : dto.customTotalPrice !== undefined
        ? new Prisma.Decimal(dto.customTotalPrice)
        : calculatedTotalPrice;

    const subtotalPrice = isComplimentary
      ? new Prisma.Decimal(0)
      : calculatedTotalPrice;

    const discountAmount = isComplimentary
      ? calculatedTotalPrice
      : Prisma.Decimal.max(
          calculatedTotalPrice.minus(totalPrice),
          new Prisma.Decimal(0),
        );

    if (
      !isComplimentary &&
      totalPrice.greaterThan(calculatedTotalPrice)
    ) {
      throw new ConflictException({
        code: 'CUSTOM_PRICE_ABOVE_CALCULATED_TOTAL',
        message:
          'Prețul manual nu poate fi mai mare decât prețul calculat. Pentru costuri suplimentare trebuie folosită o funcționalitate separată.',
        calculatedTotalPrice: calculatedTotalPrice.toNumber(),
        customTotalPrice: totalPrice.toNumber(),
      });
    }

    try {
      return await this.prisma.$transaction(
        async (transaction) => {
          await this.assertInventoryAvailableInTransaction(
            transaction,
            checkInDate,
            checkOutDate,
            dto.rooms,
          );

          const guest = await transaction.guest.create({
            data: {
              firstName: dto.guest.firstName.trim(),
              lastName: dto.guest.lastName.trim(),
              email: dto.guest.email.trim().toLowerCase(),
              phone: dto.guest.phone.trim(),
              country: dto.guest.country?.trim(),
            },
          });

          const reservation =
            await transaction.reservation.create({
              data: {
                guestId: guest.id,
                status: ReservationStatus.CONFIRMED,
                source: ReservationSource.MANUAL_ADMIN,
                locale: dto.locale ?? Locale.RO,

                checkInDate,
                checkOutDate,
                checkInTime: '14:00',
                checkOutTime: '10:00',

                adults: availability.totalAdults,
                nights: pricing.nights,

                subtotalPrice,
                discountAmount,
                totalPrice,

                depositPercentage: isComplimentary ? 0 : 50,
                depositAmount: isComplimentary
                  ? 0
                  : totalPrice
                      .mul(50)
                      .div(100)
                      .toDecimalPlaces(2),

                /*
                 * Confirmată administrativ, dar fără plată online.
                 * Pentru o rezervare negratuită, suma poate fi
                 * încasată ulterior la locație.
                 */
                paidAmount: 0,

                isComplimentary,

                createdByAdminId: adminId,
                approvedByAdminId: adminId,

                guestNotes: dto.guestNotes?.trim(),
                adminNotes: this.buildAdminNotes(
                  dto.adminNotes,
                  calculatedTotalPrice,
                  totalPrice,
                  isComplimentary,
                ),

                approvedAt: new Date(),
                confirmedAt: new Date(),

                approvalExpiresAt: null,
                paymentExpiresAt: null,
              },
            });

          const reservationRoomData =
            pricing.rooms.flatMap((pricedRoom) => {
              const selectedRoom = dto.rooms.find(
                (room) =>
                  room.roomTypeId === pricedRoom.roomTypeId,
              );

              if (!selectedRoom) {
                throw new ConflictException({
                  code: 'ROOM_SELECTION_MISMATCH',
                  message:
                    'Selecția apartamentelor nu corespunde calculului de preț.',
                });
              }

              const roomSubtotal = isComplimentary
                ? new Prisma.Decimal(0)
                : this.calculateRoomSubtotal({
                    pricedRoomSubtotal: new Prisma.Decimal(
                      pricedRoom.pricePerUnit,
                    ),
                    calculatedReservationTotal:
                      calculatedTotalPrice,
                    finalReservationTotal: totalPrice,
                  });

              return Array.from(
                {
                  length: pricedRoom.quantity,
                },
                () => ({
                  reservationId: reservation.id,
                  roomTypeId: pricedRoom.roomTypeId,
                  roomId: null,

                  adults: selectedRoom.adultsPerRoom,

                  weekdayNights: pricedRoom.weekdayNights,
                  weekendNights: pricedRoom.weekendNights,
                  nights: pricedRoom.nights,

                  weekdayPricePerNight: isComplimentary
                    ? 0
                    : pricedRoom.weekdayAveragePrice,

                  weekendPricePerNight: isComplimentary
                    ? 0
                    : pricedRoom.weekendAveragePrice,

                  subtotal: roomSubtotal,
                }),
              );
            });

          await transaction.reservationRoom.createMany({
            data: reservationRoomData,
          });

          const allocation =
            await this.allocationService.allocateRoomsInTransaction(
              transaction,
              reservation.id,
            );

          const createdReservation =
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

                createdByAdmin: {
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
            id: createdReservation.id,
            status: createdReservation.status,
            source: createdReservation.source,

            checkIn: this.formatDate(
              createdReservation.checkInDate,
            ),

            checkOut: this.formatDate(
              createdReservation.checkOutDate,
            ),

            nights: createdReservation.nights,
            adults: createdReservation.adults,

            isComplimentary:
              createdReservation.isComplimentary,

            calculatedPrice:
              calculatedTotalPrice.toNumber(),

            subtotalPrice:
              createdReservation.subtotalPrice.toNumber(),

            discountAmount:
              createdReservation.discountAmount.toNumber(),

            totalPrice:
              createdReservation.totalPrice.toNumber(),

            depositAmount:
              createdReservation.depositAmount.toNumber(),

            paidAmount:
              createdReservation.paidAmount.toNumber(),

            guest: {
              id: createdReservation.guest.id,
              firstName:
                createdReservation.guest.firstName,
              lastName:
                createdReservation.guest.lastName,
              email: createdReservation.guest.email,
              phone: createdReservation.guest.phone,
            },

            rooms: createdReservation.rooms.map(
              (reservationRoom) => ({
                reservationRoomId: reservationRoom.id,

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
                      code: reservationRoom.room.code,
                      name: reservationRoom.room.name,
                      tvDeviceId:
                        reservationRoom.room.tvDeviceId,
                    }
                  : null,
              }),
            ),

            allocatedRooms: allocation.allocatedRooms,

            createdByAdmin:
              createdReservation.createdByAdmin,

            confirmedAt:
              createdReservation.confirmedAt?.toISOString() ??
              null,

            message: isComplimentary
              ? 'Rezervarea gratuită a fost creată și confirmată.'
              : 'Rezervarea manuală a fost creată și confirmată.',
          };
        },
        {
          isolationLevel:
            Prisma.TransactionIsolationLevel.Serializable,
        },
      );
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2034'
      ) {
        throw new ConflictException({
          code: 'CONCURRENT_MANUAL_RESERVATION_CONFLICT',
          message:
            'Disponibilitatea s-a modificat în timpul creării rezervării. Verifică din nou perioada.',
        });
      }

      throw error;
    }
  }

  private async assertInventoryAvailableInTransaction(
    transaction: Prisma.TransactionClient,
    checkInDate: Date,
    checkOutDate: Date,
    selections: CreateManualReservationDto['rooms'],
  ): Promise<void> {
    for (const selection of selections) {
      const roomType = await transaction.roomType.findUnique({
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

      if (selection.adultsPerRoom > roomType.maxAdults) {
        throw new ConflictException({
          code: 'ROOM_CAPACITY_EXCEEDED',
          message: `Capacitatea maximă pentru ${roomType.nameRo} este de ${roomType.maxAdults} adulți.`,
          roomTypeId: roomType.id,
          maximumAdults: roomType.maxAdults,
          requestedAdultsPerRoom: selection.adultsPerRoom,
        });
      }

      const [
        assignedReservationRooms,
        unassignedReservationRooms,
        blockedPeriods,
        externalEvents,
      ] = await Promise.all([
        transaction.reservationRoom.findMany({
          where: {
            roomTypeId: selection.roomTypeId,
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
          },
        }),

        transaction.reservationRoom.count({
          where: {
            roomTypeId: selection.roomTypeId,
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
        }),

        transaction.blockedPeriod.findMany({
          where: {
            room: {
              roomTypeId: selection.roomTypeId,
              isActive: true,
            },
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
        }),

        transaction.externalCalendarEvent.findMany({
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

      const unavailablePhysicalRoomIds = new Set<string>();

      for (const assignedRoom of assignedReservationRooms) {
        if (assignedRoom.roomId) {
          unavailablePhysicalRoomIds.add(
            assignedRoom.roomId,
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
          code: 'INSUFFICIENT_AVAILABILITY',
          message: `Pentru ${roomType.nameRo} mai sunt disponibile doar ${availableUnits} unități.`,
          roomTypeId: roomType.id,
          requestedUnits: selection.quantity,
          availableUnits,
        });
      }
    }
  }

  private calculateRoomSubtotal(params: {
    pricedRoomSubtotal: Prisma.Decimal;
    calculatedReservationTotal: Prisma.Decimal;
    finalReservationTotal: Prisma.Decimal;
  }): Prisma.Decimal {
    if (
      params.calculatedReservationTotal.lessThanOrEqualTo(0)
    ) {
      return new Prisma.Decimal(0);
    }

    const priceRatio = params.finalReservationTotal.div(
      params.calculatedReservationTotal,
    );

    return params.pricedRoomSubtotal
      .mul(priceRatio)
      .toDecimalPlaces(2);
  }

  private buildAdminNotes(
    notes: string | undefined,
    calculatedTotal: Prisma.Decimal,
    finalTotal: Prisma.Decimal,
    isComplimentary: boolean,
  ): string {
    const entries: string[] = [];

    if (notes?.trim()) {
      entries.push(notes.trim());
    }

    if (isComplimentary) {
      entries.push(
        `Rezervare gratuită. Prețul calculat de sistem înainte de gratuitate: ${calculatedTotal.toFixed(
          2,
        )} RON.`,
      );
    } else if (!calculatedTotal.equals(finalTotal)) {
      entries.push(
        `Preț calculat de sistem: ${calculatedTotal.toFixed(
          2,
        )} RON. Preț final stabilit de administrator: ${finalTotal.toFixed(
          2,
        )} RON.`,
      );
    }

    return entries.join('\n');
  }

  private parseDate(value: string): Date {
    return new Date(`${value}T00:00:00.000Z`);
  }

  private formatDate(value: Date): string {
    return value.toISOString().slice(0, 10);
  }
}
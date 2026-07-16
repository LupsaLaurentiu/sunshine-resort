import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Locale,
  Prisma,
  ReservationSource,
  ReservationStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { FindReservationsQueryDto } from './dto/find-reservations-query.dto';
import { ReservationAvailabilityService } from './services/reservation-availability.service';
import { ReservationPricingService } from './services/reservation-pricing.service';
import { ReservationStatusService } from './services/reservation-status.service';
import type { CreateReservationResponse } from './types/create-reservation-response.type';
import type { ReservationListResponse } from './types/reservation-list-response.type';
import { ReservationNotificationService } from './services/reservation-notification.service';

const INVENTORY_BLOCKING_STATUSES: ReservationStatus[] = [
  ReservationStatus.PENDING_APPROVAL,
  ReservationStatus.APPROVED_AWAITING_PAYMENT,
  ReservationStatus.CONFIRMED,
  ReservationStatus.CHECKED_IN,
];

@Injectable()
export class ReservationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly availabilityService: ReservationAvailabilityService,
    private readonly pricingService: ReservationPricingService,
    private readonly statusService: ReservationStatusService,
    private readonly reservationNotificationService: ReservationNotificationService,
  ) {}

  async create(
    dto: CreateReservationDto,
  ): Promise<CreateReservationResponse> {
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

    const statusUpdate =
      this.statusService.buildInitialPendingStatus();

    try {
      const reservation = await this.prisma.$transaction(
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

          const createdReservation =
            await transaction.reservation.create({
              data: {
                guestId: guest.id,
                status: statusUpdate.status,
                source: ReservationSource.DIRECT_WEBSITE,
                locale: dto.locale ?? Locale.RO,

                checkInDate,
                checkOutDate,
                checkInTime: '14:00',
                checkOutTime: '10:00',

                adults: availability.totalAdults,
                nights: pricing.nights,

                subtotalPrice: pricing.subtotalPrice,
                discountAmount: pricing.discountAmount,
                totalPrice: pricing.totalPrice,

                depositPercentage: 50,
                depositAmount: pricing.depositAmount,
                paidAmount: 0,

                guestNotes: dto.guestNotes?.trim(),

                approvalExpiresAt:
                  statusUpdate.approvalExpiresAt,

                paymentExpiresAt: null,
              },
            });

          const reservationRoomData =
            pricing.rooms.flatMap((pricedRoom) => {
              const selectedRoom = dto.rooms.find(
                (room) =>
                  room.roomTypeId ===
                  pricedRoom.roomTypeId,
              );

              if (!selectedRoom) {
                throw new ConflictException({
                  code: 'ROOM_SELECTION_MISMATCH',
                  message:
                    'Selecția apartamentelor nu corespunde calculului de preț.',
                });
              }

              return Array.from(
                {
                  length: pricedRoom.quantity,
                },
                () => ({
                  reservationId:
                    createdReservation.id,

                  roomTypeId:
                    pricedRoom.roomTypeId,

                  roomId: null,

                  adults:
                    selectedRoom.adultsPerRoom,

                  weekdayNights:
                    pricedRoom.weekdayNights,

                  weekendNights:
                    pricedRoom.weekendNights,

                  nights:
                    pricedRoom.nights,

                  weekdayPricePerNight:
                    pricedRoom.weekdayAveragePrice,

                  weekendPricePerNight:
                    pricedRoom.weekendAveragePrice,

                  subtotal:
                    pricedRoom.pricePerUnit,
                }),
              );
            });

          await transaction.reservationRoom.createMany({
            data: reservationRoomData,
          });

          return transaction.reservation.findUniqueOrThrow({
            where: {
              id: createdReservation.id,
            },
            include: {
              guest: true,

              rooms: {
                include: {
                  roomType: true,
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

      if (!reservation.approvalExpiresAt) {
        throw new ConflictException(
          'Termenul de aprobare al rezervării nu a fost configurat.',
        );
      }

      const roomNames = reservation.rooms.map(
        (reservationRoom) =>
          reservation.locale === Locale.EN
            ? reservationRoom.roomType.nameEn
            : reservationRoom.roomType.nameRo,
      );

      await this.reservationNotificationService.sendReservationCreated(
        {
          reservationId: reservation.id,

          guest: {
            firstName: reservation.guest.firstName,
            email: reservation.guest.email,
          },

          locale: reservation.locale,

          checkInDate: reservation.checkInDate,
          checkOutDate: reservation.checkOutDate,

          nights: reservation.nights,
          adults: reservation.adults,

          roomNames,

          approvalExpiresAt:
            reservation.approvalExpiresAt,
        },
      );

      return {
        id: reservation.id,
        status: reservation.status,

        checkIn: this.formatDate(
          reservation.checkInDate,
        ),

        checkOut: this.formatDate(
          reservation.checkOutDate,
        ),

        nights: reservation.nights,
        adults: reservation.adults,

        totalPrice:
          reservation.totalPrice.toNumber(),

        depositAmount:
          reservation.depositAmount.toNumber(),

        approvalExpiresAt:
          reservation.approvalExpiresAt.toISOString(),

        message:
          'Cererea de rezervare a fost înregistrată și așteaptă aprobarea administratorului.',
      };
    } catch (error: unknown) {
      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2034'
      ) {
        throw new ConflictException({
          code: 'CONCURRENT_RESERVATION_CONFLICT',
          message:
            'Disponibilitatea s-a modificat între timp. Verifică din nou perioada selectată.',
        });
      }

      throw error;
    }
  }

  async findAll(
    query: FindReservationsQueryDto,
  ): Promise<ReservationListResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const fromDate = query.from
      ? this.parseDate(query.from)
      : undefined;

    const toDate = query.to
      ? this.parseDate(query.to)
      : undefined;

    const where: Prisma.ReservationWhereInput = {
      ...(query.status && {
        status: query.status,
      }),

      ...(query.source && {
        source: query.source,
      }),

      ...(fromDate &&
        toDate && {
          checkInDate: {
            lt: toDate,
          },
          checkOutDate: {
            gt: fromDate,
          },
        }),

      ...(fromDate &&
        !toDate && {
          checkOutDate: {
            gt: fromDate,
          },
        }),

      ...(!fromDate &&
        toDate && {
          checkInDate: {
            lt: toDate,
          },
        }),

      ...(query.search && {
        OR: [
          {
            guest: {
              firstName: {
                contains: query.search.trim(),
                mode: 'insensitive',
              },
            },
          },
          {
            guest: {
              lastName: {
                contains: query.search.trim(),
                mode: 'insensitive',
              },
            },
          },
          {
            guest: {
              email: {
                contains: query.search.trim(),
                mode: 'insensitive',
              },
            },
          },
          {
            guest: {
              phone: {
                contains: query.search.trim(),
              },
            },
          },
        ],
      }),
    };

    const [reservations, totalItems] =
      await this.prisma.$transaction([
        this.prisma.reservation.findMany({
          where,
          skip,
          take: limit,
          include: {
            guest: true,
            rooms: {
              include: {
                roomType: true,
                room: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),

        this.prisma.reservation.count({
          where,
        }),
      ]);

    return {
      items: reservations.map((reservation) => {
        const roomTypeMap = new Map<
          string,
          {
            id: string;
            nameRo: string;
            nameEn: string;
            quantity: number;
          }
        >();

        for (const reservationRoom of reservation.rooms) {
          const existing = roomTypeMap.get(
            reservationRoom.roomTypeId,
          );

          if (existing) {
            existing.quantity += 1;
          } else {
            roomTypeMap.set(reservationRoom.roomTypeId, {
              id: reservationRoom.roomType.id,
              nameRo: reservationRoom.roomType.nameRo,
              nameEn: reservationRoom.roomType.nameEn,
              quantity: 1,
            });
          }
        }

        return {
          id: reservation.id,
          status: reservation.status,
          source: reservation.source,

          checkIn: this.formatDate(
            reservation.checkInDate,
          ),
          checkOut: this.formatDate(
            reservation.checkOutDate,
          ),

          nights: reservation.nights,
          adults: reservation.adults,

          totalPrice: reservation.totalPrice.toNumber(),
          paidAmount: reservation.paidAmount.toNumber(),

          guest: {
            firstName: reservation.guest.firstName,
            lastName: reservation.guest.lastName,
            email: reservation.guest.email,
            phone: reservation.guest.phone,
          },

          roomTypes: Array.from(roomTypeMap.values()),

          createdAt: reservation.createdAt.toISOString(),
          approvalExpiresAt:
            reservation.approvalExpiresAt?.toISOString() ??
            null,
          paymentExpiresAt:
            reservation.paymentExpiresAt?.toISOString() ??
            null,
        };
      }),

      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  async findById(id: string) {
    const reservation =
      await this.prisma.reservation.findUnique({
        where: {
          id,
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

          createdByAdmin: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
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

          changes: {
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

    return {
      ...reservation,

      checkInDate: this.formatDate(
        reservation.checkInDate,
      ),

      checkOutDate: this.formatDate(
        reservation.checkOutDate,
      ),

      subtotalPrice:
        reservation.subtotalPrice.toNumber(),

      discountAmount:
        reservation.discountAmount.toNumber(),

      totalPrice: reservation.totalPrice.toNumber(),

      depositPercentage:
        reservation.depositPercentage.toNumber(),

      depositAmount:
        reservation.depositAmount.toNumber(),

      paidAmount:
        reservation.paidAmount.toNumber(),

      rooms: reservation.rooms.map((room) => ({
        ...room,

        weekdayPricePerNight:
          room.weekdayPricePerNight.toNumber(),

        weekendPricePerNight:
          room.weekendPricePerNight.toNumber(),

        subtotal: room.subtotal.toNumber(),
      })),

      payments: reservation.payments.map(
        (payment) => ({
          ...payment,
          amount: payment.amount.toNumber(),
        }),
      ),

      changes: reservation.changes.map((change) => ({
        ...change,

        oldSubtotalPrice:
          change.oldSubtotalPrice.toNumber(),

        newSubtotalPrice:
          change.newSubtotalPrice.toNumber(),

        priceDifference:
          change.priceDifference.toNumber(),

        amountDue:
          change.amountDue.toNumber(),

        retainedAmount:
          change.retainedAmount.toNumber(),
      })),
    };
  }

  private async assertInventoryAvailableInTransaction(
    transaction: Prisma.TransactionClient,
    checkInDate: Date,
    checkOutDate: Date,
    selections: CreateReservationDto['rooms'],
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

      for (const reservationRoom of assignedReservationRooms) {
        if (reservationRoom.roomId) {
          unavailablePhysicalRoomIds.add(
            reservationRoom.roomId,
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

  private parseDate(value: string): Date {
    return new Date(`${value}T00:00:00.000Z`);
  }

  private formatDate(value: Date): string {
    return value.toISOString().slice(0, 10);
  }
}
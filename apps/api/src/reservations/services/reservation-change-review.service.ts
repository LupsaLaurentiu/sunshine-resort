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
import { ApproveReservationChangeDto } from '../dto/approve-reservation-change.dto';
import { RejectReservationChangeDto } from '../dto/reject-reservation-change.dto';
import { ReservationAllocationService } from './reservation-allocation.service';
import {
  ReservationPricingService,
  type ReservationPrice,
} from './reservation-pricing.service';

const INVENTORY_BLOCKING_STATUSES: ReservationStatus[] = [
  ReservationStatus.PENDING_APPROVAL,
  ReservationStatus.APPROVED_AWAITING_PAYMENT,
  ReservationStatus.CONFIRMED,
  ReservationStatus.CHECKED_IN,
];

type CurrentRoomSelection = {
  roomTypeId: string;
  quantity: number;
  adultsPerRoom: number;
};

@Injectable()
export class ReservationChangeReviewService {
  private static readonly PAYMENT_WINDOW_HOURS = 24;

  constructor(
    private readonly prisma: PrismaService,
    private readonly pricingService: ReservationPricingService,
    private readonly allocationService: ReservationAllocationService,
  ) {}

  async approve(
    reservationChangeId: string,
    adminId: string,
    dto: ApproveReservationChangeDto,
  ) {
    const now = new Date();

    await this.expireIfNecessary(
      reservationChangeId,
      now,
    );

    const change =
      await this.prisma.reservationChange.findUnique({
        where: {
          id: reservationChangeId,
        },
        include: {
          reservation: {
            include: {
              rooms: true,
            },
          },
        },
      });

    if (!change) {
      throw new NotFoundException(
        'Solicitarea de modificare nu a fost găsită.',
      );
    }

    if (
      change.status !==
      ReservationChangeStatus.PENDING_APPROVAL
    ) {
      throw new ConflictException({
        code: 'RESERVATION_CHANGE_NOT_PENDING',
        message:
          'Solicitarea de modificare nu mai așteaptă aprobarea.',
        currentStatus: change.status,
      });
    }

    if (
      change.reservation.status !==
      ReservationStatus.CONFIRMED
    ) {
      throw new ConflictException({
        code: 'RESERVATION_NOT_CONFIRMED',
        message:
          'Rezervarea originală nu mai este confirmată.',
        currentStatus: change.reservation.status,
      });
    }

    const roomSelections =
      this.buildCurrentRoomSelections(
        change.reservation.rooms,
      );

    await this.assertAvailabilityForChange({
      reservationId: change.reservation.id,
      checkInDate: change.requestedCheckInDate,
      checkOutDate: change.requestedCheckOutDate,
      selections: roomSelections,
    });

    const pricing =
      await this.pricingService.calculateReservationPrice({
        checkIn: this.formatDate(
          change.requestedCheckInDate,
        ),
        checkOut: this.formatDate(
          change.requestedCheckOutDate,
        ),
        rooms: roomSelections.map((selection) => ({
          roomTypeId: selection.roomTypeId,
          quantity: selection.quantity,
        })),
      });

    const oldSubtotalPrice =
      change.reservation.subtotalPrice;

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

    if (amountDue.greaterThan(0)) {
      const updateResult =
        await this.prisma.reservationChange.updateMany({
          where: {
            id: change.id,
            status:
              ReservationChangeStatus.PENDING_APPROVAL,
          },
          data: {
            status:
              ReservationChangeStatus.APPROVED_AWAITING_PAYMENT,

            approvedByAdminId: adminId,
            approvedAt: now,

            oldSubtotalPrice,
            newSubtotalPrice,
            priceDifference,
            amountDue,
            retainedAmount,

            adminNotes: dto.adminNotes?.trim(),

            approvalExpiresAt: null,
            paymentExpiresAt: this.addHours(
              now,
              ReservationChangeReviewService.PAYMENT_WINDOW_HOURS,
            ),
          },
        });

      if (updateResult.count !== 1) {
        throw new ConflictException({
          code: 'RESERVATION_CHANGE_APPROVAL_CONFLICT',
          message:
            'Solicitarea a fost modificată între timp.',
        });
      }

      const updatedChange =
        await this.prisma.reservationChange.findUniqueOrThrow({
          where: {
            id: change.id,
          },
        });

      return {
        id: updatedChange.id,
        reservationId:
          updatedChange.reservationId,
        status: updatedChange.status,

        oldSubtotalPrice:
          updatedChange.oldSubtotalPrice.toNumber(),

        newSubtotalPrice:
          updatedChange.newSubtotalPrice.toNumber(),

        priceDifference:
          updatedChange.priceDifference.toNumber(),

        amountDue:
          updatedChange.amountDue.toNumber(),

        retainedAmount:
          updatedChange.retainedAmount.toNumber(),

        paymentExpiresAt:
          updatedChange.paymentExpiresAt?.toISOString() ??
          null,

        appliedImmediately: false,

        message:
          'Modificarea a fost aprobată. Clientul trebuie să achite diferența de preț.',
      };
    }

    return this.applyChangeWithoutAdditionalPayment({
      reservationChangeId: change.id,
      adminId,
      adminNotes: dto.adminNotes,
      pricing,
      roomSelections,
      now,
    });
  }

  async reject(
    reservationChangeId: string,
    adminId: string,
    dto: RejectReservationChangeDto,
  ) {
    const now = new Date();

    await this.expireIfNecessary(
      reservationChangeId,
      now,
    );

    const updateResult =
      await this.prisma.reservationChange.updateMany({
        where: {
          id: reservationChangeId,
          status:
            ReservationChangeStatus.PENDING_APPROVAL,
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
          status: ReservationChangeStatus.REJECTED,

          rejectedByAdminId: adminId,
          rejectedAt: now,

          rejectionReason: dto.reason.trim(),
          adminNotes: dto.adminNotes?.trim(),

          approvalExpiresAt: null,
          paymentExpiresAt: null,
        },
      });

    if (updateResult.count !== 1) {
      const existing =
        await this.prisma.reservationChange.findUnique({
          where: {
            id: reservationChangeId,
          },
          select: {
            id: true,
            status: true,
          },
        });

      if (!existing) {
        throw new NotFoundException(
          'Solicitarea de modificare nu a fost găsită.',
        );
      }

      throw new ConflictException({
        code: 'RESERVATION_CHANGE_REJECTION_CONFLICT',
        message:
          'Solicitarea a fost modificată între timp și nu mai poate fi respinsă.',
        currentStatus: existing.status,
      });
    }

    const rejectedChange =
      await this.prisma.reservationChange.findUniqueOrThrow({
        where: {
          id: reservationChangeId,
        },
      });

    return {
      id: rejectedChange.id,
      reservationId:
        rejectedChange.reservationId,
      status: rejectedChange.status,

      rejectionReason:
        rejectedChange.rejectionReason,

      adminNotes: rejectedChange.adminNotes,

      rejectedAt:
        rejectedChange.rejectedAt?.toISOString() ??
        null,

      message:
        'Solicitarea de modificare a fost respinsă. Rezervarea originală a rămas neschimbată.',
    };
  }

  /**
   * Este apelată de webhook după plata diferenței.
   * Metoda rulează în aceeași tranzacție Prisma ca plata.
   */
  async applyPaidChangeInTransaction(
    transaction: Prisma.TransactionClient,
    reservationChangeId: string,
    now = new Date(),
  ) {
    const change =
      await transaction.reservationChange.findUnique({
        where: {
          id: reservationChangeId,
        },
        include: {
          reservation: {
            include: {
              rooms: {
                orderBy: {
                  id: 'asc',
                },
              },
            },
          },
        },
      });

    if (!change) {
      throw new NotFoundException(
        'Solicitarea de modificare nu a fost găsită.',
      );
    }

    if (
      change.status === ReservationChangeStatus.APPLIED
    ) {
      return {
        reservationId: change.reservationId,
        reservationChangeId: change.id,
        alreadyApplied: true,
        allocatedRooms: [],
      };
    }

    if (
      change.status !==
      ReservationChangeStatus.APPROVED_AWAITING_PAYMENT
    ) {
      throw new ConflictException({
        code: 'RESERVATION_CHANGE_NOT_AWAITING_PAYMENT',
        message:
          'Solicitarea nu așteaptă plata diferenței.',
        currentStatus: change.status,
      });
    }

    if (
      change.reservation.status !==
      ReservationStatus.CONFIRMED
    ) {
      throw new ConflictException({
        code: 'RESERVATION_NOT_CONFIRMED',
        message:
          'Rezervarea originală nu mai este confirmată.',
        currentStatus: change.reservation.status,
      });
    }

    if (
      change.paymentExpiresAt &&
      change.paymentExpiresAt <= now
    ) {
      throw new ConflictException({
        code: 'RESERVATION_CHANGE_PAYMENT_EXPIRED',
        message:
          'Termenul pentru plata diferenței a expirat.',
      });
    }

    const roomSelections =
      this.buildCurrentRoomSelections(
        change.reservation.rooms,
      );

    await this.assertAvailabilityForChangeInTransaction(
      transaction,
      {
        reservationId: change.reservation.id,
        checkInDate: change.requestedCheckInDate,
        checkOutDate: change.requestedCheckOutDate,
        selections: roomSelections,
      },
    );

    const pricing =
      await this.pricingService.calculateReservationPrice({
        checkIn: this.formatDate(
          change.requestedCheckInDate,
        ),
        checkOut: this.formatDate(
          change.requestedCheckOutDate,
        ),
        rooms: roomSelections.map((selection) => ({
          roomTypeId: selection.roomTypeId,
          quantity: selection.quantity,
        })),
      });

    const recalculatedSubtotal = new Prisma.Decimal(
      pricing.subtotalPrice,
    );

    const recalculatedDifference =
      recalculatedSubtotal.minus(
        change.reservation.subtotalPrice,
      );

    if (recalculatedDifference.lessThanOrEqualTo(0)) {
      throw new ConflictException({
        code: 'ADDITIONAL_PAYMENT_NO_LONGER_REQUIRED',
        message:
          'În urma recalculării, modificarea nu mai necesită plată suplimentară.',
      });
    }

    if (!recalculatedDifference.equals(change.amountDue)) {
      throw new ConflictException({
        code: 'RESERVATION_CHANGE_PRICE_CHANGED',
        message:
          'Prețul modificării s-a schimbat după aprobarea administratorului.',
        approvedAmountDue: change.amountDue.toNumber(),
        recalculatedAmountDue:
          recalculatedDifference.toNumber(),
      });
    }

    await transaction.reservationRoom.updateMany({
      where: {
        reservationId: change.reservation.id,
      },
      data: {
        roomId: null,
      },
    });

    await this.updateReservationRoomPricing(
      transaction,
      change.reservation.id,
      pricing,
      roomSelections,
    );

    const requestedNights =
      this.getDifferenceInDays(
        change.requestedCheckInDate,
        change.requestedCheckOutDate,
      );

    const newTotalPrice = new Prisma.Decimal(
      pricing.totalPrice,
    );

    await transaction.reservation.update({
      where: {
        id: change.reservation.id,
      },
      data: {
        checkInDate: change.requestedCheckInDate,
        checkOutDate: change.requestedCheckOutDate,
        nights: requestedNights,

        subtotalPrice: pricing.subtotalPrice,
        discountAmount: pricing.discountAmount,
        totalPrice: newTotalPrice,

        depositAmount: newTotalPrice
          .mul(change.reservation.depositPercentage)
          .div(100)
          .toDecimalPlaces(2),
      },
    });

    const allocation =
      await this.allocationService.allocateRoomsInTransaction(
        transaction,
        change.reservation.id,
      );

    const updateResult =
      await transaction.reservationChange.updateMany({
        where: {
          id: change.id,
          status:
            ReservationChangeStatus.APPROVED_AWAITING_PAYMENT,
        },
        data: {
          status: ReservationChangeStatus.APPLIED,
          appliedAt: now,

          newSubtotalPrice: pricing.subtotalPrice,
          priceDifference: recalculatedDifference,
          amountDue: recalculatedDifference,
          retainedAmount: 0,

          approvalExpiresAt: null,
          paymentExpiresAt: null,
        },
      });

    if (updateResult.count !== 1) {
      throw new ConflictException({
        code: 'RESERVATION_CHANGE_APPLICATION_CONFLICT',
        message:
          'Modificarea a fost procesată simultan de o altă operațiune.',
      });
    }

    return {
      reservationId: change.reservation.id,
      reservationChangeId: change.id,
      alreadyApplied: false,
      allocatedRooms: allocation.allocatedRooms,
    };
  }

  private async applyChangeWithoutAdditionalPayment(
    params: {
      reservationChangeId: string;
      adminId: string;
      adminNotes?: string;
      pricing: ReservationPrice;
      roomSelections: CurrentRoomSelection[];
      now: Date;
    },
  ) {
    try {
      return await this.prisma.$transaction(
        async (transaction) => {
          const change =
            await transaction.reservationChange.findUnique({
              where: {
                id: params.reservationChangeId,
              },
              include: {
                reservation: {
                  include: {
                    rooms: {
                      orderBy: {
                        id: 'asc',
                      },
                    },
                  },
                },
              },
            });

          if (!change) {
            throw new NotFoundException(
              'Solicitarea de modificare nu a fost găsită.',
            );
          }

          if (
            change.status !==
            ReservationChangeStatus.PENDING_APPROVAL
          ) {
            throw new ConflictException({
              code: 'RESERVATION_CHANGE_CANNOT_BE_APPLIED',
              message:
                'Solicitarea nu mai poate fi aplicată direct.',
              currentStatus: change.status,
            });
          }

          if (
            change.reservation.status !==
            ReservationStatus.CONFIRMED
          ) {
            throw new ConflictException({
              code: 'RESERVATION_NOT_CONFIRMED',
              message:
                'Rezervarea originală nu mai este confirmată.',
              currentStatus:
                change.reservation.status,
            });
          }

          await this.assertAvailabilityForChangeInTransaction(
            transaction,
            {
              reservationId:
                change.reservation.id,
              checkInDate:
                change.requestedCheckInDate,
              checkOutDate:
                change.requestedCheckOutDate,
              selections: params.roomSelections,
            },
          );

          await transaction.reservationRoom.updateMany({
            where: {
              reservationId:
                change.reservation.id,
            },
            data: {
              roomId: null,
            },
          });

          await this.updateReservationRoomPricing(
            transaction,
            change.reservation.id,
            params.pricing,
            params.roomSelections,
          );

          const requestedNights =
            this.getDifferenceInDays(
              change.requestedCheckInDate,
              change.requestedCheckOutDate,
            );

          /**
           * Dacă noua perioadă este mai ieftină,
           * clientului nu i se rambursează diferența.
           */
          const finalTotalPrice = Prisma.Decimal.max(
            change.reservation.totalPrice,
            new Prisma.Decimal(
              params.pricing.totalPrice,
            ),
          );

          await transaction.reservation.update({
            where: {
              id: change.reservation.id,
            },
            data: {
              checkInDate:
                change.requestedCheckInDate,

              checkOutDate:
                change.requestedCheckOutDate,

              nights: requestedNights,

              subtotalPrice:
                params.pricing.subtotalPrice,

              discountAmount:
                params.pricing.discountAmount,

              totalPrice: finalTotalPrice,

              depositAmount: finalTotalPrice
                .mul(
                  change.reservation
                    .depositPercentage,
                )
                .div(100)
                .toDecimalPlaces(2),
            },
          });

          const allocation =
            await this.allocationService.allocateRoomsInTransaction(
              transaction,
              change.reservation.id,
            );

          const newSubtotal = new Prisma.Decimal(
            params.pricing.subtotalPrice,
          );

          const priceDifference =
            newSubtotal.minus(
              change.reservation.subtotalPrice,
            );

          const retainedAmount = Prisma.Decimal.max(
            priceDifference.negated(),
            new Prisma.Decimal(0),
          );

          const updatedChange =
            await transaction.reservationChange.update({
              where: {
                id: change.id,
              },
              data: {
                status:
                  ReservationChangeStatus.APPLIED,

                approvedByAdminId:
                  params.adminId,

                approvedAt: params.now,
                appliedAt: params.now,

                oldSubtotalPrice:
                  change.reservation.subtotalPrice,

                newSubtotalPrice:
                  params.pricing.subtotalPrice,

                priceDifference,
                amountDue: 0,
                retainedAmount,

                adminNotes:
                  params.adminNotes?.trim(),

                approvalExpiresAt: null,
                paymentExpiresAt: null,
              },
            });

          const updatedReservation =
            await transaction.reservation.findUniqueOrThrow({
              where: {
                id: change.reservation.id,
              },
              include: {
                rooms: {
                  include: {
                    roomType: true,
                    room: true,
                  },
                },
              },
            });

          return {
            id: updatedChange.id,
            reservationId:
              updatedReservation.id,
            status: updatedChange.status,

            requestedPeriod: {
              checkIn: this.formatDate(
                updatedReservation.checkInDate,
              ),
              checkOut: this.formatDate(
                updatedReservation.checkOutDate,
              ),
            },

            nights: updatedReservation.nights,

            subtotalPrice:
              updatedReservation.subtotalPrice.toNumber(),

            totalPrice:
              updatedReservation.totalPrice.toNumber(),

            amountDue:
              updatedChange.amountDue.toNumber(),

            retainedAmount:
              updatedChange.retainedAmount.toNumber(),

            appliedAt:
              updatedChange.appliedAt?.toISOString() ??
              null,

            allocatedRooms:
              allocation.allocatedRooms,

            appliedImmediately: true,

            message:
              'Modificarea a fost aprobată și aplicată. Nu este necesară o plată suplimentară.',
          };
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
          code: 'CONCURRENT_RESERVATION_CHANGE_APPLICATION',
          message:
            'Aplicarea modificării a intrat în conflict cu o altă operațiune.',
        });
      }

      throw error;
    }
  }

  private async updateReservationRoomPricing(
    transaction: Prisma.TransactionClient,
    reservationId: string,
    pricing: ReservationPrice,
    selections: CurrentRoomSelection[],
  ): Promise<void> {
    for (const pricedRoom of pricing.rooms) {
      const reservationRooms =
        await transaction.reservationRoom.findMany({
          where: {
            reservationId,
            roomTypeId: pricedRoom.roomTypeId,
          },
          orderBy: {
            id: 'asc',
          },
        });

      const selection = selections.find(
        (item) =>
          item.roomTypeId ===
          pricedRoom.roomTypeId,
      );

      if (!selection) {
        throw new ConflictException({
          code: 'ROOM_SELECTION_MISMATCH',
          message:
            'Configurația apartamentelor nu corespunde calculului de preț.',
        });
      }

      if (
        reservationRooms.length !==
        pricedRoom.quantity
      ) {
        throw new ConflictException({
          code: 'RESERVATION_ROOM_QUANTITY_MISMATCH',
          message:
            'Numărul apartamentelor din rezervare nu corespunde calculului de preț.',
          roomTypeId: pricedRoom.roomTypeId,
        });
      }

      for (const reservationRoom of reservationRooms) {
        await transaction.reservationRoom.update({
          where: {
            id: reservationRoom.id,
          },
          data: {
            adults: selection.adultsPerRoom,

            weekdayNights:
              pricedRoom.weekdayNights,

            weekendNights:
              pricedRoom.weekendNights,

            nights: pricedRoom.nights,

            weekdayPricePerNight:
              pricedRoom.weekdayAveragePrice,

            weekendPricePerNight:
              pricedRoom.weekendAveragePrice,

            subtotal: pricedRoom.pricePerUnit,
          },
        });
      }
    }
  }

  private async expireIfNecessary(
    reservationChangeId: string,
    now: Date,
  ): Promise<void> {
    const change =
      await this.prisma.reservationChange.findUnique({
        where: {
          id: reservationChangeId,
        },
        select: {
          id: true,
          status: true,
          approvalExpiresAt: true,
        },
      });

    if (!change) {
      throw new NotFoundException(
        'Solicitarea de modificare nu a fost găsită.',
      );
    }

    if (
      change.status ===
        ReservationChangeStatus.PENDING_APPROVAL &&
      change.approvalExpiresAt &&
      change.approvalExpiresAt <= now
    ) {
      await this.prisma.reservationChange.updateMany({
        where: {
          id: change.id,
          status:
            ReservationChangeStatus.PENDING_APPROVAL,
        },
        data: {
          status:
            ReservationChangeStatus.EXPIRED,
          expiredAt: now,
          approvalExpiresAt: null,
          paymentExpiresAt: null,
        },
      });

      throw new ConflictException({
        code: 'RESERVATION_CHANGE_APPROVAL_EXPIRED',
        message:
          'Termenul pentru aprobarea modificării a expirat.',
      });
    }
  }

  private buildCurrentRoomSelections(
    reservationRooms: Array<{
      roomTypeId: string;
      adults: number;
    }>,
  ): CurrentRoomSelection[] {
    const selections = new Map<
      string,
      CurrentRoomSelection
    >();

    for (const reservationRoom of reservationRooms) {
      const existing = selections.get(
        reservationRoom.roomTypeId,
      );

      if (existing) {
        existing.quantity += 1;

        existing.adultsPerRoom = Math.max(
          existing.adultsPerRoom,
          reservationRoom.adults,
        );
      } else {
        selections.set(
          reservationRoom.roomTypeId,
          {
            roomTypeId:
              reservationRoom.roomTypeId,
            quantity: 1,
            adultsPerRoom:
              reservationRoom.adults,
          },
        );
      }
    }

    return Array.from(selections.values());
  }

  private async assertAvailabilityForChange(
    params: {
      reservationId: string;
      checkInDate: Date;
      checkOutDate: Date;
      selections: CurrentRoomSelection[];
    },
  ): Promise<void> {
    await this.assertAvailabilityForChangeUsingClient(
      this.prisma,
      params,
    );
  }

  private async assertAvailabilityForChangeInTransaction(
    transaction: Prisma.TransactionClient,
    params: {
      reservationId: string;
      checkInDate: Date;
      checkOutDate: Date;
      selections: CurrentRoomSelection[];
    },
  ): Promise<void> {
    await this.assertAvailabilityForChangeUsingClient(
      transaction,
      params,
    );
  }

  private async assertAvailabilityForChangeUsingClient(
    client:
      | PrismaService
      | Prisma.TransactionClient,
    params: {
      reservationId: string;
      checkInDate: Date;
      checkOutDate: Date;
      selections: CurrentRoomSelection[];
    },
  ): Promise<void> {
    for (const selection of params.selections) {
      const roomType =
        await client.roomType.findUnique({
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
        selection.adultsPerRoom >
        roomType.maxAdults
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
        client.reservationRoom.findMany({
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

        client.reservationRoom.count({
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

        client.blockedPeriod.findMany({
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

        client.externalCalendarEvent.findMany({
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
                roomTypeId:
                  selection.roomTypeId,
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

      const unavailableRoomIds =
        new Set<string>();

      for (const assigned of assignedReservationRooms) {
        if (assigned.roomId) {
          unavailableRoomIds.add(
            assigned.roomId,
          );
        }
      }

      for (const blockedPeriod of blockedPeriods) {
        unavailableRoomIds.add(
          blockedPeriod.roomId,
        );
      }

      for (const externalEvent of externalEvents) {
        unavailableRoomIds.add(
          externalEvent.externalCalendar.roomId,
        );
      }

      const availableUnits = Math.max(
        0,
        roomType.rooms.length -
          unavailableRoomIds.size -
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

  private addHours(
    value: Date,
    hours: number,
  ): Date {
    return new Date(
      value.getTime() +
        hours * 60 * 60 * 1000,
    );
  }

  private getDifferenceInDays(
    startDate: Date,
    endDate: Date,
  ): number {
    const millisecondsPerDay =
      24 * 60 * 60 * 1000;

    return Math.floor(
      (endDate.getTime() -
        startDate.getTime()) /
        millisecondsPerDay,
    );
  }

  private formatDate(value: Date): string {
    return value.toISOString().slice(0, 10);
  }
}
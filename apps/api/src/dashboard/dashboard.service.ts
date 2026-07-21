import { Injectable } from '@nestjs/common';
import {
  PaymentStatus,
  Prisma,
  ReservationStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type {
  AdminDashboardResponse,
  DashboardPaymentItem,
  DashboardReservationItem,
} from './dashboard.types';

const DASHBOARD_LIST_LIMIT = 6;

const PAYMENT_EXPIRING_SOON_MINUTES =
  6 * 60;

const reservationInclude = {
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
} satisfies Prisma.ReservationInclude;

type DashboardReservationRecord =
  Prisma.ReservationGetPayload<{
    include: typeof reservationInclude;
  }>;

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getDashboard(): Promise<AdminDashboardResponse> {
    const generatedAt = new Date();

    const today =
      this.getTodayInRomania();

    const [
      pendingApprovalCount,
      awaitingPaymentCount,
      checkInsTodayCount,
      checkOutsTodayCount,

      activeRoomsCount,
      occupiedRoomRecords,

      payments,

      pendingApprovalReservations,
      awaitingPaymentReservations,
      checkInReservations,
      checkOutReservations,
      recentReservations,
    ] = await Promise.all([
      this.prisma.reservation.count({
        where: {
          status:
            ReservationStatus.PENDING_APPROVAL,

          cancelledAt: null,
          rejectedAt: null,
        },
      }),

      this.prisma.reservation.count({
        where: {
          status:
            ReservationStatus.APPROVED_AWAITING_PAYMENT,

          cancelledAt: null,
          rejectedAt: null,
        },
      }),

      this.prisma.reservation.count({
        where: {
          checkInDate: today,

          status: {
            in: [
              ReservationStatus.CONFIRMED,
              ReservationStatus.CHECKED_IN,
            ],
          },

          cancelledAt: null,
        },
      }),

      this.prisma.reservation.count({
        where: {
          checkOutDate: today,

          status: {
            in: [
              ReservationStatus.CHECKED_IN,
              ReservationStatus.CHECKED_OUT,
            ],
          },

          cancelledAt: null,
        },
      }),

      this.prisma.room.count({
        where: {
          isActive: true,
        },
      }),

      /*
       * Numărăm camerele fizice ocupate în prezent.
       *
       * Statusul CHECKED_IN reprezintă sursa operațională
       * pentru ocuparea efectivă a resortului.
       */
      this.prisma.reservationRoom.findMany({
        where: {
          roomId: {
            not: null,
          },

          reservation: {
            status:
              ReservationStatus.CHECKED_IN,

            cancelledAt: null,
          },

          room: {
            isActive: true,
          },
        },

        select: {
          roomId: true,
        },

        distinct: [
          'roomId',
        ],
      }),

      /*
       * Pentru venitul net includem plățile achitate și
       * plățile rambursate.
       *
       * Venitul fiecărei plăți este:
       * amount - refundedAmount.
       */
      this.prisma.payment.findMany({
        where: {
          status: {
            in: [
              PaymentStatus.PAID,
              PaymentStatus.REFUNDED,
            ],
          },
        },

        select: {
          amount: true,
          refundedAmount: true,
          currency: true,
        },
      }),

      this.prisma.reservation.findMany({
        where: {
          status:
            ReservationStatus.PENDING_APPROVAL,

          cancelledAt: null,
          rejectedAt: null,
        },

        include:
          reservationInclude,

        orderBy: [
          {
            approvalExpiresAt: 'asc',
          },
          {
            createdAt: 'asc',
          },
        ],

        take:
          DASHBOARD_LIST_LIMIT,
      }),

      this.prisma.reservation.findMany({
        where: {
          status:
            ReservationStatus.APPROVED_AWAITING_PAYMENT,

          cancelledAt: null,
          rejectedAt: null,
        },

        include:
          reservationInclude,

        orderBy: [
          {
            paymentExpiresAt: 'asc',
          },
          {
            approvedAt: 'asc',
          },
        ],

        take:
          DASHBOARD_LIST_LIMIT,
      }),

      this.prisma.reservation.findMany({
        where: {
          checkInDate: today,

          status: {
            in: [
              ReservationStatus.CONFIRMED,
              ReservationStatus.CHECKED_IN,
            ],
          },

          cancelledAt: null,
        },

        include:
          reservationInclude,

        orderBy: [
          {
            checkInTime: 'asc',
          },
          {
            createdAt: 'asc',
          },
        ],

        take:
          DASHBOARD_LIST_LIMIT,
      }),

      this.prisma.reservation.findMany({
        where: {
          checkOutDate: today,

          status: {
            in: [
              ReservationStatus.CHECKED_IN,
              ReservationStatus.CHECKED_OUT,
            ],
          },

          cancelledAt: null,
        },

        include:
          reservationInclude,

        orderBy: [
          {
            checkOutTime: 'asc',
          },
          {
            createdAt: 'asc',
          },
        ],

        take:
          DASHBOARD_LIST_LIMIT,
      }),

      this.prisma.reservation.findMany({
        include:
          reservationInclude,

        orderBy: {
          createdAt: 'desc',
        },

        take:
          DASHBOARD_LIST_LIMIT,
      }),
    ]);

    const occupiedRoomsCount =
      occupiedRoomRecords.length;

    const occupancyRate =
      activeRoomsCount > 0
        ? this.roundToTwoDecimals(
            (
              occupiedRoomsCount /
              activeRoomsCount
            ) * 100,
          )
        : 0;

    const revenueSummary =
      this.calculatePaidRevenue(
        payments,
      );

    return {
      generatedAt:
        generatedAt.toISOString(),

      metrics: {
        pendingApprovalCount,
        awaitingPaymentCount,

        checkInsTodayCount,
        checkOutsTodayCount,

        occupiedRoomsCount,
        activeRoomsCount,
        occupancyRate,

        paidRevenue:
          revenueSummary.amount,

        currency:
          revenueSummary.currency,
      },

      pendingApprovals:
        pendingApprovalReservations.map(
          (reservation) =>
            this.mapReservation(
              reservation,
            ),
        ),

      awaitingPayments:
        awaitingPaymentReservations.map(
          (reservation) =>
            this.mapPaymentReservation(
              reservation,
              generatedAt,
            ),
        ),

      checkInsToday:
        checkInReservations.map(
          (reservation) =>
            this.mapReservation(
              reservation,
            ),
        ),

      checkOutsToday:
        checkOutReservations.map(
          (reservation) =>
            this.mapReservation(
              reservation,
            ),
        ),

      recentReservations:
        recentReservations.map(
          (reservation) =>
            this.mapReservation(
              reservation,
            ),
        ),
    };
  }

  private mapReservation(
    reservation: DashboardReservationRecord,
  ): DashboardReservationItem {
    const totalPrice =
      reservation.totalPrice.toNumber();

    const paidAmount =
      reservation.paidAmount.toNumber();

    const remainingAmount =
      Math.max(
        0,
        new Prisma.Decimal(
          reservation.totalPrice,
        )
          .minus(
            reservation.paidAmount,
          )
          .toNumber(),
      );

    const guestName =
      [
        reservation.guest.firstName,
        reservation.guest.lastName,
      ]
        .filter(Boolean)
        .join(' ')
        .trim();

    const roomNames =
      reservation.rooms.map(
        (reservationRoom) =>
          reservation.locale === 'EN'
            ? reservationRoom.roomType
                .nameEn
            : reservationRoom.roomType
                .nameRo,
      );

    const allocatedRooms =
      reservation.rooms.flatMap(
        (reservationRoom) => {
          if (
            !reservationRoom.room
          ) {
            return [];
          }

          return [
            {
              id:
                reservationRoom.room.id,

              name:
                reservationRoom.room.name,

              code:
                reservationRoom.room.code,

              roomTypeName:
                reservation.locale ===
                'EN'
                  ? reservationRoom
                      .roomType.nameEn
                  : reservationRoom
                      .roomType.nameRo,
            },
          ];
        },
      );

    return {
      id:
        reservation.id,

      status:
        reservation.status,

      source:
        reservation.source,

      guestName,

      guestEmail:
        reservation.guest.email,

      guestPhone:
        reservation.guest.phone,

      checkIn:
        this.formatDate(
          reservation.checkInDate,
        ),

      checkOut:
        this.formatDate(
          reservation.checkOutDate,
        ),

      checkInTime:
        reservation.checkInTime,

      checkOutTime:
        reservation.checkOutTime,

      nights:
        reservation.nights,

      adults:
        reservation.adults,

      roomNames,
      allocatedRooms,

      totalPrice,
      paidAmount,
      remainingAmount,

      approvalExpiresAt:
        reservation.approvalExpiresAt?.toISOString() ??
        null,

      paymentExpiresAt:
        reservation.paymentExpiresAt?.toISOString() ??
        null,

      createdAt:
        reservation.createdAt.toISOString(),
    };
  }

  private mapPaymentReservation(
    reservation: DashboardReservationRecord,
    currentDate: Date,
  ): DashboardPaymentItem {
    const baseItem =
      this.mapReservation(
        reservation,
      );

    const paymentExpiration =
      reservation.paymentExpiresAt;

    const paymentExpiresInMinutes =
      paymentExpiration
        ? Math.ceil(
            (
              paymentExpiration.getTime() -
              currentDate.getTime()
            ) /
              (
                60 *
                1000
              ),
          )
        : null;

    const isPaymentExpiringSoon =
      paymentExpiresInMinutes !== null &&
      paymentExpiresInMinutes <=
        PAYMENT_EXPIRING_SOON_MINUTES;

    return {
      ...baseItem,

      paymentExpiresAt:
        paymentExpiration?.toISOString() ??
        null,

      isPaymentExpiringSoon,

      paymentExpiresInMinutes,
    };
  }

  private calculatePaidRevenue(
    payments: Array<{
      amount: Prisma.Decimal;
      refundedAmount: Prisma.Decimal;
      currency: string;
    }>,
  ): {
    amount: number;
    currency: string;
  } {
    if (
      payments.length === 0
    ) {
      return {
        amount: 0,
        currency: 'RON',
      };
    }

    const currencies =
      new Set(
        payments.map(
          (payment) =>
            payment.currency,
        ),
      );

    /*
     * În versiunea actuală Sunshine Resort folosește RON.
     * Dacă pe viitor vor exista mai multe valute, dashboard-ul
     * trebuie extins cu agregări separate pe monedă.
     */
    const currency =
      currencies.size === 1
        ? payments[0].currency
        : 'MIXED';

    const netRevenue =
      payments.reduce(
        (total, payment) => {
          const netPaymentAmount =
            Prisma.Decimal.max(
              payment.amount.minus(
                payment.refundedAmount,
              ),
              new Prisma.Decimal(0),
            );

          return total.plus(
            netPaymentAmount,
          );
        },
        new Prisma.Decimal(0),
      );

    return {
      amount:
        netRevenue.toNumber(),

      currency,
    };
  }

  /**
   * Câmpurile checkInDate și checkOutDate sunt date calendaristice
   * fără oră. Generăm data locală din România în forma utilizată
   * de Prisma pentru coloanele @db.Date.
   */
  private getTodayInRomania(): Date {
    const dateString =
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

    return new Date(
      `${dateString}T00:00:00.000Z`,
    );
  }

  private formatDate(
    value: Date,
  ): string {
    return value
      .toISOString()
      .slice(0, 10);
  }

  private roundToTwoDecimals(
    value: number,
  ): number {
    return Math.round(
      value * 100,
    ) / 100;
  }
}
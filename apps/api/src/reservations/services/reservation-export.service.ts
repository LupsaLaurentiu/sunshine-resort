import {
  Injectable,
  StreamableFile,
} from '@nestjs/common';
import {
  PaymentStatus,
  Prisma,
} from '@prisma/client';
import ExcelJS from 'exceljs';

import { PrismaService } from '../../prisma/prisma.service';
import { FindReservationsQueryDto } from '../dto/find-reservations-query.dto';

const EXCEL_CONTENT_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

type ReservationExportResult = {
  file: StreamableFile;
  fileName: string;
};

@Injectable()
export class ReservationExportService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async exportReservations(
    query: FindReservationsQueryDto,
  ): Promise<ReservationExportResult> {
    const where =
      this.buildReservationWhere(query);

    const reservations =
      await this.prisma.reservation.findMany({
        where,

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
            where: {
              status: PaymentStatus.PAID,
            },

            orderBy: {
              paidAt: 'desc',
            },
          },

          approvedByAdmin: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },

        orderBy: [
          {
            checkInDate: 'asc',
          },
          {
            createdAt: 'desc',
          },
        ],
      });

    const workbook =
      new ExcelJS.Workbook();

    workbook.creator =
      'Sunshine Resort';

    workbook.company =
      'Sunshine Resort';

    workbook.subject =
      'Export rezervări';

    workbook.title =
      'Rezervări Sunshine Resort';

    workbook.created =
      new Date();

    const worksheet =
      workbook.addWorksheet(
        'Rezervări',
        {
          views: [
            {
              state: 'frozen',
              ySplit: 1,
            },
          ],

          properties: {
            defaultRowHeight: 22,
          },

          pageSetup: {
            orientation: 'landscape',
            fitToPage: true,
            fitToWidth: 1,
            fitToHeight: 0,
          },
        },
      );

    worksheet.columns = [
      {
        header: 'ID rezervare',
        key: 'reservationId',
        width: 28,
      },
      {
        header: 'Status',
        key: 'status',
        width: 28,
      },
      {
        header: 'Sursă',
        key: 'source',
        width: 20,
      },
      {
        header: 'Nume client',
        key: 'guestName',
        width: 26,
      },
      {
        header: 'Email',
        key: 'email',
        width: 32,
      },
      {
        header: 'Telefon',
        key: 'phone',
        width: 18,
      },
      {
        header: 'Check-in',
        key: 'checkIn',
        width: 14,
      },
      {
        header: 'Check-out',
        key: 'checkOut',
        width: 14,
      },
      {
        header: 'Nopți',
        key: 'nights',
        width: 10,
      },
      {
        header: 'Tip apartament',
        key: 'roomTypes',
        width: 34,
      },
      {
        header: 'Apartament alocat',
        key: 'allocatedRooms',
        width: 30,
      },
      {
        header: 'Nr. apartamente',
        key: 'roomQuantity',
        width: 18,
      },
      {
        header: 'Adulți',
        key: 'adults',
        width: 12,
      },
      {
        header: 'Adulți suplimentari',
        key: 'extraAdults',
        width: 22,
      },
      {
        header: 'Total',
        key: 'totalPrice',
        width: 16,
      },
      {
        header: 'Achitat',
        key: 'paidAmount',
        width: 16,
      },
      {
        header: 'Rest de plată',
        key: 'remainingAmount',
        width: 18,
      },
      {
        header: 'Tip plată',
        key: 'paymentTypes',
        width: 24,
      },
      {
        header: 'Data rezervării',
        key: 'createdAt',
        width: 20,
      },
      {
        header: 'Aprobat de',
        key: 'approvedBy',
        width: 24,
      },
    ];

    for (
      const reservation of reservations
    ) {
      const roomTypes =
        this.aggregateRoomTypes(
          reservation.rooms,
        );

      const allocatedRooms =
        reservation.rooms
          .filter(
            (reservationRoom) =>
              reservationRoom.room,
          )
          .map(
            (reservationRoom) =>
              `${reservationRoom.room!.code} – ${reservationRoom.room!.name}`,
          )
          .join(', ');

      const extraAdults =
        reservation.rooms.filter(
          (reservationRoom) =>
            reservationRoom.hasExtraAdult,
        ).length;

      const paymentTypes =
        Array.from(
          new Set(
            reservation.payments.map(
              (payment) =>
                payment.type,
            ),
          ),
        ).join(', ');

      const totalPrice =
        reservation.totalPrice.toNumber();

      const paidAmount =
        reservation.paidAmount.toNumber();

      const remainingAmount =
        Math.max(
          0,
          new Prisma.Decimal(
            totalPrice,
          )
            .minus(paidAmount)
            .toDecimalPlaces(2)
            .toNumber(),
        );

      const approvedBy =
        reservation.approvedByAdmin
          ? `${reservation.approvedByAdmin.firstName} ${reservation.approvedByAdmin.lastName}`.trim()
          : '';

      worksheet.addRow({
        reservationId:
          reservation.id,

        status:
          this.formatStatus(
            reservation.status,
          ),

        source:
          this.formatSource(
            reservation.source,
          ),

        guestName:
          `${reservation.guest.firstName} ${reservation.guest.lastName}`.trim(),

        email:
          reservation.guest.email,

        phone:
          reservation.guest.phone,

        checkIn:
          reservation.checkInDate,

        checkOut:
          reservation.checkOutDate,

        nights:
          reservation.nights,

        roomTypes,

        allocatedRooms:
          allocatedRooms ||
          'Nealocat',

        roomQuantity:
          reservation.rooms.length,

        adults:
          reservation.adults,

        extraAdults,

        totalPrice,
        paidAmount,
        remainingAmount,

        paymentTypes:
          paymentTypes ||
          'Fără plată',

        createdAt:
          reservation.createdAt,

        approvedBy,
      });
    }

    this.styleWorksheet(
      worksheet,
    );

    worksheet.autoFilter = {
      from: {
        row: 1,
        column: 1,
      },

      to: {
        row: 1,
        column:
          worksheet.columnCount,
      },
    };

    const generatedBuffer =
      await workbook.xlsx.writeBuffer();

    const buffer =
      Buffer.isBuffer(
        generatedBuffer,
      )
        ? generatedBuffer
        : Buffer.from(
            generatedBuffer,
          );

    const fileName =
      this.buildFileName(
        query,
      );

    return {
      file: new StreamableFile(
        buffer,
        {
          type:
            EXCEL_CONTENT_TYPE,

          disposition:
            `attachment; filename="${fileName}"`,

          length:
            buffer.length,
        },
      ),

      fileName,
    };
  }

  private buildReservationWhere(
    query: FindReservationsQueryDto,
  ): Prisma.ReservationWhereInput {
    const fromDate =
      query.from
        ? this.parseDate(
            query.from,
          )
        : undefined;

    const toDate =
      query.to
        ? this.parseDate(
            query.to,
          )
        : undefined;

    const search =
      query.search?.trim();

    return {
      ...(query.status && {
        status:
          query.status,
      }),

      ...(query.source && {
        source:
          query.source,
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

      ...(search && {
        OR: [
          {
            guest: {
              firstName: {
                contains:
                  search,

                mode:
                  'insensitive',
              },
            },
          },
          {
            guest: {
              lastName: {
                contains:
                  search,

                mode:
                  'insensitive',
              },
            },
          },
          {
            guest: {
              email: {
                contains:
                  search,

                mode:
                  'insensitive',
              },
            },
          },
          {
            guest: {
              phone: {
                contains:
                  search,
              },
            },
          },
        ],
      }),
    };
  }

  private aggregateRoomTypes(
    reservationRooms: Array<{
      roomTypeId: string;

      roomType: {
        nameRo: string;
      };
    }>,
  ): string {
    const roomTypes =
      new Map<
        string,
        {
          name: string;
          quantity: number;
        }
      >();

    for (
      const reservationRoom of
        reservationRooms
    ) {
      const existing =
        roomTypes.get(
          reservationRoom.roomTypeId,
        );

      if (existing) {
        existing.quantity += 1;
      } else {
        roomTypes.set(
          reservationRoom.roomTypeId,
          {
            name:
              reservationRoom.roomType
                .nameRo,

            quantity: 1,
          },
        );
      }
    }

    return Array.from(
      roomTypes.values(),
    )
      .map(
        (roomType) =>
          `${roomType.name} × ${roomType.quantity}`,
      )
      .join(', ');
  }

  private styleWorksheet(
    worksheet: ExcelJS.Worksheet,
  ): void {
    const headerRow =
      worksheet.getRow(1);

    headerRow.height = 30;

    headerRow.eachCell(
      (cell) => {
        cell.font = {
          bold: true,
          color: {
            argb: 'FFF5F2EB',
          },
          size: 11,
        };

        cell.fill = {
          type: 'pattern',
          pattern: 'solid',

          fgColor: {
            argb: 'FF19150F',
          },
        };

        cell.alignment = {
          vertical: 'middle',
          horizontal: 'center',
          wrapText: true,
        };

        cell.border = {
          bottom: {
            style: 'thin',

            color: {
              argb: 'FFC9A96E',
            },
          },
        };
      },
    );

    worksheet.eachRow(
      (
        row,
        rowNumber,
      ) => {
        if (rowNumber === 1) {
          return;
        }

        row.alignment = {
          vertical: 'middle',
          wrapText: true,
        };

        row.eachCell(
          (cell) => {
            cell.border = {
              bottom: {
                style: 'hair',

                color: {
                  argb: 'FFD9D3C8',
                },
              },
            };
          },
        );

        if (
          rowNumber % 2 === 0
        ) {
          row.eachCell(
            (cell) => {
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',

                fgColor: {
                  argb: 'FFF7F4EE',
                },
              };
            },
          );
        }

        this.styleStatusCell(
          row.getCell('status'),
        );
      },
    );

    worksheet.getColumn(
      'checkIn',
    ).numFmt = 'dd.mm.yyyy';

    worksheet.getColumn(
      'checkOut',
    ).numFmt = 'dd.mm.yyyy';

    worksheet.getColumn(
      'createdAt',
    ).numFmt =
      'dd.mm.yyyy hh:mm';

    worksheet.getColumn(
      'totalPrice',
    ).numFmt =
      '#,##0.00 "RON"';

    worksheet.getColumn(
      'paidAmount',
    ).numFmt =
      '#,##0.00 "RON"';

    worksheet.getColumn(
      'remainingAmount',
    ).numFmt =
      '#,##0.00 "RON"';

    worksheet.getColumn(
      'nights',
    ).alignment = {
      horizontal: 'center',
    };

    worksheet.getColumn(
      'roomQuantity',
    ).alignment = {
      horizontal: 'center',
    };

    worksheet.getColumn(
      'adults',
    ).alignment = {
      horizontal: 'center',
    };

    worksheet.getColumn(
      'extraAdults',
    ).alignment = {
      horizontal: 'center',
    };
  }

  private styleStatusCell(
    cell: ExcelJS.Cell,
  ): void {
    const value =
      String(
        cell.value ?? '',
      );

    let color =
      'FFF4E7B2';

    if (
      value === 'Confirmată' ||
      value === 'Check-in'
    ) {
      color =
        'FFC6EFCE';
    }

    if (
      value === 'Respinsă' ||
      value === 'Anulată' ||
      value === 'Expirată'
    ) {
      color =
        'FFFFC7CE';
    }

    if (
      value ===
      'Așteaptă plata'
    ) {
      color =
        'FFFFEB9C';
    }

    if (
      value ===
      'Check-out'
    ) {
      color =
        'FFD9EAD3';
    }

    cell.fill = {
      type: 'pattern',
      pattern: 'solid',

      fgColor: {
        argb: color,
      },
    };

    cell.font = {
      bold: true,
    };

    cell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
  }

  private formatStatus(
    status: string,
  ): string {
    const labels:
      Record<string, string> = {
        PENDING_APPROVAL:
          'Așteaptă aprobarea',

        APPROVED_AWAITING_PAYMENT:
          'Așteaptă plata',

        CONFIRMED:
          'Confirmată',

        REJECTED:
          'Respinsă',

        CANCELLED:
          'Anulată',

        EXPIRED:
          'Expirată',

        CHECKED_IN:
          'Check-in',

        CHECKED_OUT:
          'Check-out',
      };

    return labels[status] ??
      status;
  }

  private formatSource(
    source: string,
  ): string {
    const labels:
      Record<string, string> = {
        DIRECT_WEBSITE:
          'Website',

        MANUAL_ADMIN:
          'Manual',

        BOOKING_COM:
          'Booking.com',
      };

    return labels[source] ??
      source;
  }

  private buildFileName(
    query: FindReservationsQueryDto,
  ): string {
    const now =
      new Date();

    const timestamp =
      [
        now.getFullYear(),

        String(
          now.getMonth() + 1,
        ).padStart(2, '0'),

        String(
          now.getDate(),
        ).padStart(2, '0'),
      ].join('-');

    if (
      query.from ||
      query.to
    ) {
      const from =
        query.from ??
        'inceput';

      const to =
        query.to ??
        'prezent';

      return `rezervari_${from}_${to}.xlsx`;
    }

    return `rezervari_${timestamp}.xlsx`;
  }

  private parseDate(
    value: string,
  ): Date {
    return new Date(
      `${value}T00:00:00.000Z`,
    );
  }
}
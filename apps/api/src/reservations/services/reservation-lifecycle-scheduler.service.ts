import {
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import {
  ReservationStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReservationLifecycleSchedulerService
  implements OnModuleInit
{
  private readonly logger = new Logger(
    ReservationLifecycleSchedulerService.name,
  );

  private isProcessing = false;

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit(): void {
    this.logger.log(
      'Serviciul automat de check-in și check-out este activ.',
    );
  }

  /**
   * Rulează în fiecare minut, în fusul orar al resortului.
   */
  @Cron('0 * * * * *', {
    name: 'reservation-lifecycle-scheduler',
    timeZone: 'Europe/Bucharest',
  })
  async processReservationLifecycle(): Promise<void> {
    if (this.isProcessing) {
      this.logger.warn(
        'Procesarea automată check-in/check-out rulează deja.',
      );

      return;
    }

    this.isProcessing = true;

    try {
      const currentDate =
        this.getCurrentRomanianDate();

      const currentTime =
        this.getCurrentRomanianTime();

      const checkedInCount =
        await this.processAutomaticCheckIns(
          currentDate,
          currentTime,
        );

      const checkedOutCount =
        await this.processAutomaticCheckOuts(
          currentDate,
          currentTime,
        );

      if (
        checkedInCount > 0 ||
        checkedOutCount > 0
      ) {
        this.logger.log(
          [
            'Procesare automată finalizată.',
            `checkIn=${checkedInCount}`,
            `checkOut=${checkedOutCount}`,
          ].join(' '),
        );
      }
    } catch (error: unknown) {
      this.logger.error(
        'Procesarea automată check-in/check-out a eșuat.',
        error instanceof Error
          ? error.stack
          : String(error),
      );
    } finally {
      this.isProcessing = false;
    }
  }

  private async processAutomaticCheckIns(
    currentDate: Date,
    currentTime: string,
  ): Promise<number> {
    const reservations =
      await this.prisma.reservation.findMany({
        where: {
          status:
            ReservationStatus.CONFIRMED,

          checkInDate: {
            lte: currentDate,
          },

          checkedInAt: null,

          cancelledAt: null,
        },

        select: {
          id: true,
          checkInDate: true,
          checkInTime: true,
        },
      });

    let processed = 0;

    for (const reservation of reservations) {
      const checkInDatePassed =
        reservation.checkInDate.getTime() <
        currentDate.getTime();

      const checkInTimeReached =
        reservation.checkInDate.getTime() ===
          currentDate.getTime() &&
        reservation.checkInTime <= currentTime;

      if (
        !checkInDatePassed &&
        !checkInTimeReached
      ) {
        continue;
      }

      const checkedInAt = new Date();

      const result =
        await this.prisma.reservation.updateMany({
          where: {
            id: reservation.id,
            status:
              ReservationStatus.CONFIRMED,
            checkedInAt: null,
          },

          data: {
            status:
              ReservationStatus.CHECKED_IN,

            checkedInAt,
          },
        });

      if (result.count === 1) {
        processed += 1;

        this.logger.log(
          `Check-in automat realizat. reservationId=${reservation.id}`,
        );
      }
    }

    return processed;
  }

  private async processAutomaticCheckOuts(
    currentDate: Date,
    currentTime: string,
  ): Promise<number> {
    const reservations =
      await this.prisma.reservation.findMany({
        where: {
          status:
            ReservationStatus.CHECKED_IN,

          checkOutDate: {
            lte: currentDate,
          },

          checkedOutAt: null,

          cancelledAt: null,
        },

        select: {
          id: true,
          checkOutDate: true,
          checkOutTime: true,
        },
      });

    let processed = 0;

    for (const reservation of reservations) {
      const checkOutDatePassed =
        reservation.checkOutDate.getTime() <
        currentDate.getTime();

      const checkOutTimeReached =
        reservation.checkOutDate.getTime() ===
          currentDate.getTime() &&
        reservation.checkOutTime <= currentTime;

      if (
        !checkOutDatePassed &&
        !checkOutTimeReached
      ) {
        continue;
      }

      const checkedOutAt = new Date();

      const result =
        await this.prisma.reservation.updateMany({
          where: {
            id: reservation.id,
            status:
              ReservationStatus.CHECKED_IN,
            checkedOutAt: null,
          },

          data: {
            status:
              ReservationStatus.CHECKED_OUT,

            checkedOutAt,
          },
        });

      if (result.count === 1) {
        processed += 1;

        this.logger.log(
          `Check-out automat realizat. reservationId=${reservation.id}`,
        );
      }
    }

    return processed;
  }

  /**
   * Câmpurile checkInDate/checkOutDate sunt @db.Date.
   * Construim data calendaristică din România la miezul nopții UTC,
   * în aceeași formă folosită de Prisma.
   */
  private getCurrentRomanianDate(): Date {
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

  /**
   * Returnează ora locală HH:mm, compatibilă cu valorile
   * checkInTime și checkOutTime.
   */
  private getCurrentRomanianTime(): string {
    return new Intl.DateTimeFormat(
      'ro-RO',
      {
        timeZone:
          'Europe/Bucharest',

        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
      },
    ).format(new Date());
  }
}
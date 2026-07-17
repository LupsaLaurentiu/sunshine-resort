import {
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  Locale,
  ReservationStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ReservationNotificationService } from './reservation-notification.service';

type ReservationForScheduledEmail = {
  id: string;
  locale: Locale;

  checkInDate: Date;
  checkOutDate: Date;

  checkInTime: string;
  checkOutTime: string;

  nights: number;
  adults: number;

  guest: {
    firstName: string;
    email: string;
  };

  rooms: Array<{
    roomType: {
      nameRo: string;
      nameEn: string;
    };
  }>;
};

@Injectable()
export class ReservationEmailSchedulerService
  implements OnModuleInit
{
  private readonly logger = new Logger(
    ReservationEmailSchedulerService.name,
  );

  private readonly resortAddress: string;
  private readonly resortPhone: string;
  private readonly resortMapsUrl?: string;

  private readonly parkingInstructionsRo?: string;
  private readonly parkingInstructionsEn?: string;

  private readonly accessInstructionsRo?: string;
  private readonly accessInstructionsEn?: string;

  private readonly googleReviewUrl?: string;
  private readonly bookingReviewUrl?: string;
  private readonly directBookingUrlRo?: string;
  private readonly directBookingUrlEn?: string;

  private isProcessing = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly notificationService: ReservationNotificationService,
  ) {
    this.resortAddress =
      this.configService
        .get<string>('RESORT_ADDRESS')
        ?.trim() ||
      'Ogna-Sugatag, Bistrița-Năsăud, România';

    this.resortPhone =
      this.configService
        .get<string>('RESORT_PHONE')
        ?.trim() ||
      '+40 700 000 000';

    this.resortMapsUrl =
      this.readOptionalConfig('RESORT_MAPS_URL');

    this.parkingInstructionsRo =
      this.readOptionalConfig(
        'RESORT_PARKING_INSTRUCTIONS_RO',
      );

    this.parkingInstructionsEn =
      this.readOptionalConfig(
        'RESORT_PARKING_INSTRUCTIONS_EN',
      );

    this.accessInstructionsRo =
      this.readOptionalConfig(
        'RESORT_ACCESS_INSTRUCTIONS_RO',
      );

    this.accessInstructionsEn =
      this.readOptionalConfig(
        'RESORT_ACCESS_INSTRUCTIONS_EN',
      );

    this.googleReviewUrl =
      this.readOptionalConfig(
        'GOOGLE_REVIEW_URL',
      );

    this.bookingReviewUrl =
      this.readOptionalConfig(
        'BOOKING_REVIEW_URL',
      );

    this.directBookingUrlRo =
      this.readOptionalConfig(
        'DIRECT_BOOKING_URL_RO',
      );

    this.directBookingUrlEn =
      this.readOptionalConfig(
        'DIRECT_BOOKING_URL_EN',
      );
  }

  onModuleInit(): void {
    this.logger.log(
      'Serviciul automat pentru reminder-ele rezervărilor este activ.',
    );
  }

  /**
   * Rulează la începutul fiecărei ore.
   *
   * Folosim fusul orar al resortului pentru calculul
   * datelor de 7 zile și 1 zi înainte.
   */
  @Cron(CronExpression.EVERY_HOUR, {
    name: 'reservation-email-scheduler',
    timeZone: 'Europe/Bucharest',
  })
  async processScheduledEmails(): Promise<void> {
    if (this.isProcessing) {
      this.logger.warn(
        'Procesarea emailurilor programate rulează deja. Execuția curentă este omisă.',
      );

      return;
    }

    this.isProcessing = true;

    try {
      const sevenDayResult =
        await this.processSevenDayReminders();

      const oneDayResult =
        await this.processOneDayReminders();

      const postStayResult =
        await this.processPostStayEmails();

      this.logger.log(
        [
          'Procesarea emailurilor programate s-a încheiat.',
          `reminder7zile=${sevenDayResult.sent}/${sevenDayResult.found}`,
          `reminder1zi=${oneDayResult.sent}/${oneDayResult.found}`,
          `postStay=${postStayResult.sent}/${postStayResult.found}`,
        ].join(' '),
      );
    } catch (error: unknown) {
      this.logger.error(
        'Procesarea automată a emailurilor programate a eșuat.',
        error instanceof Error
          ? error.stack
          : String(error),
      );
    } finally {
      this.isProcessing = false;
    }
  }

  private async processSevenDayReminders(): Promise<{
    found: number;
    sent: number;
  }> {
    const targetDate =
      this.getBucharestDatePlusDays(7);

    const reservations =
      await this.prisma.reservation.findMany({
        where: {
          status: {
            in: [
              ReservationStatus.CONFIRMED,
              ReservationStatus.CHECKED_IN,
            ],
          },

          checkInDate: targetDate,

          sevenDayReminderSentAt: null,

          cancelledAt: null,
          rejectedAt: null,
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

        orderBy: {
          checkInDate: 'asc',
        },
      });

    let sent = 0;

    for (const reservation of reservations) {
      const success =
        await this.notificationService.sendSevenDayReminder(
          {
            reservationId:
              reservation.id,

            guest: {
              firstName:
                reservation.guest.firstName,

              email:
                reservation.guest.email,
            },

            locale:
              reservation.locale,

            checkInDate:
              reservation.checkInDate,

            checkOutDate:
              reservation.checkOutDate,

            checkInTime:
              reservation.checkInTime,

            checkOutTime:
              reservation.checkOutTime,

            nights:
              reservation.nights,

            adults:
              reservation.adults,

            roomNames:
              this.getRoomNames(
                reservation,
              ),

            resortAddress:
              this.resortAddress,

            resortPhone:
              this.resortPhone,

            mapsUrl:
              this.resortMapsUrl,
          },
        );

      if (!success) {
        continue;
      }

      const updateResult =
        await this.prisma.reservation.updateMany({
          where: {
            id: reservation.id,
            sevenDayReminderSentAt: null,
          },

          data: {
            sevenDayReminderSentAt:
              new Date(),
          },
        });

      if (updateResult.count === 1) {
        sent += 1;
      }
    }

    return {
      found: reservations.length,
      sent,
    };
  }

  private async processOneDayReminders(): Promise<{
    found: number;
    sent: number;
  }> {
    const targetDate =
      this.getBucharestDatePlusDays(1);

    const reservations =
      await this.prisma.reservation.findMany({
        where: {
          status: ReservationStatus.CONFIRMED,

          checkInDate: targetDate,

          oneDayReminderSentAt: null,

          cancelledAt: null,
          rejectedAt: null,
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

        orderBy: {
          checkInDate: 'asc',
        },
      });

    let sent = 0;

    for (const reservation of reservations) {
      const isEnglish =
        reservation.locale === Locale.EN;

      const success =
        await this.notificationService.sendOneDayReminder(
          {
            reservationId:
              reservation.id,

            guest: {
              firstName:
                reservation.guest.firstName,

              email:
                reservation.guest.email,
            },

            locale:
              reservation.locale,

            checkInDate:
              reservation.checkInDate,

            checkOutDate:
              reservation.checkOutDate,

            checkInTime:
              reservation.checkInTime,

            checkOutTime:
              reservation.checkOutTime,

            roomNames:
              this.getRoomNames(
                reservation,
              ),

            resortAddress:
              this.resortAddress,

            resortPhone:
              this.resortPhone,

            parkingInstructions:
              isEnglish
                ? this.parkingInstructionsEn
                : this.parkingInstructionsRo,

            accessInstructions:
              isEnglish
                ? this.accessInstructionsEn
                : this.accessInstructionsRo,

            mapsUrl:
              this.resortMapsUrl,
          },
        );

      if (!success) {
        continue;
      }

      const updateResult =
        await this.prisma.reservation.updateMany({
          where: {
            id: reservation.id,
            oneDayReminderSentAt: null,
          },

          data: {
            oneDayReminderSentAt:
              new Date(),
          },
        });

      if (updateResult.count === 1) {
        sent += 1;
      }
    }

    return {
      found: reservations.length,
      sent,
    };
  }

  private async processPostStayEmails(): Promise<{
    found: number;
    sent: number;
  }> {
    /*
     * Emailul post-sejur se trimite numai după ce rezervarea
     * a ajuns efectiv în status CHECKED_OUT.
     *
     * Limita de o oră previne trimiterea emailului chiar în
     * momentul exact al operației de check-out.
     */
    const latestEligibleCheckOut =
      new Date(
        Date.now() -
          60 * 60 * 1000,
      );

    const reservations =
      await this.prisma.reservation.findMany({
        where: {
          status:
            ReservationStatus.CHECKED_OUT,

          checkedOutAt: {
            not: null,
            lte: latestEligibleCheckOut,
          },

          postStayEmailSentAt: null,

          cancelledAt: null,
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

        orderBy: {
          checkedOutAt: 'asc',
        },
      });

    let sent = 0;

    for (const reservation of reservations) {
      const isEnglish =
        reservation.locale === Locale.EN;

      const success =
        await this.notificationService.sendPostStay(
          {
            reservationId:
              reservation.id,

            guest: {
              firstName:
                reservation.guest.firstName,

              email:
                reservation.guest.email,
            },

            locale:
              reservation.locale,

            checkInDate:
              reservation.checkInDate,

            checkOutDate:
              reservation.checkOutDate,

            roomNames:
              this.getRoomNames(
                reservation,
              ),

            googleReviewUrl:
              this.googleReviewUrl,

            /*
             * Booking.com permite în general recenzii prin
             * fluxul propriu al rezervării. Configurăm URL-ul
             * doar dacă există unul adecvat.
             */
            bookingReviewUrl:
              this.bookingReviewUrl,

            directBookingUrl:
              isEnglish
                ? this.directBookingUrlEn
                : this.directBookingUrlRo,
          },
        );

      if (!success) {
        continue;
      }

      const updateResult =
        await this.prisma.reservation.updateMany({
          where: {
            id: reservation.id,
            postStayEmailSentAt: null,
          },

          data: {
            postStayEmailSentAt:
              new Date(),
          },
        });

      if (updateResult.count === 1) {
        sent += 1;
      }
    }

    return {
      found: reservations.length,
      sent,
    };
  }

  private getRoomNames(
    reservation: ReservationForScheduledEmail,
  ): string[] {
    return reservation.rooms.map(
      (reservationRoom) =>
        reservation.locale === Locale.EN
          ? reservationRoom.roomType.nameEn
          : reservationRoom.roomType.nameRo,
    );
  }

  /**
   * Returnează data calendaristică din Europe/Bucharest,
   * deplasată cu numărul primit de zile, în forma utilizată
   * de câmpurile Prisma @db.Date.
   */
  private getBucharestDatePlusDays(
    days: number,
  ): Date {
    const currentDateKey =
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

    const currentDate =
      new Date(
        `${currentDateKey}T00:00:00.000Z`,
      );

    currentDate.setUTCDate(
      currentDate.getUTCDate() +
        days,
    );

    return currentDate;
  }

  private readOptionalConfig(
    key: string,
  ): string | undefined {
    const value =
      this.configService
        .get<string>(key)
        ?.trim();

    return value || undefined;
  }
}
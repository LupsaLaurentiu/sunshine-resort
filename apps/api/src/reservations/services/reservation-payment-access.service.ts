import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createHash,
  randomBytes,
  timingSafeEqual,
} from 'crypto';
import {
  Locale,
  PaymentType,
  Prisma,
  ReservationStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export type PreparedPaymentAccess = {
  token: string;
  tokenHash: string;
  paymentUrl: string;
  expiresAt: Date;
};

export type CreatePaymentAccessResult = {
  paymentUrl: string;
  token: string;
  expiresAt: string;
};

export type PublicPaymentReservation = {
  reservationId: string;
  locale: 'RO' | 'EN';
  status: ReservationStatus;

  guestFirstName: string;
  guestLastName: string;

  checkIn: string;
  checkOut: string;

  nights: number;
  adults: number;

  roomNames: string[];

  totalPrice: number;
  depositAmount: number;
  paidAmount: number;
  remainingAmount: number;

  paymentExpiresAt: string;

  availablePaymentTypes: PaymentType[];
};

@Injectable()
export class ReservationPaymentAccessService {
  private readonly frontendBaseUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const frontendBaseUrl =
      this.configService.get<string>(
        'FRONTEND_BASE_URL',
      );

    if (!frontendBaseUrl?.trim()) {
      throw new Error(
        'FRONTEND_BASE_URL is not configured.',
      );
    }

    this.frontendBaseUrl = frontendBaseUrl
      .trim()
      .replace(/\/+$/, '');
  }

  preparePaymentAccess(params: {
    locale: Locale;
    expiresAt: Date;
  }): PreparedPaymentAccess {
    const token = this.generateToken();
    const tokenHash = this.hashToken(token);

    return {
      token,
      tokenHash,
      expiresAt: params.expiresAt,
      paymentUrl: this.buildPaymentUrl(
        token,
        params.locale,
      ),
    };
  }

  async createPaymentAccess(
    reservationId: string,
  ): Promise<CreatePaymentAccessResult> {
    const reservation =
      await this.prisma.reservation.findUnique({
        where: {
          id: reservationId,
        },
        select: {
          id: true,
          locale: true,
          status: true,
          paymentExpiresAt: true,
          isComplimentary: true,
        },
      });

    if (!reservation) {
      throw new NotFoundException(
        'Rezervarea nu a fost găsită.',
      );
    }

    if (reservation.isComplimentary) {
      throw new ConflictException({
        code: 'COMPLIMENTARY_RESERVATION',
        message:
          'Rezervarea gratuită nu necesită acces la plată.',
      });
    }

    if (
      reservation.status !==
      ReservationStatus.APPROVED_AWAITING_PAYMENT
    ) {
      throw new ConflictException({
        code: 'RESERVATION_NOT_AWAITING_PAYMENT',
        message:
          'Rezervarea nu se află în starea de așteptare a plății.',
        currentStatus: reservation.status,
      });
    }

    const now = new Date();

    if (
      !reservation.paymentExpiresAt ||
      reservation.paymentExpiresAt <= now
    ) {
      throw new ConflictException({
        code: 'RESERVATION_PAYMENT_EXPIRED',
        message:
          'Termenul disponibil pentru plată a expirat.',
      });
    }

    const paymentAccess =
      this.preparePaymentAccess({
        locale: reservation.locale,
        expiresAt:
          reservation.paymentExpiresAt,
      });

    await this.prisma.reservation.update({
      where: {
        id: reservation.id,
      },
      data: {
        paymentAccessTokenHash:
          paymentAccess.tokenHash,

        paymentAccessTokenExpiresAt:
          paymentAccess.expiresAt,
      },
    });

    return {
      token: paymentAccess.token,
      paymentUrl: paymentAccess.paymentUrl,
      expiresAt:
        paymentAccess.expiresAt.toISOString(),
    };
  }

  async getReservationByToken(
    token: string,
  ): Promise<PublicPaymentReservation> {
    const normalizedToken =
      this.normalizeAndValidateToken(token);

    const tokenHash =
      this.hashToken(normalizedToken);

    const reservation =
      await this.prisma.reservation.findUnique({
        where: {
          paymentAccessTokenHash: tokenHash,
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

    if (!reservation) {
      throw new UnauthorizedException({
        code: 'PAYMENT_TOKEN_INVALID',
        message:
          'Linkul de plată este invalid.',
      });
    }

    if (
      !reservation.paymentAccessTokenHash ||
      !this.compareHashes(
        tokenHash,
        reservation.paymentAccessTokenHash,
      )
    ) {
      throw new UnauthorizedException({
        code: 'PAYMENT_TOKEN_INVALID',
        message:
          'Linkul de plată este invalid.',
      });
    }

    const now = new Date();

    if (
      !reservation.paymentAccessTokenExpiresAt ||
      reservation.paymentAccessTokenExpiresAt <= now
    ) {
      throw new UnauthorizedException({
        code: 'PAYMENT_TOKEN_EXPIRED',
        message:
          'Linkul de plată a expirat.',
      });
    }

    if (
      reservation.status !==
      ReservationStatus.APPROVED_AWAITING_PAYMENT
    ) {
      throw new ConflictException({
        code: 'RESERVATION_NOT_AWAITING_PAYMENT',
        message:
          'Rezervarea nu mai așteaptă plata.',
        currentStatus: reservation.status,
      });
    }

    if (
      !reservation.paymentExpiresAt ||
      reservation.paymentExpiresAt <= now
    ) {
      throw new ConflictException({
        code: 'RESERVATION_PAYMENT_EXPIRED',
        message:
          'Termenul disponibil pentru plată a expirat.',
      });
    }

    const totalPrice =
      reservation.totalPrice.toNumber();

    const paidAmount =
      reservation.paidAmount.toNumber();

    const remainingAmount =
      new Prisma.Decimal(
        reservation.totalPrice,
      )
        .minus(reservation.paidAmount)
        .toDecimalPlaces(2);

    const roomNames = reservation.rooms.map(
      (reservationRoom) =>
        reservation.locale === Locale.EN
          ? reservationRoom.roomType.nameEn
          : reservationRoom.roomType.nameRo,
    );

    const availablePaymentTypes: PaymentType[] =
      [];

    if (
      reservation.depositAmount.greaterThan(
        reservation.paidAmount,
      )
    ) {
      availablePaymentTypes.push(
        PaymentType.DEPOSIT,
      );
    }

    if (
      reservation.totalPrice.greaterThan(
        reservation.paidAmount,
      )
    ) {
      availablePaymentTypes.push(
        PaymentType.FULL,
      );
    }

    return {
      reservationId: reservation.id,

      locale:
        reservation.locale === Locale.EN
          ? 'EN'
          : 'RO',

      status: reservation.status,

      guestFirstName:
        reservation.guest.firstName,

      guestLastName:
        reservation.guest.lastName,

      checkIn: this.formatDate(
        reservation.checkInDate,
      ),

      checkOut: this.formatDate(
        reservation.checkOutDate,
      ),

      nights: reservation.nights,
      adults: reservation.adults,

      roomNames,

      totalPrice,

      depositAmount:
        reservation.depositAmount.toNumber(),

      paidAmount,

      remainingAmount: Math.max(
        0,
        remainingAmount.toNumber(),
      ),

      paymentExpiresAt:
        reservation.paymentExpiresAt.toISOString(),

      availablePaymentTypes,
    };
  }

  async validatePaymentToken(params: {
    token: string;
    reservationId: string;
  }): Promise<void> {
    const normalizedToken =
      this.normalizeAndValidateToken(params.token);

    const tokenHash =
      this.hashToken(normalizedToken);

    const reservation =
      await this.prisma.reservation.findUnique({
        where: {
          id: params.reservationId,
        },
        select: {
          id: true,
          status: true,
          paymentExpiresAt: true,
          paymentAccessTokenHash: true,
          paymentAccessTokenExpiresAt: true,
        },
      });

    if (!reservation) {
      throw new UnauthorizedException({
        code: 'PAYMENT_TOKEN_INVALID',
        message:
          'Linkul de plată este invalid.',
      });
    }

    if (
      !reservation.paymentAccessTokenHash ||
      !this.compareHashes(
        tokenHash,
        reservation.paymentAccessTokenHash,
      )
    ) {
      throw new UnauthorizedException({
        code: 'PAYMENT_TOKEN_INVALID',
        message:
          'Linkul de plată este invalid.',
      });
    }

    const now = new Date();

    if (
      !reservation.paymentAccessTokenExpiresAt ||
      reservation.paymentAccessTokenExpiresAt <= now
    ) {
      throw new UnauthorizedException({
        code: 'PAYMENT_TOKEN_EXPIRED',
        message:
          'Linkul de plată a expirat.',
      });
    }

    if (
      reservation.status !==
      ReservationStatus.APPROVED_AWAITING_PAYMENT
    ) {
      throw new ConflictException({
        code: 'RESERVATION_NOT_AWAITING_PAYMENT',
        message:
          'Rezervarea nu mai așteaptă plata.',
        currentStatus: reservation.status,
      });
    }

    if (
      !reservation.paymentExpiresAt ||
      reservation.paymentExpiresAt <= now
    ) {
      throw new ConflictException({
        code: 'RESERVATION_PAYMENT_EXPIRED',
        message:
          'Termenul disponibil pentru plată a expirat.',
      });
    }
  }

  async invalidatePaymentAccess(
    reservationId: string,
  ): Promise<void> {
    await this.prisma.reservation.updateMany({
      where: {
        id: reservationId,
      },
      data: {
        paymentAccessTokenHash: null,
        paymentAccessTokenExpiresAt: null,
      },
    });
  }

  private normalizeAndValidateToken(
    token: string,
  ): string {
    const normalizedToken = token.trim();

    if (!normalizedToken) {
      throw new UnauthorizedException({
        code: 'PAYMENT_TOKEN_MISSING',
        message:
          'Tokenul de plată lipsește.',
      });
    }

    if (
      normalizedToken.length !== 64 ||
      !/^[a-f0-9]{64}$/i.test(normalizedToken)
    ) {
      throw new UnauthorizedException({
        code: 'PAYMENT_TOKEN_INVALID_FORMAT',
        message:
          'Tokenul de plată are un format invalid.',
      });
    }

    return normalizedToken.toLowerCase();
  }

  private buildPaymentUrl(
    token: string,
    locale: Locale,
  ): string {
    const localePath =
      locale === Locale.EN ? 'en' : 'ro';

    return [
      this.frontendBaseUrl,
      localePath,
      `plata?token=${encodeURIComponent(token)}`,
    ].join('/');
  }

  private generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  private hashToken(token: string): string {
    return createHash('sha256')
      .update(token, 'utf8')
      .digest('hex');
  }

  private compareHashes(
    firstHash: string,
    secondHash: string,
  ): boolean {
    if (
      !/^[a-f0-9]{64}$/i.test(firstHash) ||
      !/^[a-f0-9]{64}$/i.test(secondHash)
    ) {
      return false;
    }

    const firstBuffer = Buffer.from(
      firstHash,
      'hex',
    );

    const secondBuffer = Buffer.from(
      secondHash,
      'hex',
    );

    if (
      firstBuffer.length !==
      secondBuffer.length
    ) {
      return false;
    }

    return timingSafeEqual(
      firstBuffer,
      secondBuffer,
    );
  }

  private formatDate(value: Date): string {
    return value.toISOString().slice(0, 10);
  }
}
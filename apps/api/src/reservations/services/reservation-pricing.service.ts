import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export type PricingNightRate = {
  date: string;
  rateType: 'WEEKDAY' | 'WEEKEND';
  price: number;
  originalPrice: number | null;
  isPromotion: boolean;
  promotionTitleRo: string | null;
  promotionTitleEn: string | null;
};

export type RoomStayPrice = {
  roomTypeId: string;
  roomTypeSlug: string;
  roomTypeNameRo: string;
  roomTypeNameEn: string;

  quantity: number;
  nights: number;
  weekdayNights: number;
  weekendNights: number;

  /**
   * Medii ponderate. Sunt utile pentru snapshot-ul actual
   * din ReservationRoom.
   */
  weekdayAveragePrice: number;
  weekendAveragePrice: number;

  pricePerUnit: number;
  subtotal: number;

  hasPromotion: boolean;
  nightlyRates: PricingNightRate[];
};

export type ReservationPrice = {
  nights: number;
  subtotalPrice: number;
  discountAmount: number;
  totalPrice: number;
  depositAmount: number;
  fullPaymentAmount: number;
  rooms: RoomStayPrice[];
};

export type RoomPricingSelection = {
  roomTypeId: string;
  quantity: number;
};

type RoomTypeWithRates = Prisma.RoomTypeGetPayload<{
  include: {
    ratePeriods: true;
  };
}>;

@Injectable()
export class ReservationPricingService {
  private static readonly DEPOSIT_PERCENTAGE = 50;

  constructor(private readonly prisma: PrismaService) {}

  async calculateNightlyRates(
    roomTypeId: string,
    checkIn: string,
    checkOut: string,
  ): Promise<PricingNightRate[]> {
    const checkInDate = this.parseDate(checkIn, 'checkIn');
    const checkOutDate = this.parseDate(checkOut, 'checkOut');

    this.validateDateRange(checkInDate, checkOutDate);

    const roomType = await this.findRoomTypeWithRates(
      roomTypeId,
      checkInDate,
      checkOutDate,
    );

    return this.buildNightlyRates(
      this.getStayDates(checkInDate, checkOutDate),
      roomType,
    );
  }

  async calculateStayPrice(params: {
    roomTypeId: string;
    quantity: number;
    checkIn: string;
    checkOut: string;
  }): Promise<RoomStayPrice> {
    if (!Number.isInteger(params.quantity) || params.quantity < 1) {
      throw new BadRequestException(
        'Cantitatea de apartamente trebuie să fie un număr întreg pozitiv.',
      );
    }

    const checkInDate = this.parseDate(params.checkIn, 'checkIn');
    const checkOutDate = this.parseDate(params.checkOut, 'checkOut');

    this.validateDateRange(checkInDate, checkOutDate);

    const roomType = await this.findRoomTypeWithRates(
      params.roomTypeId,
      checkInDate,
      checkOutDate,
    );

    const nightlyRates = this.buildNightlyRates(
      this.getStayDates(checkInDate, checkOutDate),
      roomType,
    );

    const weekdayRates = nightlyRates.filter(
      (rate) => rate.rateType === 'WEEKDAY',
    );

    const weekendRates = nightlyRates.filter(
      (rate) => rate.rateType === 'WEEKEND',
    );

    const pricePerUnit = nightlyRates.reduce(
      (total, rate) => total.plus(rate.price),
      new Prisma.Decimal(0),
    );

    const subtotal = pricePerUnit.mul(params.quantity);

    return {
      roomTypeId: roomType.id,
      roomTypeSlug: roomType.slug,
      roomTypeNameRo: roomType.nameRo,
      roomTypeNameEn: roomType.nameEn,

      quantity: params.quantity,
      nights: nightlyRates.length,
      weekdayNights: weekdayRates.length,
      weekendNights: weekendRates.length,

      weekdayAveragePrice: this.calculateAveragePrice(weekdayRates),
      weekendAveragePrice: this.calculateAveragePrice(weekendRates),

      pricePerUnit: pricePerUnit.toNumber(),
      subtotal: subtotal.toNumber(),

      hasPromotion: nightlyRates.some((rate) => rate.isPromotion),
      nightlyRates,
    };
  }

  async calculateReservationPrice(params: {
    checkIn: string;
    checkOut: string;
    rooms: RoomPricingSelection[];
  }): Promise<ReservationPrice> {
    if (params.rooms.length === 0) {
      throw new BadRequestException(
        'Rezervarea trebuie să conțină cel puțin un apartament.',
      );
    }

    this.ensureUniqueRoomTypes(params.rooms);

    const roomPrices = await Promise.all(
      params.rooms.map((room) =>
        this.calculateStayPrice({
          roomTypeId: room.roomTypeId,
          quantity: room.quantity,
          checkIn: params.checkIn,
          checkOut: params.checkOut,
        }),
      ),
    );

    const subtotalPrice = roomPrices.reduce(
      (total, room) => total.plus(room.subtotal),
      new Prisma.Decimal(0),
    );

    // Reducerile separate nu sunt încă aplicate.
    const discountAmount = new Prisma.Decimal(0);
    const totalPrice = subtotalPrice.minus(discountAmount);

    return {
      nights: roomPrices[0]?.nights ?? 0,
      subtotalPrice: subtotalPrice.toNumber(),
      discountAmount: discountAmount.toNumber(),
      totalPrice: totalPrice.toNumber(),
      depositAmount: this.calculateDeposit(totalPrice.toNumber()),
      fullPaymentAmount: totalPrice.toNumber(),
      rooms: roomPrices,
    };
  }

  calculateDeposit(totalPrice: number): number {
    this.validateMoneyAmount(totalPrice, 'Prețul total');

    return new Prisma.Decimal(totalPrice)
      .mul(ReservationPricingService.DEPOSIT_PERCENTAGE)
      .div(100)
      .toDecimalPlaces(2)
      .toNumber();
  }

  calculateRemainingBalance(
    totalPrice: number,
    paidAmount: number,
  ): number {
    this.validateMoneyAmount(totalPrice, 'Prețul total');
    this.validateMoneyAmount(paidAmount, 'Suma achitată');

    const remainingBalance = Prisma.Decimal.max(
      new Prisma.Decimal(totalPrice).minus(paidAmount),
      new Prisma.Decimal(0),
    );

    return remainingBalance.toDecimalPlaces(2).toNumber();
  }

  calculateModificationDifference(
    oldTotalPrice: number,
    newCalculatedPrice: number,
  ): {
    priceDifference: number;
    amountDue: number;
    retainedAmount: number;
    additionalPaymentRequired: boolean;
  } {
    this.validateMoneyAmount(oldTotalPrice, 'Prețul vechi');
    this.validateMoneyAmount(newCalculatedPrice, 'Prețul nou');

    const difference = new Prisma.Decimal(newCalculatedPrice).minus(
      oldTotalPrice,
    );

    const amountDue = Prisma.Decimal.max(
      difference,
      new Prisma.Decimal(0),
    );

    const retainedAmount = Prisma.Decimal.max(
      difference.negated(),
      new Prisma.Decimal(0),
    );

    return {
      priceDifference: difference.toDecimalPlaces(2).toNumber(),
      amountDue: amountDue.toDecimalPlaces(2).toNumber(),
      retainedAmount: retainedAmount.toDecimalPlaces(2).toNumber(),
      additionalPaymentRequired: amountDue.greaterThan(0),
    };
  }

  private async findRoomTypeWithRates(
    roomTypeId: string,
    checkInDate: Date,
    checkOutDate: Date,
  ): Promise<RoomTypeWithRates> {
    const roomType = await this.prisma.roomType.findUnique({
      where: {
        id: roomTypeId,
      },
      include: {
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
    });

    if (!roomType || !roomType.isActive) {
      throw new NotFoundException(
        'Tipul de apartament nu a fost găsit sau este inactiv.',
      );
    }

    return roomType;
  }

  private buildNightlyRates(
    stayDates: Date[],
    roomType: RoomTypeWithRates,
  ): PricingNightRate[] {
    return stayDates.map((date) => {
      const isWeekend = this.isWeekendNight(date);

      const applicableRatePeriod = roomType.ratePeriods.find(
        (period) =>
          period.startDate.getTime() <= date.getTime() &&
          period.endDate.getTime() > date.getTime(),
      );

      if (applicableRatePeriod) {
        const price = isWeekend
          ? applicableRatePeriod.weekendPrice
          : applicableRatePeriod.weekdayPrice;

        const originalPrice = isWeekend
          ? applicableRatePeriod.originalWeekendPrice
          : applicableRatePeriod.originalWeekdayPrice;

        return {
          date: this.formatDate(date),
          rateType: isWeekend ? 'WEEKEND' : 'WEEKDAY',
          price: price.toNumber(),
          originalPrice: originalPrice?.toNumber() ?? null,
          isPromotion: applicableRatePeriod.isPromotion,
          promotionTitleRo: applicableRatePeriod.titleRo,
          promotionTitleEn: applicableRatePeriod.titleEn,
        };
      }

      const basePrice = isWeekend
        ? roomType.weekendBasePrice
        : roomType.weekdayBasePrice;

      return {
        date: this.formatDate(date),
        rateType: isWeekend ? 'WEEKEND' : 'WEEKDAY',
        price: basePrice.toNumber(),
        originalPrice: null,
        isPromotion: false,
        promotionTitleRo: null,
        promotionTitleEn: null,
      };
    });
  }

  private calculateAveragePrice(
    rates: PricingNightRate[],
  ): number {
    if (rates.length === 0) {
      return 0;
    }

    const total = rates.reduce(
      (sum, rate) => sum.plus(rate.price),
      new Prisma.Decimal(0),
    );

    return total
      .div(rates.length)
      .toDecimalPlaces(2)
      .toNumber();
  }

  private ensureUniqueRoomTypes(
    rooms: RoomPricingSelection[],
  ): void {
    const roomTypeIds = rooms.map((room) => room.roomTypeId);
    const uniqueRoomTypeIds = new Set(roomTypeIds);

    if (uniqueRoomTypeIds.size !== roomTypeIds.length) {
      throw new BadRequestException(
        'Același tip de apartament nu poate apărea de mai multe ori în selecție.',
      );
    }
  }

  private validateMoneyAmount(
    amount: number,
    fieldName: string,
  ): void {
    if (!Number.isFinite(amount) || amount < 0) {
      throw new BadRequestException(
        `${fieldName} trebuie să fie o valoare pozitivă validă.`,
      );
    }
  }

  private parseDate(value: string, fieldName: string): Date {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new BadRequestException(
        `${fieldName} trebuie să aibă formatul YYYY-MM-DD.`,
      );
    }

    const date = new Date(`${value}T00:00:00.000Z`);

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
  }

  private getStayDates(
    checkInDate: Date,
    checkOutDate: Date,
  ): Date[] {
    const dates: Date[] = [];
    const currentDate = new Date(checkInDate);

    while (currentDate < checkOutDate) {
      dates.push(new Date(currentDate));
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    return dates;
  }

  private isWeekendNight(date: Date): boolean {
    const day = date.getUTCDay();

    return day === 5 || day === 6;
  }

  private formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
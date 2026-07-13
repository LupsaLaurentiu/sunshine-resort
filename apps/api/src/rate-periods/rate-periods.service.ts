import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma, RatePeriod } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRatePeriodDto } from './dto/create-rate-period.dto';
import { UpdateRatePeriodDto } from './dto/update-rate-period.dto';

type RatePeriodWithRelations = Prisma.RatePeriodGetPayload<{
  include: {
    roomType: true;
    createdByAdmin: {
      select: {
        id: true;
        firstName: true;
        lastName: true;
        email: true;
      };
    };
  };
}>;

@Injectable()
export class RatePeriodsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<RatePeriodWithRelations[]> {
    return this.prisma.ratePeriod.findMany({
      include: {
        roomType: true,
        createdByAdmin: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: [
        {
          startDate: 'asc',
        },
        {
          roomType: {
            nameEn: 'asc',
          },
        },
      ],
    });
  }

  async findById(id: string): Promise<RatePeriodWithRelations> {
    const ratePeriod = await this.prisma.ratePeriod.findUnique({
      where: {
        id,
      },
      include: {
        roomType: true,
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

    if (!ratePeriod) {
      throw new NotFoundException(
        'Perioada tarifară nu a fost găsită.',
      );
    }

    return ratePeriod;
  }

  async create(
    dto: CreateRatePeriodDto,
    adminId: string,
  ): Promise<RatePeriodWithRelations> {
    const startDate = this.parseDate(dto.startDate);
    const endDate = this.parseDate(dto.endDate);

    this.validateDateRange(startDate, endDate);
    this.validatePromotionFields(dto);

    const roomType = await this.prisma.roomType.findUnique({
      where: {
        id: dto.roomTypeId,
      },
    });

    if (!roomType) {
      throw new NotFoundException(
        'Tipul de apartament nu a fost găsit.',
      );
    }

    if (!roomType.isActive) {
      throw new ConflictException(
        'Nu poți crea tarife pentru un tip de apartament inactiv.',
      );
    }

    await this.ensureNoOverlap({
      roomTypeId: dto.roomTypeId,
      startDate,
      endDate,
    });

    return this.prisma.ratePeriod.create({
      data: {
        roomTypeId: dto.roomTypeId,
        createdByAdminId: adminId,
        startDate,
        endDate,
        weekdayPrice: dto.weekdayPrice,
        weekendPrice: dto.weekendPrice,
        isPromotion: dto.isPromotion ?? false,
        originalWeekdayPrice: dto.originalWeekdayPrice,
        originalWeekendPrice: dto.originalWeekendPrice,
        titleRo: dto.titleRo?.trim(),
        titleEn: dto.titleEn?.trim(),
        isActive: dto.isActive ?? true,
      },
      include: {
        roomType: true,
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
  }

  async update(
    id: string,
    dto: UpdateRatePeriodDto,
  ): Promise<RatePeriodWithRelations> {
    const current = await this.findById(id);

    const startDate =
      dto.startDate !== undefined
        ? this.parseDate(dto.startDate)
        : current.startDate;

    const endDate =
      dto.endDate !== undefined
        ? this.parseDate(dto.endDate)
        : current.endDate;

    const roomTypeId = dto.roomTypeId ?? current.roomTypeId;

    this.validateDateRange(startDate, endDate);

    if (dto.isPromotion !== undefined) {
      this.validatePromotionFields({
        ...dto,
        isPromotion: dto.isPromotion,
      });
    }

    if (dto.roomTypeId !== undefined) {
      const roomType = await this.prisma.roomType.findUnique({
        where: {
          id: dto.roomTypeId,
        },
      });

      if (!roomType) {
        throw new NotFoundException(
          'Tipul de apartament nu a fost găsit.',
        );
      }

      if (!roomType.isActive) {
        throw new ConflictException(
          'Nu poți muta perioada tarifară pe un tip inactiv.',
        );
      }
    }

    await this.ensureNoOverlap({
      roomTypeId,
      startDate,
      endDate,
      excludeId: id,
    });

    return this.prisma.ratePeriod.update({
      where: {
        id,
      },
      data: {
        ...(dto.roomTypeId !== undefined && {
          roomTypeId: dto.roomTypeId,
        }),
        ...(dto.startDate !== undefined && {
          startDate,
        }),
        ...(dto.endDate !== undefined && {
          endDate,
        }),
        ...(dto.weekdayPrice !== undefined && {
          weekdayPrice: dto.weekdayPrice,
        }),
        ...(dto.weekendPrice !== undefined && {
          weekendPrice: dto.weekendPrice,
        }),
        ...(dto.isPromotion !== undefined && {
          isPromotion: dto.isPromotion,
        }),
        ...(dto.originalWeekdayPrice !== undefined && {
          originalWeekdayPrice: dto.originalWeekdayPrice,
        }),
        ...(dto.originalWeekendPrice !== undefined && {
          originalWeekendPrice: dto.originalWeekendPrice,
        }),
        ...(dto.titleRo !== undefined && {
          titleRo: dto.titleRo.trim(),
        }),
        ...(dto.titleEn !== undefined && {
          titleEn: dto.titleEn.trim(),
        }),
        ...(dto.isActive !== undefined && {
          isActive: dto.isActive,
        }),
      },
      include: {
        roomType: true,
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
  }

  async deactivate(id: string): Promise<RatePeriod> {
    await this.findById(id);

    return this.prisma.ratePeriod.update({
      where: {
        id,
      },
      data: {
        isActive: false,
      },
    });
  }

  private parseDate(value: string): Date {
    return new Date(`${value}T00:00:00.000Z`);
  }

  private validateDateRange(startDate: Date, endDate: Date): void {
    if (startDate >= endDate) {
      throw new BadRequestException(
        'Data de final trebuie să fie după data de început.',
      );
    }
  }

  private validatePromotionFields(
    dto: Partial<CreateRatePeriodDto>,
  ): void {
    if (!dto.isPromotion) {
      return;
    }

    if (
      dto.originalWeekdayPrice === undefined ||
      dto.originalWeekendPrice === undefined
    ) {
      throw new BadRequestException(
        'Pentru o promoție trebuie completate prețurile originale.',
      );
    }

    if (
      dto.weekdayPrice !== undefined &&
      dto.originalWeekdayPrice <= dto.weekdayPrice
    ) {
      throw new BadRequestException(
        'Prețul original weekday trebuie să fie mai mare decât prețul promoțional.',
      );
    }

    if (
      dto.weekendPrice !== undefined &&
      dto.originalWeekendPrice <= dto.weekendPrice
    ) {
      throw new BadRequestException(
        'Prețul original weekend trebuie să fie mai mare decât prețul promoțional.',
      );
    }
  }

  private async ensureNoOverlap(params: {
    roomTypeId: string;
    startDate: Date;
    endDate: Date;
    excludeId?: string;
  }): Promise<void> {
    const overlappingPeriod =
      await this.prisma.ratePeriod.findFirst({
        where: {
          roomTypeId: params.roomTypeId,
          isActive: true,
          ...(params.excludeId && {
            id: {
              not: params.excludeId,
            },
          }),
          startDate: {
            lt: params.endDate,
          },
          endDate: {
            gt: params.startDate,
          },
        },
      });

    if (overlappingPeriod) {
      throw new ConflictException(
        'Există deja o perioadă tarifară activă care se suprapune pentru acest tip de apartament.',
      );
    }
  }
}
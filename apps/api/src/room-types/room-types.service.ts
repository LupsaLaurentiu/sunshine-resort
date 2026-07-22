import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { RoomType } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomTypeDto } from './dto/create-room-type.dto';
import { UpdateRoomTypeDto } from './dto/update-room-type.dto';

@Injectable()
export class RoomTypesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findAll(): Promise<RoomType[]> {
    return this.prisma.roomType.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findActive(): Promise<RoomType[]> {
    return this.prisma.roomType.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findBySlug(
    slug: string,
  ): Promise<RoomType> {
    const roomType =
      await this.prisma.roomType.findUnique({
        where: {
          slug: slug
            .trim()
            .toLowerCase(),
        },
      });

    if (
      !roomType ||
      !roomType.isActive
    ) {
      throw new NotFoundException(
        'Tipul de apartament nu a fost găsit.',
      );
    }

    return roomType;
  }

  async findById(
    id: string,
  ): Promise<RoomType> {
    const roomType =
      await this.prisma.roomType.findUnique({
        where: {
          id,
        },
      });

    if (!roomType) {
      throw new NotFoundException(
        'Tipul de apartament nu a fost găsit.',
      );
    }

    return roomType;
  }

  async create(
    dto: CreateRoomTypeDto,
  ): Promise<RoomType> {
    try {
      return await this.prisma.roomType.create({
        data: {
          nameRo:
            dto.nameRo.trim(),

          nameEn:
            dto.nameEn.trim(),

          slug:
            dto.slug
              .trim()
              .toLowerCase(),

          descriptionRo:
            dto.descriptionRo?.trim(),

          descriptionEn:
            dto.descriptionEn?.trim(),

          weekdayBasePrice:
            dto.weekdayBasePrice,

          weekendBasePrice:
            dto.weekendBasePrice,

          maxAdults:
            dto.maxAdults,

          extraAdultPrice:
            dto.extraAdultPrice,

          sizeSqm:
            dto.sizeSqm,

          isActive:
            dto.isActive ?? true,
        },
      });
    } catch (error: unknown) {
      this.handleUniqueConstraint(
        error,
      );

      throw error;
    }
  }

  async update(
    id: string,
    dto: UpdateRoomTypeDto,
  ): Promise<RoomType> {
    await this.findById(id);

    if (
      dto.extraAdultPrice !== undefined &&
      dto.extraAdultPrice <= 0
    ) {
      const roomsAllowingExtraAdult =
        await this.prisma.room.count({
          where: {
            roomTypeId: id,
            allowsExtraAdult: true,
          },
        });

      if (
        roomsAllowingExtraAdult > 0
      ) {
        throw new ConflictException({
          code:
            'EXTRA_ADULT_PRICE_REQUIRED',

          message:
            'Tariful pentru adult suplimentar trebuie să fie mai mare decât 0 cât timp există apartamente din acest tip care permit un adult suplimentar.',

          roomTypeId: id,

          roomsAllowingExtraAdult,
        });
      }
    }

    try {
      return await this.prisma.roomType.update({
        where: {
          id,
        },

        data: {
          ...(dto.nameRo !== undefined && {
            nameRo:
              dto.nameRo.trim(),
          }),

          ...(dto.nameEn !== undefined && {
            nameEn:
              dto.nameEn.trim(),
          }),

          ...(dto.slug !== undefined && {
            slug:
              dto.slug
                .trim()
                .toLowerCase(),
          }),

          ...(dto.descriptionRo !== undefined && {
            descriptionRo:
              dto.descriptionRo.trim(),
          }),

          ...(dto.descriptionEn !== undefined && {
            descriptionEn:
              dto.descriptionEn.trim(),
          }),

          ...(dto.weekdayBasePrice !== undefined && {
            weekdayBasePrice:
              dto.weekdayBasePrice,
          }),

          ...(dto.weekendBasePrice !== undefined && {
            weekendBasePrice:
              dto.weekendBasePrice,
          }),

          ...(dto.maxAdults !== undefined && {
            maxAdults:
              dto.maxAdults,
          }),

          ...(dto.extraAdultPrice !== undefined && {
            extraAdultPrice:
              dto.extraAdultPrice,
          }),

          ...(dto.sizeSqm !== undefined && {
            sizeSqm:
              dto.sizeSqm,
          }),

          ...(dto.isActive !== undefined && {
            isActive:
              dto.isActive,
          }),
        },
      });
    } catch (error: unknown) {
      this.handleUniqueConstraint(
        error,
      );

      throw error;
    }
  }

  async deactivate(
    id: string,
  ): Promise<RoomType> {
    await this.findById(id);

    return this.prisma.roomType.update({
      where: {
        id,
      },

      data: {
        isActive: false,
      },
    });
  }

  private handleUniqueConstraint(
    error: unknown,
  ): void {
    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(
        'Există deja un tip de apartament cu acest slug.',
      );
    }
  }
}
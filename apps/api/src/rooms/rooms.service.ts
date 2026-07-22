import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Room } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findAll(): Promise<Room[]> {
    return this.prisma.room.findMany({
      orderBy: [
        {
          roomType: {
            nameEn: 'asc',
          },
        },
        {
          code: 'asc',
        },
      ],

      include: {
        roomType: true,
      },
    });
  }

  async findActive(): Promise<Room[]> {
    return this.prisma.room.findMany({
      where: {
        isActive: true,
      },

      orderBy: {
        code: 'asc',
      },

      include: {
        roomType: true,
      },
    });
  }

  async findById(
    id: string,
  ): Promise<Room> {
    const room =
      await this.prisma.room.findUnique({
        where: {
          id,
        },

        include: {
          roomType: true,
        },
      });

    if (!room) {
      throw new NotFoundException(
        'Apartamentul nu a fost găsit.',
      );
    }

    return room;
  }

  async create(
    dto: CreateRoomDto,
  ): Promise<Room> {
    const roomType =
      await this.prisma.roomType.findUnique({
        where: {
          id: dto.roomTypeId,
        },
      });

    if (!roomType) {
      throw new NotFoundException(
        'Tipul de apartament asociat nu a fost găsit.',
      );
    }

    if (!roomType.isActive) {
      throw new ConflictException(
        'Nu poți crea un apartament pentru un tip inactiv.',
      );
    }

    if (
      dto.allowsExtraAdult === true &&
      roomType.extraAdultPrice === null
    ) {
      throw new ConflictException({
        code: 'EXTRA_ADULT_PRICE_NOT_CONFIGURED',
        message:
          'Nu poți permite un adult suplimentar pentru acest apartament până când tipul de apartament nu are configurat tariful pentru adult suplimentar.',
        roomTypeId: roomType.id,
      });
    }

    try {
      return await this.prisma.room.create({
        data: {
          name:
            dto.name.trim(),

          code:
            dto.code
              .trim()
              .toUpperCase(),

          roomTypeId:
            dto.roomTypeId,

          floor:
            dto.floor,

          tvDeviceId:
            dto.tvDeviceId?.trim(),

          allowsExtraAdult:
            dto.allowsExtraAdult ??
            false,

          isActive:
            dto.isActive ??
            true,
        },

        include: {
          roomType: true,
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
    dto: UpdateRoomDto,
  ): Promise<Room> {
    const currentRoom =
      await this.findById(id);

    const nextRoomTypeId =
      dto.roomTypeId ??
      currentRoom.roomTypeId;

    const nextAllowsExtraAdult =
      dto.allowsExtraAdult ??
      currentRoom.allowsExtraAdult;

    let nextRoomType:
      | {
          id: string;
          isActive: boolean;
          extraAdultPrice:
            | Prisma.Decimal
            | null;
        }
      | null = null;

    if (
      dto.roomTypeId !== undefined ||
      dto.allowsExtraAdult !== undefined
    ) {
      nextRoomType =
        await this.prisma.roomType.findUnique({
          where: {
            id: nextRoomTypeId,
          },

          select: {
            id: true,
            isActive: true,
            extraAdultPrice: true,
          },
        });

      if (!nextRoomType) {
        throw new NotFoundException(
          'Tipul de apartament asociat nu a fost găsit.',
        );
      }

      if (!nextRoomType.isActive) {
        throw new ConflictException(
          'Nu poți muta apartamentul într-un tip inactiv.',
        );
      }

      if (
        nextAllowsExtraAdult &&
        nextRoomType.extraAdultPrice ===
          null
      ) {
        throw new ConflictException({
          code: 'EXTRA_ADULT_PRICE_NOT_CONFIGURED',
          message:
            'Nu poți permite un adult suplimentar pentru acest apartament până când tipul de apartament nu are configurat tariful pentru adult suplimentar.',
          roomTypeId:
            nextRoomType.id,
        });
      }
    }

    try {
      return await this.prisma.room.update({
        where: {
          id,
        },

        data: {
          ...(dto.name !== undefined && {
            name:
              dto.name.trim(),
          }),

          ...(dto.code !== undefined && {
            code:
              dto.code
                .trim()
                .toUpperCase(),
          }),

          ...(dto.roomTypeId !== undefined && {
            roomTypeId:
              dto.roomTypeId,
          }),

          ...(dto.floor !== undefined && {
            floor:
              dto.floor,
          }),

          ...(dto.tvDeviceId !== undefined && {
            tvDeviceId:
              dto.tvDeviceId.trim(),
          }),

          ...(dto.allowsExtraAdult !==
            undefined && {
            allowsExtraAdult:
              dto.allowsExtraAdult,
          }),

          ...(dto.isActive !== undefined && {
            isActive:
              dto.isActive,
          }),
        },

        include: {
          roomType: true,
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
  ): Promise<Room> {
    await this.findById(id);

    return this.prisma.room.update({
      where: {
        id,
      },

      data: {
        isActive: false,
      },

      include: {
        roomType: true,
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
      const target =
        Array.isArray(
          error.meta?.target,
        )
          ? error.meta.target.join(
              ', ',
            )
          : String(
              error.meta?.target ??
                '',
            );

      if (
        target.includes(
          'code',
        )
      ) {
        throw new ConflictException(
          'Există deja un apartament cu acest cod.',
        );
      }

      if (
        target.includes(
          'tvDeviceId',
        )
      ) {
        throw new ConflictException(
          'Acest televizor este deja asociat altui apartament.',
        );
      }

      throw new ConflictException(
        'Există deja un apartament cu aceste date unice.',
      );
    }
  }
}
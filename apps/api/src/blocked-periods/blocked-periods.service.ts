import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlockedPeriodDto } from './dto/create-blocked-period.dto';
import { FindBlockedPeriodsQueryDto } from './dto/find-blocked-periods-query.dto';
import { UpdateBlockedPeriodDto } from './dto/update-blocked-period.dto';

type BlockedPeriodWithRelations = Prisma.BlockedPeriodGetPayload<{
  include: {
    room: {
      include: {
        roomType: true;
      };
    };
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
export class BlockedPeriodsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: FindBlockedPeriodsQueryDto,
  ): Promise<BlockedPeriodWithRelations[]> {
    const from = query.from ? this.parseDate(query.from) : undefined;
    const to = query.to ? this.parseDate(query.to) : undefined;

    if (from && to) {
      this.validateDateRange(from, to);
    }

    return this.prisma.blockedPeriod.findMany({
      where: {
        ...(query.roomId && {
          roomId: query.roomId,
        }),
        ...(from &&
          to && {
            startDate: {
              lt: to,
            },
            endDate: {
              gt: from,
            },
          }),
        ...(from &&
          !to && {
            endDate: {
              gt: from,
            },
          }),
        ...(!from &&
          to && {
            startDate: {
              lt: to,
            },
          }),
      },
      include: {
        room: {
          include: {
            roomType: true,
          },
        },
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
          room: {
            code: 'asc',
          },
        },
      ],
    });
  }

  async findById(id: string): Promise<BlockedPeriodWithRelations> {
    const blockedPeriod = await this.prisma.blockedPeriod.findUnique({
      where: {
        id,
      },
      include: {
        room: {
          include: {
            roomType: true,
          },
        },
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

    if (!blockedPeriod) {
      throw new NotFoundException(
        'Perioada de blocare nu a fost găsită.',
      );
    }

    return blockedPeriod;
  }

  async create(
    dto: CreateBlockedPeriodDto,
    adminId: string,
  ): Promise<BlockedPeriodWithRelations> {
    const startDate = this.parseDate(dto.startDate);
    const endDate = this.parseDate(dto.endDate);

    this.validateDateRange(startDate, endDate);

    await this.validateRoom(dto.roomId);
    await this.ensureNoBlockedPeriodOverlap(
      dto.roomId,
      startDate,
      endDate,
    );
    await this.ensureNoReservationConflict(
      dto.roomId,
      startDate,
      endDate,
    );
    await this.ensureNoExternalCalendarConflict(
      dto.roomId,
      startDate,
      endDate,
    );

    return this.prisma.blockedPeriod.create({
      data: {
        roomId: dto.roomId,
        createdByAdminId: adminId,
        startDate,
        endDate,
        reason: dto.reason?.trim(),
      },
      include: {
        room: {
          include: {
            roomType: true,
          },
        },
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
    dto: UpdateBlockedPeriodDto,
  ): Promise<BlockedPeriodWithRelations> {
    const current = await this.findById(id);

    const roomId = dto.roomId ?? current.roomId;
    const startDate = dto.startDate
      ? this.parseDate(dto.startDate)
      : current.startDate;
    const endDate = dto.endDate
      ? this.parseDate(dto.endDate)
      : current.endDate;

    this.validateDateRange(startDate, endDate);

    await this.validateRoom(roomId);
    await this.ensureNoBlockedPeriodOverlap(
      roomId,
      startDate,
      endDate,
      id,
    );
    await this.ensureNoReservationConflict(
      roomId,
      startDate,
      endDate,
    );
    await this.ensureNoExternalCalendarConflict(
      roomId,
      startDate,
      endDate,
    );

    return this.prisma.blockedPeriod.update({
      where: {
        id,
      },
      data: {
        ...(dto.roomId !== undefined && {
          roomId,
        }),
        ...(dto.startDate !== undefined && {
          startDate,
        }),
        ...(dto.endDate !== undefined && {
          endDate,
        }),
        ...(dto.reason !== undefined && {
          reason: dto.reason.trim(),
        }),
      },
      include: {
        room: {
          include: {
            roomType: true,
          },
        },
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

  async remove(id: string): Promise<{ message: string }> {
    await this.findById(id);

    await this.prisma.blockedPeriod.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Perioada de blocare a fost eliminată.',
    };
  }

  private async validateRoom(roomId: string): Promise<void> {
    const room = await this.prisma.room.findUnique({
      where: {
        id: roomId,
      },
    });

    if (!room) {
      throw new NotFoundException('Apartamentul nu a fost găsit.');
    }

    if (!room.isActive) {
      throw new ConflictException(
        'Nu poți bloca un apartament inactiv.',
      );
    }
  }

  private async ensureNoBlockedPeriodOverlap(
    roomId: string,
    startDate: Date,
    endDate: Date,
    excludeId?: string,
  ): Promise<void> {
    const overlap = await this.prisma.blockedPeriod.findFirst({
      where: {
        roomId,
        ...(excludeId && {
          id: {
            not: excludeId,
          },
        }),
        startDate: {
          lt: endDate,
        },
        endDate: {
          gt: startDate,
        },
      },
    });

    if (overlap) {
      throw new ConflictException(
        'Apartamentul este deja blocat în această perioadă.',
      );
    }
  }

  private async ensureNoReservationConflict(
    roomId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<void> {
    const conflictingReservationRoom =
      await this.prisma.reservationRoom.findFirst({
        where: {
          roomId,
          reservation: {
            status: {
              in: [
                'CONFIRMED',
                'CHECKED_IN',
              ],
            },
            checkInDate: {
              lt: endDate,
            },
            checkOutDate: {
              gt: startDate,
            },
          },
        },
      });

    if (conflictingReservationRoom) {
      throw new ConflictException(
        'Apartamentul are deja o rezervare confirmată în această perioadă.',
      );
    }
  }

  private async ensureNoExternalCalendarConflict(
    roomId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<void> {
    const externalConflict =
      await this.prisma.externalCalendarEvent.findFirst({
        where: {
          externalCalendar: {
            roomId,
            isActive: true,
          },
          cancelledAt: null,
          startDate: {
            lt: endDate,
          },
          endDate: {
            gt: startDate,
          },
        },
      });

    if (externalConflict) {
      throw new ConflictException(
        'Apartamentul este ocupat în calendarul extern în această perioadă.',
      );
    }
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
}
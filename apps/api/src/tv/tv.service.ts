import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import { Prisma } from '@prisma/client';
import type { TvDevice } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { resolveGuest } from './reservation-content';
import type { UpdateTvDeviceDto } from './tv.dto';

export const hashTvSecret = (secret: string) => createHash('sha256').update(secret).digest('hex');

@Injectable()
export class TvService {
  constructor(private readonly prisma: PrismaService) {}

  async begin(secret: string) {
    const now = new Date();
    const tokenHash = hashTvSecret(secret);
    if (await this.prisma.tvDevice.findUnique({ where: { tokenHash }, select: { id: true } })) {
      throw new ConflictException('Generate a new device identity to pair again.');
    }
    await this.prisma.tvPairing.deleteMany({ where: { expiresAt: { lt: now } } });
    const code = randomBytes(4).toString('hex').toUpperCase();
    const expiresAt = new Date(now.getTime() + 10 * 60_000);
    await this.prisma.tvPairing.upsert({
      where: { tokenHash }, create: { tokenHash, codeHash: hashTvSecret(code), expiresAt },
      update: { codeHash: hashTvSecret(code), expiresAt, consumedAt: null },
    });
    return { code, expiresAt: expiresAt.toISOString() };
  }

  async approve(code: string, roomId: string, adminId: string) {
    try {
      return await this.prisma.$transaction(async tx => {
        const room = await tx.room.findFirst({ where: { id: roomId, isActive: true }, select: { id: true } });
        if (!room) throw new NotFoundException('Active apartment not found.');
        const pairing = await tx.tvPairing.findUnique({ where: { codeHash: hashTvSecret(code) } });
        const now = new Date();
        if (!pairing || pairing.consumedAt || pairing.expiresAt <= now) throw new ConflictException('Pairing code expired or already used.');
        const device = await tx.tvDevice.create({ data: { roomId, tokenHash: pairing.tokenHash, registeredByAdminId: adminId }, select: { id: true, roomId: true } });
        await tx.tvPairing.update({ where: { id: pairing.id }, data: { consumedAt: now } });
        return device;
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) { this.rethrowConflict(error); }
  }

  async authenticate(authorization?: string) {
    const secret = authorization?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
    if (!secret) throw new UnauthorizedException();
    const device = await this.prisma.tvDevice.findUnique({ where: { tokenHash: hashTvSecret(secret) }, include: { room: { select: { isActive: true } } } });
    if (!device) throw new UnauthorizedException({ code: 'TV_UNPAIRED' });
    if (device.revokedAt) throw new UnauthorizedException({ code: 'TV_REVOKED' });
    if (!device.roomId || !device.room?.isActive) throw new UnauthorizedException({ code: 'TV_DISABLED' });
    // One write per minute at most; content polling is otherwise read-only.
    if (!device.lastSeenAt || Date.now() - device.lastSeenAt.getTime() > 60_000) {
      await this.prisma.tvDevice.updateMany({ where: { id: device.id, revokedAt: null }, data: { lastSeenAt: new Date() } });
    }
    return device;
  }

  async content(device: Pick<TvDevice, 'roomId' | 'forceStandard' | 'hideGuestName'>, now = new Date()) {
    let guest: ReturnType<typeof resolveGuest> = null;
    if (device.roomId && !device.forceStandard && !device.hideGuestName) {
      // Wider date envelope is filtered precisely using local check-in/out instants.
      const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      const reservations = await this.prisma.reservation.findMany({
        where: { rooms: { some: { roomId: device.roomId } }, status: { in: ['CONFIRMED', 'CHECKED_IN'] },
          checkInDate: { lte: new Date(date.getTime() + 86400000) },
          checkOutDate: { gte: new Date(date.getTime() - 86400000) }, cancelledAt: null, checkedOutAt: null },
        select: { id: true, status: true, checkInDate: true, checkOutDate: true, cancelledAt: true, checkedOutAt: true,
          guest: { select: { firstName: true, lastName: true } } },
      });
      guest = resolveGuest(reservations, now);
    }
    return {
      mode: guest ? 'GUEST' : 'STANDARD', guest: guest ? { displayName: guest.displayName } : null,
      serverTime: now.toISOString(),
      validUntil: new Date(Math.min(now.getTime() + 45_000, guest?.checkOut.getTime() ?? Infinity)).toISOString(),
      resortName: 'SUNSHINE RESORT', tagline: 'Your private escape into luxury.',
      information: [{ title: 'Your stay', text: 'Check-in 14:00 · Check-out 10:00. Please contact the resort for assistance.' }],
    };
  }

  async list() {
    const rooms = await this.prisma.room.findMany({ where: { isActive: true }, orderBy: { code: 'asc' }, select: { id: true, name: true, code: true } });
    const devices = await this.prisma.tvDevice.findMany({ where: { revokedAt: null },
      select: { id: true, roomId: true, lastSeenAt: true, hideGuestName: true, forceStandard: true } });
    return { rooms, devices: await Promise.all(devices.map(async d => ({ ...d,
      online: !!d.lastSeenAt && Date.now() - d.lastSeenAt.getTime() < 120_000,
      content: await this.content(d),
    }))) };
  }

  async update(id: string, data: UpdateTvDeviceDto) {
    if (data.roomId && !await this.prisma.room.findFirst({ where: { id: data.roomId, isActive: true }, select: { id: true } })) throw new NotFoundException('Active apartment not found.');
    try {
      const result = await this.prisma.tvDevice.updateMany({ where: { id, revokedAt: null }, data });
      if (!result.count) throw new NotFoundException();
      return { updated: true };
    } catch (error) { this.rethrowConflict(error); }
  }

  async revoke(id: string) {
    const result = await this.prisma.tvDevice.updateMany({ where: { id, revokedAt: null }, data: { revokedAt: new Date(), roomId: null } });
    if (!result.count) throw new NotFoundException();
    return { revoked: true };
  }

  private rethrowConflict(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && ['P2002', 'P2034'].includes(error.code)) throw new ConflictException('Apartment already paired or concurrent change. Refresh and retry.');
    throw error;
  }
}

import { TvService, hashTvSecret } from './tv.service';
import type { PrismaService } from '../prisma/prisma.service';

describe('TV identity and apartment authorization', () => {
  let db: any;
  let service: TvService;
  beforeEach(() => {
    db = {
      tvDevice: { findUnique: jest.fn(), updateMany: jest.fn(), create: jest.fn() },
      tvPairing: { deleteMany: jest.fn(), upsert: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
      room: { findFirst: jest.fn() }, reservation: { findMany: jest.fn().mockResolvedValue([]) },
    };
    db.$transaction = jest.fn(callback => callback(db));
    service = new TvService(db as PrismaService);
  });

  it('persists only hashes during pairing, never the bearer credential', async () => {
    const secret = 'a'.repeat(64);
    const response = await service.begin(secret);
    expect(response.code).toMatch(/^[A-F0-9]{8}$/);
    const saved = db.tvPairing.upsert.mock.calls[0][0].create;
    expect(saved.tokenHash).toBe(hashTvSecret(secret));
    expect(saved.codeHash).toBe(hashTvSecret(response.code));
    expect(JSON.stringify(saved)).not.toContain(secret);
  });

  it('requires a valid bearer credential and an active, assigned, unrevoked device', async () => {
    await expect(service.authenticate()).rejects.toMatchObject({ status: 401 });
    expect(db.tvDevice.findUnique).not.toHaveBeenCalled();
    for (const device of [null, { revokedAt: new Date() }, { roomId: 'room', room: { isActive: false } }]) {
      db.tvDevice.findUnique.mockResolvedValue(device);
      await expect(service.authenticate(`Bearer ${'a'.repeat(64)}`)).rejects.toMatchObject({ status: 401 });
    }
  });

  it('queries only the apartment stored on the authenticated device and selects no guest contact/payment data', async () => {
    await service.content({ roomId: 'assigned-room', forceStandard: false, hideGuestName: false });
    const query = db.reservation.findMany.mock.calls[0][0];
    expect(query.where.rooms).toEqual({ some: { roomId: 'assigned-room' } });
    expect(query.select.guest).toEqual({ select: { firstName: true, lastName: true } });
    expect(query.select.payments).toBeUndefined();
  });

  it('does not even load guest records when the name is hidden or standard mode is forced', async () => {
    for (const flags of [{ hideGuestName: true, forceStandard: false }, { hideGuestName: false, forceStandard: true }]) {
      const content = await service.content({ roomId: 'room', ...flags });
      expect(content.mode).toBe('STANDARD'); expect(content.guest).toBeNull();
    }
    expect(db.reservation.findMany).not.toHaveBeenCalled();
  });

  it('caps the content lease at checkout, independently of polling', async () => {
    db.reservation.findMany.mockResolvedValue([{ id: 'stay', status: 'CHECKED_IN', checkInDate: new Date('2026-11-15'), checkOutDate: new Date('2026-11-18'), cancelledAt: null, checkedOutAt: null, guest: { firstName: 'Test', lastName: 'Guest' } }]);
    const content = await service.content({ roomId: 'room', forceStandard: false, hideGuestName: false }, new Date('2026-11-18T07:59:50Z'));
    expect(content.mode).toBe('GUEST');
    expect(content.validUntil).toBe('2026-11-18T08:00:00.000Z');
  });

  it.each([{ consumedAt: new Date(), expiresAt: new Date(Date.now() + 100000) }, { consumedAt: null, expiresAt: new Date(0) }])('refuses consumed or expired pairing sessions', async session => {
    db.room.findFirst.mockResolvedValue({ id: 'room' });
    db.tvPairing.findUnique.mockResolvedValue(session);
    await expect(service.approve('1234ABCD', 'room', 'admin')).rejects.toMatchObject({ status: 409 });
    expect(db.tvDevice.create).not.toHaveBeenCalled();
  });

  it('revokes the device and releases its apartment for a replacement', async () => {
    db.tvDevice.updateMany.mockResolvedValue({ count: 1 });
    await service.revoke('device');
    expect(db.tvDevice.updateMany).toHaveBeenCalledWith({ where: { id: 'device', revokedAt: null }, data: { revokedAt: expect.any(Date), roomId: null } });
  });
});

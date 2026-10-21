import { Test } from '@nestjs/testing';
import { INestApplication, UnauthorizedException, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { PrismaService } from '../prisma/prisma.service';
import { AdminTvController, TvTransportGuard } from './tv.controller';
import { TvService } from './tv.service';
import { DEFAULT_TV_SETTINGS, TvSettingsService } from './tv-settings.service';

describe('resort settings persistence and privacy', () => {
  let db: any;
  let settings: TvSettingsService;
  beforeEach(() => {
    db = { tvResortSettings: { findUnique: jest.fn().mockResolvedValue(null), upsert: jest.fn() } };
    settings = new TvSettingsService(db as PrismaService);
  });
  it('starts with no invented Wi-Fi credentials or unapproved house rules', async () => {
    const value = await settings.forTelevision();
    expect(value.wifi).toEqual({ ssid: '', password: '' });
    expect(value.ro.houseRules).toBe(''); expect(value.en.houseRules).toBe('');
    expect(value.ro.usefulInfo).toContain('14:00');
  });
  it('shares concurrent reads and serves both languages without editor metadata', async () => {
    db.tvResortSettings.findUnique.mockResolvedValue({ ...DEFAULT_TV_SETTINGS, updatedAt: new Date(), updatedByAdminId: 'private-admin-id', id: 'resort' });
    const [first, second] = await Promise.all([settings.forTelevision(), settings.forTelevision()]);
    expect(db.tvResortSettings.findUnique).toHaveBeenCalledTimes(1);
    expect(first).toEqual(second);
    expect(JSON.stringify(first)).not.toContain('private-admin-id');
  });
  it('invalidates its cache after save and preserves password whitespace', async () => {
    await settings.get();
    const data = { ...DEFAULT_TV_SETTINGS, wifiPassword: ' password ', houseRulesRo: 'Regulă', houseRulesEn: 'Rule' };
    db.tvResortSettings.findUnique.mockResolvedValue({ ...data, updatedAt: new Date() });
    await settings.save(data, 'editor');
    expect(db.tvResortSettings.upsert.mock.calls[0][0].update.wifiPassword).toBe(' password ');
    const value = await settings.forTelevision();
    expect(value.ro.houseRules).toBe('Regulă'); expect(value.en.houseRules).toBe('Rule');
  });
});

describe('resort settings administrative HTTP boundary', () => {
  let app: INestApplication;
  let allowed: boolean;
  let settings: { get: jest.Mock; save: jest.Mock };
  const originalProxy = process.env.TV_BEHIND_HTTPS_PROXY;
  beforeEach(async () => {
    process.env.TV_BEHIND_HTTPS_PROXY = 'true'; allowed = true;
    settings = { get: jest.fn().mockResolvedValue(DEFAULT_TV_SETTINGS), save: jest.fn().mockResolvedValue({ saved: true }) };
    const module = await Test.createTestingModule({ controllers: [AdminTvController], providers: [TvTransportGuard,
      { provide: TvService, useValue: {} }, { provide: TvSettingsService, useValue: settings }] })
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: context => {
        if (!allowed) throw new UnauthorizedException();
        context.switchToHttp().getRequest().user = { id: 'admin' }; return true;
      } }).compile();
    app = module.createNestApplication(); app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })); await app.init();
  });
  afterEach(async () => { await app.close(); if (originalProxy === undefined) delete process.env.TV_BEHIND_HTTPS_PROXY; else process.env.TV_BEHIND_HTTPS_PROXY = originalProxy; });
  it('prevents anonymous reads and writes, including Wi-Fi credentials', async () => {
    allowed = false;
    await request(app.getHttpServer()).get('/api/admin/tv/settings').set('X-Forwarded-Proto', 'https').expect(401);
    await request(app.getHttpServer()).put('/api/admin/tv/settings').set('X-Forwarded-Proto', 'https').send(DEFAULT_TV_SETTINGS).expect(401);
    expect(settings.get).not.toHaveBeenCalled(); expect(settings.save).not.toHaveBeenCalled();
  });
  it('rejects excessive content, missing translations and unexpected fields', async () => {
    for (const body of [{ ...DEFAULT_TV_SETTINGS, attractionsRo: 'x'.repeat(6001) },
      { ...DEFAULT_TV_SETTINGS, houseRulesEn: undefined }, { ...DEFAULT_TV_SETTINGS, guestName: 'never' }]) {
      await request(app.getHttpServer()).put('/api/admin/tv/settings').set('X-Forwarded-Proto', 'https').send(body).expect(400);
    }
    expect(settings.save).not.toHaveBeenCalled();
  });
  it('saves both languages with the authenticated editor ID', async () => {
    await request(app.getHttpServer()).put('/api/admin/tv/settings').set('X-Forwarded-Proto', 'https').send(DEFAULT_TV_SETTINGS).expect(200);
    expect(settings.save).toHaveBeenCalledWith(DEFAULT_TV_SETTINGS, 'admin');
  });
});

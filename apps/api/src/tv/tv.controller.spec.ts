import { Test } from '@nestjs/testing';
import { INestApplication, UnauthorizedException, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminTvController, PairingRateGuard, TvController, TvTransportGuard } from './tv.controller';
import { TvService } from './tv.service';

describe('TV transport and authorization HTTP boundary', () => {
  let app: INestApplication;
  let service: { begin: jest.Mock; authenticate: jest.Mock; content: jest.Mock; list: jest.Mock; approve: jest.Mock };
  const originalProxy = process.env.TV_BEHIND_HTTPS_PROXY;
  const originalRender = process.env.RENDER;
  beforeEach(async () => {
    delete process.env.TV_BEHIND_HTTPS_PROXY;
    delete process.env.RENDER;
    service = { begin: jest.fn().mockResolvedValue({ code: 'ABCD1234' }),
      authenticate: jest.fn().mockResolvedValue({ roomId: 'assigned' }),
      content: jest.fn().mockResolvedValue({ mode: 'STANDARD', guest: null }),
      list: jest.fn(), approve: jest.fn() };
    const module = await Test.createTestingModule({ controllers: [TvController, AdminTvController],
      providers: [TvTransportGuard, PairingRateGuard, { provide: TvService, useValue: service }] })
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => { throw new UnauthorizedException(); } }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });
  afterEach(async () => { await app.close();
    if (originalProxy === undefined) delete process.env.TV_BEHIND_HTTPS_PROXY;
    else process.env.TV_BEHIND_HTTPS_PROXY = originalProxy;
    if (originalRender === undefined) delete process.env.RENDER;
    else process.env.RENDER = originalRender;
  });

  it('rejects HTTP credentials and spoofed proxy headers by default', async () => {
    await request(app.getHttpServer()).get('/api/tv/me/content').set('X-Forwarded-Proto', 'https').expect(426);
    expect(service.authenticate).not.toHaveBeenCalled();
  });

  it('uses the authenticated apartment instead of a client-supplied room', async () => {
    process.env.TV_BEHIND_HTTPS_PROXY = 'true';
    const response = await request(app.getHttpServer()).get('/api/tv/me/content?roomId=another-apartment')
      .set('X-Forwarded-Proto', 'https').set('Authorization', `Bearer ${'a'.repeat(64)}`).expect(200);
    expect(service.content).toHaveBeenCalledWith({ roomId: 'assigned' });
    expect(response.headers['cache-control']).toBe('no-store');
  });

  it('accepts Render managed HTTPS ingress without enabling HTTP locally', async () => {
    process.env.RENDER = 'true';
    await request(app.getHttpServer()).get('/api/tv/me/content').set('X-Forwarded-Proto', 'https').expect(200);
    await request(app.getHttpServer()).get('/api/tv/me/content').set('X-Forwarded-Proto', 'http').expect(426);
  });

  it('keeps TV credentials out of administrative endpoints', async () => {
    process.env.TV_BEHIND_HTTPS_PROXY = 'true';
    await request(app.getHttpServer()).get('/api/admin/tv/devices')
      .set('X-Forwarded-Proto', 'https').set('Authorization', `Bearer ${'a'.repeat(64)}`).expect(401);
    expect(service.list).not.toHaveBeenCalled();
  });

  it('rejects weak secrets and client-supplied apartment assignment at registration', async () => {
    process.env.TV_BEHIND_HTTPS_PROXY = 'true';
    for (const body of [{ secret: 'weak' }, { secret: 'a'.repeat(64), roomId: 'room' }]) {
      await request(app.getHttpServer()).post('/api/tv/pairing').set('X-Forwarded-Proto', 'https').send(body).expect(400);
    }
    expect(service.begin).not.toHaveBeenCalled();
  });

  it('rate limits public registration before it reaches the database', async () => {
    process.env.TV_BEHIND_HTTPS_PROXY = 'true';
    for (let i = 0; i < 5; i++) await request(app.getHttpServer()).post('/api/tv/pairing')
      .set('X-Forwarded-Proto', 'https').send({ secret: 'a'.repeat(64) }).expect(201);
    await request(app.getHttpServer()).post('/api/tv/pairing')
      .set('X-Forwarded-Proto', 'https').send({ secret: 'a'.repeat(64) }).expect(429);
    expect(service.begin).toHaveBeenCalledTimes(5);
  });
});

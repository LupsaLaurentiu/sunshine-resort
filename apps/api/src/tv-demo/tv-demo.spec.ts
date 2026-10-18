import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TvDemoModule } from './tv-demo.module';
import { isTvDemoRequest } from './demo-cors';

describe('TV demo HTTP boundary', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [TvDemoModule] }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableCors((req, callback) => callback(null,
      isTvDemoRequest(req.path, req.method)
        ? { origin: '*', credentials: false, methods: ['GET'] }
        : { origin: false }));
    await app.init();
  });
  afterAll(async () => { await app.close(); });

  it('serves fictional content to a packaged app without credentials or caching', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/tv/demo/content').set('Origin', 'null').expect(200);
    expect(response.headers['access-control-allow-origin']).toBe('*');
    expect(response.headers['access-control-allow-credentials']).toBeUndefined();
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.body.mode).toBe('MOCK');
    expect(response.body.guest).toEqual({ displayName: 'John Smith' });
    expect(Object.keys(response.body).sort()).toEqual(['guest', 'information', 'mode', 'resortName', 'tagline']);
  });

  it('does not open unrelated API paths or methods to TV origins', async () => {
    expect(isTvDemoRequest('/api/reservations', 'GET')).toBe(false);
    expect(isTvDemoRequest('/api/tv/demo/content', 'POST')).toBe(false);
    const response = await request(app.getHttpServer())
      .get('/api/reservations').set('Origin', 'null').expect(404);
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });
});

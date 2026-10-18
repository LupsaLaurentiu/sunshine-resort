import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { TvDemoModule } from './tv-demo.module';

// LAN demo runner: same Nest module as the main API, without starting PMS jobs
// or connecting to the production database. No environment secrets required.
async function bootstrap() {
  const app = await NestFactory.create(TvDemoModule);
  app.setGlobalPrefix('api');
  app.enableCors({ origin: '*', credentials: false, methods: ['GET'] });
  await app.listen(Number(process.env.TV_DEMO_PORT ?? 3002), '0.0.0.0');
}
void bootstrap();

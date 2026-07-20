import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  const configService = app.get(ConfigService);

  const port = configService.get<number>("PORT", 3001);

  const configuredFrontendUrl = configService.get<string>(
    "FRONTEND_URL",
    "http://localhost:3000",
  );

  const allowedOrigins = [
    configuredFrontendUrl,
    "http://localhost:3000",
    "http://25.31.85.11:3000",
  ];

  app.setGlobalPrefix("api");

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.enableShutdownHooks();

  await app.listen(port, "0.0.0.0");

  console.log(
    `Sunshine Resort API running on http://localhost:${port}/api`,
  );
}

void bootstrap();
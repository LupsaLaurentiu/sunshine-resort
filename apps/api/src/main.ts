import {
  ValidationPipe,
} from "@nestjs/common";

import {
  ConfigService,
} from "@nestjs/config";

import {
  NestFactory,
} from "@nestjs/core";

import {
  AppModule,
} from "./app.module";

async function bootstrap() {
  const app =
    await NestFactory.create(
      AppModule,
      {
        rawBody:
          true,
      },
    );

  const configService =
    app.get(
      ConfigService,
    );

  const port =
    configService.get<number>(
      "PORT",
      3001,
    );

  const configuredFrontendUrl =
    configService.get<string>(
      "FRONTEND_URL",
      "http://localhost:3000",
    );

  const allowedOrigins = [
    configuredFrontendUrl,
    "http://localhost:3000",
  ].filter(
    (
      origin,
      index,
      origins,
    ) =>
      Boolean(
        origin,
      ) &&
      origins.indexOf(
        origin,
      ) === index,
  );

  app.setGlobalPrefix(
    "api",
  );

  app.enableCors({
    origin: (
      origin,
      callback,
    ) => {
      if (
        !origin ||
        allowedOrigins.includes(
          origin,
        )
      ) {
        callback(
          null,
          true,
        );

        return;
      }

      callback(
        new Error(
          `Origin not allowed by CORS: ${origin}`,
        ),
      );
    },

    credentials:
      true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist:
        true,

      forbidNonWhitelisted:
        true,

      transform:
        true,

      transformOptions: {
        enableImplicitConversion:
          true,
      },
    }),
  );

  app.enableShutdownHooks();

  await app.listen(
    port,
    "0.0.0.0",
  );

  console.log(
    `Sunshine Resort API running on port ${port}`,
  );
}

void bootstrap();
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AdminsModule } from './admins/admins.module';
import { AuthModule } from './auth/auth.module';
import { RoomTypesModule } from './room-types/room-types.module';
import { RoomsModule } from './rooms/rooms.module';
import { RatePeriodsModule } from './rate-periods/rate-periods.module';
import { BlockedPeriodsModule } from './blocked-periods/blocked-periods.module';
import { AvailabilityModule } from './availability/availability.module';
import { ReservationsModule } from './reservations/reservations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AdminsModule,
    AuthModule,
    RoomTypesModule,
    RoomsModule,
    RatePeriodsModule,
    BlockedPeriodsModule,
    AvailabilityModule,
    ReservationsModule,
  ],
})
export class AppModule {}
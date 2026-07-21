import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AdminsModule } from './admins/admins.module';
import { AuthModule } from './auth/auth.module';
import { AvailabilityModule } from './availability/availability.module';
import { BlockedPeriodsModule } from './blocked-periods/blocked-periods.module';
import { EmailModule } from './email/email.module';
import { PaymentsModule } from './payments/payments.module';
import { PrismaModule } from './prisma/prisma.module';
import { RatePeriodsModule } from './rate-periods/rate-periods.module';
import { ReservationsModule } from './reservations/reservations.module';
import { RoomsModule } from './rooms/rooms.module';
import { RoomTypesModule } from './room-types/room-types.module';
import { CalendarModule } from './calendar/calendar.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    ScheduleModule.forRoot(),

    PrismaModule,
    AuthModule,
    AdminsModule,
    RoomTypesModule,
    RoomsModule,
    RatePeriodsModule,
    BlockedPeriodsModule,
    AvailabilityModule,
    ReservationsModule,
    PaymentsModule,
    EmailModule,
    CalendarModule,
    DashboardModule,
  ],
})
export class AppModule {}
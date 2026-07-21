import { Module } from '@nestjs/common';

import { ReservationsModule } from '../reservations/reservations.module';

import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';

@Module({
  imports: [
    ReservationsModule,
  ],

  controllers: [
    CalendarController,
  ],

  providers: [
    CalendarService,
  ],

  exports: [
    CalendarService,
  ],
})
export class CalendarModule {}
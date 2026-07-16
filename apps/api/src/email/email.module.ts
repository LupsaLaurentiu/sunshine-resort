import { Global, Module } from '@nestjs/common';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { ReservationEmailBuilder } from './builders/reservation-email.builder';

@Global()
@Module({
  controllers: [EmailController],

  providers: [
    EmailService,
    ReservationEmailBuilder,
  ],

  exports: [
    EmailService,
    ReservationEmailBuilder,
  ],
})
export class EmailModule {}
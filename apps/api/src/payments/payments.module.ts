import { Module } from '@nestjs/common';
import { ReservationsModule } from '../reservations/reservations.module';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PublicPaymentsController } from './public-payments.controller';

@Module({
  imports: [ReservationsModule],

  controllers: [
    PaymentsController,
    PublicPaymentsController,
  ],

  providers: [PaymentsService],

  exports: [PaymentsService],
})
export class PaymentsModule {}
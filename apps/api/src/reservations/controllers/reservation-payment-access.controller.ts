import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';

import { Public } from '../../auth/decorators/public.decorator';

import { PaymentAccessQueryDto } from '../dto/payment-access-query.dto';

import { ReservationPaymentAccessService } from '../services/reservation-payment-access.service';

@Controller('reservations/payment-access')
export class ReservationPaymentAccessController {
  constructor(
    private readonly reservationPaymentAccessService: ReservationPaymentAccessService,
  ) {}

  /**
   * Endpoint public folosit de pagina de plată.
   *
   * Frontend:
   * /ro/plata?token=...
   *
   * ↓
   *
   * GET /api/reservations/payment-access?token=...
   */
  @Public()
  @Get()
    getReservation(
        @Query() query: PaymentAccessQueryDto,
        ) {

        return this.reservationPaymentAccessService.getReservationByToken(
            query.token,
        );
    }
}
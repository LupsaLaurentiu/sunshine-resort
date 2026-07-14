import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { CreateReservationChangeCheckoutDto } from './dto/create-reservation-change-checkout.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
  ) {}

  @Post('checkout')
  @HttpCode(HttpStatus.OK)
  createCheckoutSession(
    @Body() dto: CreateCheckoutSessionDto,
  ) {
    return this.paymentsService.createCheckoutSession(dto);
  }

  @Post('reservation-change-checkout')
  @HttpCode(HttpStatus.OK)
  createReservationChangeCheckout(
    @Body() dto: CreateReservationChangeCheckoutDto,
  ) {
    return this.paymentsService.createReservationChangeCheckoutSession(
      dto,
    );
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  handleWebhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers('stripe-signature')
    stripeSignature: string | undefined,
  ) {
    return this.paymentsService.handleWebhook(
      request.rawBody,
      stripeSignature,
    );
  }
}
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { CreatePublicCheckoutSessionDto } from './dto/create-public-checkout-session.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PublicPaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
  ) {}

  @Public()
  @Post('public-checkout')
  @HttpCode(HttpStatus.OK)
  createPublicCheckoutSession(
    @Body() dto: CreatePublicCheckoutSessionDto,
  ) {
    return this.paymentsService.createPublicCheckoutSession(
      dto,
    );
  }
}
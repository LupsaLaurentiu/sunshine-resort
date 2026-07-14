import { PaymentType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateCheckoutSessionDto {
  @IsString()
  @IsNotEmpty()
  reservationId!: string;

  @IsEnum(PaymentType)
  paymentType!: PaymentType;
}
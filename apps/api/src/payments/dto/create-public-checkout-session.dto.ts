import {
  IsEnum,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { PaymentType } from '@prisma/client';

export class CreatePublicCheckoutSessionDto {
  @IsString()
  @IsNotEmpty()
  @Length(64, 64, {
    message:
      'Tokenul de plată trebuie să conțină exact 64 de caractere.',
  })
  @Matches(/^[a-f0-9]{64}$/i, {
    message:
      'Tokenul de plată are un format invalid.',
  })
  token!: string;

  @IsEnum(PaymentType)
  paymentType!: PaymentType;
}
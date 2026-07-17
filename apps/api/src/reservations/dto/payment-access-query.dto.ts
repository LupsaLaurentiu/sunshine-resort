import {
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class PaymentAccessQueryDto {
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
}
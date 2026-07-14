import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateReservationChangeDto {
  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'checkIn trebuie să aibă formatul YYYY-MM-DD.',
  })
  checkIn!: string;

  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'checkOut trebuie să aibă formatul YYYY-MM-DD.',
  })
  checkOut!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  guestReason?: string;
}
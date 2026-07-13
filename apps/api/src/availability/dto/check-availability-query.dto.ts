import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  Matches,
  Min,
} from 'class-validator';

export class CheckAvailabilityQueryDto {
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

  @Type(() => Number)
  @IsInt()
  @Min(1)
  adults!: number;
}
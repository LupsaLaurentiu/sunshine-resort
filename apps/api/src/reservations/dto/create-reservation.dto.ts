import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Locale } from '@prisma/client';
import { ReservationGuestDto } from './reservation-guest.dto';
import { ReservationRoomSelectionDto } from './reservation-room-selection.dto';

export class CreateReservationDto {
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
  @IsEnum(Locale)
  locale?: Locale;

  @ValidateNested()
  @Type(() => ReservationGuestDto)
  guest!: ReservationGuestDto;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(8)
  @ValidateNested({ each: true })
  @Type(() => ReservationRoomSelectionDto)
  rooms!: ReservationRoomSelectionDto[];

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  guestNotes?: string;
}
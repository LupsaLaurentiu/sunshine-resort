import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateRatePeriodDto {
  @IsString()
  @IsNotEmpty()
  roomTypeId!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsNumber()
  @Min(0)
  weekdayPrice!: number;

  @IsNumber()
  @Min(0)
  weekendPrice!: number;

  @IsOptional()
  @IsBoolean()
  isPromotion?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  originalWeekdayPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  originalWeekendPrice?: number;

  @IsOptional()
  @IsString()
  titleRo?: string;

  @IsOptional()
  @IsString()
  titleEn?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateRoomTypeDto {
  @IsString()
  @IsNotEmpty()
  nameRo!: string;

  @IsString()
  @IsNotEmpty()
  nameEn!: string;

  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsOptional()
  @IsString()
  descriptionRo?: string;

  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @IsNumber()
  @Min(0)
  weekdayBasePrice!: number;

  @IsNumber()
  @Min(0)
  weekendBasePrice!: number;

  @IsInt()
  @Min(1)
  maxAdults!: number;

  @IsOptional()
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0)
  extraAdultPrice!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  sizeSqm?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
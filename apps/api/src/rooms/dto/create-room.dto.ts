import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsNotEmpty()
  roomTypeId!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  floor?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  tvDeviceId?: string;

  @IsOptional()
  @IsBoolean()
  allowsExtraAdult?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
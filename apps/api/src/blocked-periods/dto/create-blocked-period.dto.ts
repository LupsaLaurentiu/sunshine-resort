import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBlockedPeriodDto {
  @IsString()
  @IsNotEmpty()
  roomId!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  reason?: string;
}
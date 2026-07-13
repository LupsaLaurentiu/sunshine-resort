import { IsDateString, IsOptional, IsString } from 'class-validator';

export class FindBlockedPeriodsQueryDto {
  @IsOptional()
  @IsString()
  roomId?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
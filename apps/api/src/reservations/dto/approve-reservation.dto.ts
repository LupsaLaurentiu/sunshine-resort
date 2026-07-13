import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ApproveReservationDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  adminNotes?: string;
}
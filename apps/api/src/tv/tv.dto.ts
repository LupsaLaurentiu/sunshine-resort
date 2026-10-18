import { IsBoolean, IsOptional, IsString, Length, Matches } from 'class-validator';

export class BeginTvPairingDto {
  @Matches(/^[a-f0-9]{64}$/)
  secret: string;
}
export class ApproveTvPairingDto {
  @Matches(/^[A-F0-9]{8}$/)
  code: string;
  @IsString() @Length(1, 100)
  roomId: string;
}
export class UpdateTvDeviceDto {
  @IsOptional() @IsString() @Length(1, 100)
  roomId?: string;
  @IsOptional() @IsBoolean()
  hideGuestName?: boolean;
  @IsOptional() @IsBoolean()
  forceStandard?: boolean;
}

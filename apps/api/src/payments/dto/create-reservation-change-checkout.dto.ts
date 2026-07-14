import { IsNotEmpty, IsString } from 'class-validator';

export class CreateReservationChangeCheckoutDto {
  @IsString()
  @IsNotEmpty()
  reservationChangeId!: string;
}
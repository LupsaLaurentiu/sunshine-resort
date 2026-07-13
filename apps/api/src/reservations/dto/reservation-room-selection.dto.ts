import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class ReservationRoomSelectionDto {
  @IsString()
  @IsNotEmpty()
  roomTypeId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(8)
  quantity!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  adultsPerRoom!: number;
}
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
} from 'class-validator';

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

  /**
   * Numărul apartamentelor din această selecție
   * care vor avea un adult suplimentar.
   *
   * Exemplu:
   * quantity = 3
   * extraAdultQuantity = 1
   *
   * => două apartamente normale
   * => un apartament cu adult suplimentar
   */
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(8)
  extraAdultQuantity: number = 0;
}
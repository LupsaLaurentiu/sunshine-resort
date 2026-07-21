import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class FindCalendarQueryDto {
  @IsDateString()
  from!: string;

  @IsDateString()
  to!: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (
      value === true ||
      value === 'true'
    ) {
      return true;
    }

    if (
      value === false ||
      value === 'false'
    ) {
      return false;
    }

    return value;
  })
  @IsBoolean()
  includePending?: boolean;
}
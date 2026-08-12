import {
  IsDateString,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CheckRoomCalendarQueryDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  roomTypeSlug!: string;

  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message:
      'from trebuie să aibă formatul YYYY-MM-DD.',
  })
  from!: string;

  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message:
      'to trebuie să aibă formatul YYYY-MM-DD.',
  })
  to!: string;
}
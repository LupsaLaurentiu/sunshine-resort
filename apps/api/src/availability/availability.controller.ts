import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';

import {
  AvailabilityService,
} from './availability.service';

import {
  CheckAvailabilityQueryDto,
} from './dto/check-availability-query.dto';

import {
  CheckRoomCalendarQueryDto,
} from './dto/check-room-calendar-query.dto';

@Controller('availability')
export class AvailabilityController {
  constructor(
    private readonly availabilityService:
      AvailabilityService,
  ) {}

  @Get('calendar')
  getRoomCalendar(
    @Query()
    query:
      CheckRoomCalendarQueryDto,
  ) {
    return this.availabilityService.getRoomCalendar(
      query,
    );
  }

  @Get()
  checkAvailability(
    @Query()
    query:
      CheckAvailabilityQueryDto,
  ) {
    return this.availabilityService.checkAvailability(
      query,
    );
  }
}
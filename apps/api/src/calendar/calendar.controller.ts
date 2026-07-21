import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CalendarService } from './calendar.service';
import { FindCalendarQueryDto } from './dto/find-calendar-query.dto';

@Controller('admin/calendar')
@UseGuards(JwtAuthGuard)
export class CalendarController {
  constructor(
    private readonly calendarService: CalendarService,
  ) {}

  @Get()
  findCalendar(
    @Query()
    query: FindCalendarQueryDto,
  ) {
    return this.calendarService.findCalendar(
      query,
    );
  }
}
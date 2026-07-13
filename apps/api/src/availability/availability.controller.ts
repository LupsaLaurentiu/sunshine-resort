import { Controller, Get, Query } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { CheckAvailabilityQueryDto } from './dto/check-availability-query.dto';

@Controller('availability')
export class AvailabilityController {
  constructor(
    private readonly availabilityService: AvailabilityService,
  ) {}

  @Get()
  checkAvailability(
    @Query() query: CheckAvailabilityQueryDto,
  ) {
    return this.availabilityService.checkAvailability(
      query,
    );
  }
}
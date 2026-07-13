import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentAdmin } from '../common/decorators/current-admin.decorator';
import type { CurrentAdminData } from '../common/decorators/current-admin.decorator';
import { CreateRatePeriodDto } from './dto/create-rate-period.dto';
import { UpdateRatePeriodDto } from './dto/update-rate-period.dto';
import { RatePeriodsService } from './rate-periods.service';

@Controller('rate-periods')
@UseGuards(JwtAuthGuard)
export class RatePeriodsController {
  constructor(
    private readonly ratePeriodsService: RatePeriodsService,
  ) {}

  @Get()
  findAll() {
    return this.ratePeriodsService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.ratePeriodsService.findById(id);
  }

  @Post()
  create(
    @Body() dto: CreateRatePeriodDto,
    @CurrentAdmin() admin: CurrentAdminData,
  ) {
    return this.ratePeriodsService.create(dto, admin.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRatePeriodDto,
  ) {
    return this.ratePeriodsService.update(id, dto);
  }

  @Delete(':id')
  deactivate(@Param('id') id: string) {
    return this.ratePeriodsService.deactivate(id);
  }
}
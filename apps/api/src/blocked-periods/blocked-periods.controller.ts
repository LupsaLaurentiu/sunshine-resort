import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentAdmin } from '../common/decorators/current-admin.decorator';
import type { CurrentAdminData } from '../common/decorators/current-admin.decorator';
import { BlockedPeriodsService } from './blocked-periods.service';
import { CreateBlockedPeriodDto } from './dto/create-blocked-period.dto';
import { FindBlockedPeriodsQueryDto } from './dto/find-blocked-periods-query.dto';
import { UpdateBlockedPeriodDto } from './dto/update-blocked-period.dto';

@Controller('blocked-periods')
@UseGuards(JwtAuthGuard)
export class BlockedPeriodsController {
  constructor(
    private readonly blockedPeriodsService: BlockedPeriodsService,
  ) {}

  @Get()
  findAll(@Query() query: FindBlockedPeriodsQueryDto) {
    return this.blockedPeriodsService.findAll(query);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.blockedPeriodsService.findById(id);
  }

  @Post()
  create(
    @Body() dto: CreateBlockedPeriodDto,
    @CurrentAdmin() admin: CurrentAdminData,
  ) {
    return this.blockedPeriodsService.create(dto, admin.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBlockedPeriodDto,
  ) {
    return this.blockedPeriodsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blockedPeriodsService.remove(id);
  }
}
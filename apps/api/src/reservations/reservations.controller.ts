import {
  Body,
  Controller,
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
import { ApproveReservationDto } from './dto/approve-reservation.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { FindReservationsQueryDto } from './dto/find-reservations-query.dto';
import { RejectReservationDto } from './dto/reject-reservation.dto';
import { ReservationsService } from './reservations.service';
import { ReservationReviewService } from './services/reservation-review.service';

@Controller('reservations')
export class ReservationsController {
  constructor(
    private readonly reservationsService: ReservationsService,
    private readonly reservationReviewService: ReservationReviewService,
  ) {}

  /*
   * Endpoint public.
   */
  @Post()
  create(@Body() dto: CreateReservationDto) {
    return this.reservationsService.create(dto);
  }

  /*
   * Endpoint administrativ.
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Query() query: FindReservationsQueryDto,
  ) {
    return this.reservationsService.findAll(query);
  }

  /*
   * Endpoint administrativ.
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.reservationsService.findById(id);
  }

  /*
   * Adminul aprobă cererea inițială.
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id/approve')
  approve(
    @Param('id') id: string,
    @Body() dto: ApproveReservationDto,
    @CurrentAdmin() admin: CurrentAdminData,
  ) {
    return this.reservationReviewService.approve(
      id,
      admin.id,
      dto,
    );
  }

  /*
   * Adminul respinge cererea inițială.
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id/reject')
  reject(
    @Param('id') id: string,
    @Body() dto: RejectReservationDto,
    @CurrentAdmin() admin: CurrentAdminData,
  ) {
    return this.reservationReviewService.reject(
      id,
      admin.id,
      dto,
    );
  }
}
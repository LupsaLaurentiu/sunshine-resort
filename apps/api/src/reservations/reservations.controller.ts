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
import { CancelReservationDto } from './dto/cancel-reservation.dto';
import { CreateManualReservationDto } from './dto/create-manual-reservation.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { FindReservationsQueryDto } from './dto/find-reservations-query.dto';
import { RejectReservationDto } from './dto/reject-reservation.dto';
import { ReservationsService } from './reservations.service';
import { ReservationCancellationService } from './services/reservation-cancellation.service';
import { ReservationManualService } from './services/reservation-manual.service';
import { ReservationReviewService } from './services/reservation-review.service';
import { CreateReservationChangeDto } from './dto/create-reservation-change.dto';
import { ReservationChangeService } from './services/reservation-change.service';

@Controller('reservations')
export class ReservationsController {
  constructor(
  private readonly reservationsService: ReservationsService,
  private readonly reservationReviewService: ReservationReviewService,
  private readonly reservationCancellationService: ReservationCancellationService,
  private readonly reservationManualService: ReservationManualService,
  private readonly reservationChangeService: ReservationChangeService,
) {}

  /**
   * Cerere publică de rezervare.
   */
  @Post()
  create(@Body() dto: CreateReservationDto) {
    return this.reservationsService.create(dto);
  }

  /**
   * Rezervare creată manual de admin.
   * Trebuie declarată înaintea rutei GET :id.
   */
  @UseGuards(JwtAuthGuard)
  @Post('manual')
  createManual(
    @Body() dto: CreateManualReservationDto,
    @CurrentAdmin() admin: CurrentAdminData,
  ) {
    return this.reservationManualService.create(
      dto,
      admin.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Query() query: FindReservationsQueryDto,
  ) {
    return this.reservationsService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.reservationsService.findById(id);
  }

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

  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancel')
  cancel(
    @Param('id') id: string,
    @Body() dto: CancelReservationDto,
    @CurrentAdmin() admin: CurrentAdminData,
  ) {
    return this.reservationCancellationService.cancel(
      id,
      admin.id,
      dto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/change')
  createChangeRequest(
    @Param('id') id: string,
    @Body() dto: CreateReservationChangeDto,
  ) {
    return this.reservationChangeService.create(
      id,
      dto,
    );
  }
}
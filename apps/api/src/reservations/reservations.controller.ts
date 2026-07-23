import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentAdmin } from '../common/decorators/current-admin.decorator';
import type { CurrentAdminData } from '../common/decorators/current-admin.decorator';
import { ApproveReservationDto } from './dto/approve-reservation.dto';
import { CancelReservationDto } from './dto/cancel-reservation.dto';
import { CreateManualReservationDto } from './dto/create-manual-reservation.dto';
import { CreateReservationChangeDto } from './dto/create-reservation-change.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { FindReservationsQueryDto } from './dto/find-reservations-query.dto';
import { RejectReservationDto } from './dto/reject-reservation.dto';
import { ReservationsService } from './reservations.service';
import { ReservationCancellationService } from './services/reservation-cancellation.service';
import { ReservationChangeService } from './services/reservation-change.service';
import { ReservationCheckInService } from './services/reservation-checkin.service';
import { ReservationExportService } from './services/reservation-export.service';
import { ReservationManualService } from './services/reservation-manual.service';
import { ReservationReviewService } from './services/reservation-review.service';

@Controller('reservations')
export class ReservationsController {
  constructor(
    private readonly reservationsService: ReservationsService,
    private readonly reservationReviewService: ReservationReviewService,
    private readonly reservationCancellationService: ReservationCancellationService,
    private readonly reservationManualService: ReservationManualService,
    private readonly reservationChangeService: ReservationChangeService,
    private readonly reservationCheckInService: ReservationCheckInService,
    private readonly reservationExportService: ReservationExportService,
  ) {}

  /**
   * Cerere publică de rezervare.
   */
  @Post()
  create(
    @Body()
    dto: CreateReservationDto,
  ) {
    return this.reservationsService.create(
      dto,
    );
  }

  /**
   * Rezervare creată manual de administrator.
   */
  @UseGuards(JwtAuthGuard)
  @Post('manual')
  createManual(
    @Body()
    dto: CreateManualReservationDto,

    @CurrentAdmin()
    admin: CurrentAdminData,
  ) {
    return this.reservationManualService.create(
      dto,
      admin.id,
    );
  }

  /**
   * Export Excel pentru rezervări.
   *
   * Ruta trebuie declarată înainte de @Get(':id'),
   * altfel "export" poate fi interpretat drept ID.
   */
  @UseGuards(JwtAuthGuard)
  @Get('export')
  async exportReservations(
    @Query()
    query: FindReservationsQueryDto,
  ): Promise<StreamableFile> {
    const result =
      await this.reservationExportService.exportReservations(
        query,
      );

    return result.file;
  }

  /**
   * Listarea rezervărilor pentru admin.
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Query()
    query: FindReservationsQueryDto,
  ) {
    return this.reservationsService.findAll(
      query,
    );
  }

  /**
   * Cerere de modificare a perioadei.
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/change')
  createChangeRequest(
    @Param('id')
    id: string,

    @Body()
    dto: CreateReservationChangeDto,
  ) {
    return this.reservationChangeService.create(
      id,
      dto,
    );
  }

  /**
   * Check-in administrativ.
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id/check-in')
  checkIn(
    @Param('id')
    id: string,

    @CurrentAdmin()
    admin: CurrentAdminData,
  ) {
    return this.reservationCheckInService.checkIn(
      id,
      admin.id,
    );
  }

  /**
   * Check-out administrativ.
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id/check-out')
  checkOut(
    @Param('id')
    id: string,

    @CurrentAdmin()
    admin: CurrentAdminData,
  ) {
    return this.reservationCheckInService.checkOut(
      id,
      admin.id,
    );
  }

  /**
   * Aprobare cerere inițială.
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id/approve')
  approve(
    @Param('id')
    id: string,

    @Body()
    dto: ApproveReservationDto,

    @CurrentAdmin()
    admin: CurrentAdminData,
  ) {
    return this.reservationReviewService.approve(
      id,
      admin.id,
      dto,
    );
  }

  /**
   * Respingere cerere inițială.
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id/reject')
  reject(
    @Param('id')
    id: string,

    @Body()
    dto: RejectReservationDto,

    @CurrentAdmin()
    admin: CurrentAdminData,
  ) {
    return this.reservationReviewService.reject(
      id,
      admin.id,
      dto,
    );
  }

  /**
   * Anularea rezervării.
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancel')
  cancel(
    @Param('id')
    id: string,

    @Body()
    dto: CancelReservationDto,

    @CurrentAdmin()
    admin: CurrentAdminData,
  ) {
    return this.reservationCancellationService.cancel(
      id,
      admin.id,
      dto,
    );
  }

  /**
   * Detaliile unei rezervări.
   *
   * Ruta dinamică trebuie să rămână ultima dintre rutele GET
   * care folosesc prefixul /reservations.
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findById(
    @Param('id')
    id: string,
  ) {
    return this.reservationsService.findById(
      id,
    );
  }
}
import {
  Body,
  Controller,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentAdmin } from '../../common/decorators/current-admin.decorator';
import type { CurrentAdminData } from '../../common/decorators/current-admin.decorator';
import { ApproveReservationChangeDto } from '../dto/approve-reservation-change.dto';
import { RejectReservationChangeDto } from '../dto/reject-reservation-change.dto';
import { ReservationChangeReviewService } from '../services/reservation-change-review.service';

@Controller('reservation-changes')
@UseGuards(JwtAuthGuard)
export class ReservationChangesController {
  constructor(
    private readonly reservationChangeReviewService: ReservationChangeReviewService,
  ) {}

  @Patch(':id/approve')
  approve(
    @Param('id') id: string,
    @Body() dto: ApproveReservationChangeDto,
    @CurrentAdmin() admin: CurrentAdminData,
  ) {
    return this.reservationChangeReviewService.approve(
      id,
      admin.id,
      dto,
    );
  }

  @Patch(':id/reject')
  reject(
    @Param('id') id: string,
    @Body() dto: RejectReservationChangeDto,
    @CurrentAdmin() admin: CurrentAdminData,
  ) {
    return this.reservationChangeReviewService.reject(
      id,
      admin.id,
      dto,
    );
  }
}
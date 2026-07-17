import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ReservationEmailSchedulerService } from '../services/reservation-email-scheduler.service';

@Controller('reservations/email-scheduler')
@UseGuards(JwtAuthGuard)
export class ReservationEmailSchedulerController {
  constructor(
    private readonly reservationEmailSchedulerService: ReservationEmailSchedulerService,
  ) {}

  @Post('run')
  @HttpCode(HttpStatus.OK)
  async runScheduledEmails() {
    await this.reservationEmailSchedulerService.processScheduledEmails();

    return {
      success: true,
      message:
        'Procesarea manuală a emailurilor programate a fost executată.',
    };
  }
}
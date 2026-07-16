import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { SendTestEmailDto } from './dto/send-test-email.dto';
import { EmailService } from './email.service';

@Controller('email')
@UseGuards(JwtAuthGuard)
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
  ) {}

  @Post('test')
  @HttpCode(HttpStatus.OK)
  async sendTestEmail(
    @Body() dto: SendTestEmailDto,
  ) {
    return this.emailService.sendTestEmail({
      to: dto.to,
      subject: dto.subject,
      message: dto.message,
    });
  }
}
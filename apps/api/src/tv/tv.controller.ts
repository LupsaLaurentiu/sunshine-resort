import { Body, CanActivate, Controller, ExecutionContext, Get, Header, Headers, HttpException, Injectable, Module, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentAdmin } from '../common/decorators/current-admin.decorator';
import type { CurrentAdminData } from '../common/decorators/current-admin.decorator';
import { PrismaModule } from '../prisma/prisma.module';
import { TvService } from './tv.service';
import { ApproveTvPairingDto, BeginTvPairingDto, UpdateTvDeviceDto } from './tv.dto';
import { TvSettingsService, UpdateTvSettingsDto } from './tv-settings.service';

@Injectable()
export class TvTransportGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    // Render terminates TLS at its managed ingress and sets RENDER=true.
    const managedIngress = process.env.RENDER === 'true' || process.env.TV_BEHIND_HTTPS_PROXY === 'true';
    const trustedProxy = managedIngress && request.headers['x-forwarded-proto'] === 'https';
    if (!request.secure && !trustedProxy) throw new HttpException('TV credentials and guest content require HTTPS.', 426);
    return true;
  }
}

@Injectable()
export class PairingRateGuard implements CanActivate {
  private readonly attempts = new Map<string, { count: number; until: number }>();
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();
    const now = Date.now();
    for (const [key, entry] of this.attempts) if (entry.until <= now) this.attempts.delete(key);
    const key = req.ip ?? req.socket.remoteAddress ?? 'unknown';
    const entry = this.attempts.get(key) ?? { count: 0, until: now + 60_000 };
    if (entry.count >= 5 || this.attempts.size > 1024) throw new HttpException('Please wait before pairing again.', 429);
    entry.count++; this.attempts.set(key, entry);
    return true;
  }
}

@Controller('tv')
@UseGuards(TvTransportGuard)
export class TvController {
  constructor(private readonly tv: TvService) {}

  @Post('pairing')
  @UseGuards(PairingRateGuard)
  @Header('Cache-Control', 'no-store')
  begin(@Body() dto: BeginTvPairingDto) { return this.tv.begin(dto.secret); }

  @Get('me/content')
  @Header('Cache-Control', 'no-store')
  async content(@Headers('authorization') authorization?: string) {
    return this.tv.content(await this.tv.authenticate(authorization));
  }
}

@Controller('admin/tv')
@UseGuards(TvTransportGuard, JwtAuthGuard)
export class AdminTvController {
  constructor(private readonly tv: TvService, private readonly settings: TvSettingsService) {}
  @Get('settings')
  @Header('Cache-Control', 'no-store')
  settingsContent() { return this.settings.get(); }
  @Put('settings')
  @Header('Cache-Control', 'no-store')
  saveSettings(@Body() dto: UpdateTvSettingsDto, @CurrentAdmin() admin: CurrentAdminData) { return this.settings.save(dto, admin.id); }
  @Get('devices')
  @Header('Cache-Control', 'no-store')
  list() { return this.tv.list(); }
  @Post('pairings/approve')
  approve(@Body() dto: ApproveTvPairingDto, @CurrentAdmin() admin: CurrentAdminData) {
    return this.tv.approve(dto.code, dto.roomId, admin.id);
  }
  @Patch('devices/:id')
  update(@Param('id') id: string, @Body() dto: UpdateTvDeviceDto) { return this.tv.update(id, dto); }
  @Post('devices/:id/revoke')
  revoke(@Param('id') id: string) { return this.tv.revoke(id); }
}

@Module({ imports: [PrismaModule], controllers: [TvController, AdminTvController], providers: [TvService, TvSettingsService, TvTransportGuard, PairingRateGuard] })
export class TvModule {}

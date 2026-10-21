import { Injectable } from '@nestjs/common';
import { IsString, MaxLength } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';

export class UpdateTvSettingsDto {
  @IsString() @MaxLength(128) wifiSsid: string;
  @IsString() @MaxLength(128) wifiPassword: string;
  @IsString() @MaxLength(160) taglineRo: string;
  @IsString() @MaxLength(160) taglineEn: string;
  @IsString() @MaxLength(6000) houseRulesRo: string;
  @IsString() @MaxLength(6000) houseRulesEn: string;
  @IsString() @MaxLength(6000) facilitiesRo: string;
  @IsString() @MaxLength(6000) facilitiesEn: string;
  @IsString() @MaxLength(6000) attractionsRo: string;
  @IsString() @MaxLength(6000) attractionsEn: string;
  @IsString() @MaxLength(6000) usefulInfoRo: string;
  @IsString() @MaxLength(6000) usefulInfoEn: string;
  @IsString() @MaxLength(2000) contactRo: string;
  @IsString() @MaxLength(2000) contactEn: string;
}

export const DEFAULT_TV_SETTINGS: UpdateTvSettingsDto = {
  wifiSsid: '', wifiPassword: '',
  taglineRo: 'Refugiul tău privat, în inima Maramureșului.',
  taglineEn: 'Your private escape into luxury.',
  houseRulesRo: '', houseRulesEn: '', facilitiesRo: '', facilitiesEn: '',
  // Names already present on the public resort website; no invented hours/distances.
  attractionsRo: 'Ocna Șugatag\nMănăstirea Bârsana\nCimitirul Vesel\nMocănița\nBiserici de lemn și sate tradiționale',
  attractionsEn: 'Ocna Șugatag\nBârsana Monastery\nThe Merry Cemetery\nMocănița Steam Train\nWooden churches and traditional villages',
  usefulInfoRo: 'Check-in: de la ora 14:00.\nCheck-out: până la ora 10:00.',
  usefulInfoEn: 'Check-in: from 14:00.\nCheck-out: by 10:00.',
  contactRo: '', contactEn: '',
};

@Injectable()
export class TvSettingsService {
  constructor(private readonly prisma: PrismaService) {}
  private cached: { value: UpdateTvSettingsDto & { updatedAt: string | null }; until: number } | null = null;
  private pending: Promise<UpdateTvSettingsDto & { updatedAt: string | null }> | null = null;
  private revision = 0;

  async get() {
    if (this.cached && this.cached.until > Date.now()) return this.cached.value;
    if (this.pending) return this.pending;
    const revision = this.revision;
    const read = this.prisma.tvResortSettings.findUnique({ where: { id: 'resort' } }).then(row => {
      const value = { ...DEFAULT_TV_SETTINGS, ...(row ?? {}), updatedAt: row?.updatedAt.toISOString() ?? null };
      // Never expose editor IDs or other database metadata in the settings API.
      const fields = Object.fromEntries(Object.keys(DEFAULT_TV_SETTINGS).map(key => [key, value[key]])) as unknown as UpdateTvSettingsDto;
      const result = { ...fields, updatedAt: value.updatedAt };
      if (revision === this.revision) this.cached = { value: result, until: Date.now() + 15000 };
      return result;
    });
    this.pending = read;
    try { return await read; } finally { if (this.pending === read) this.pending = null; }
  }

  async save(data: UpdateTvSettingsDto, adminId: string) {
    await this.prisma.tvResortSettings.upsert({ where: { id: 'resort' },
      create: { id: 'resort', ...data, updatedByAdminId: adminId },
      update: { ...data, updatedByAdminId: adminId } });
    this.revision++; this.cached = null; this.pending = null;
    return { saved: true };
  }

  async forTelevision() {
    const data = await this.get();
    const language = (suffix: 'Ro' | 'En') => ({
      tagline: data[`tagline${suffix}`], houseRules: data[`houseRules${suffix}`],
      facilities: data[`facilities${suffix}`], attractions: data[`attractions${suffix}`],
      usefulInfo: data[`usefulInfo${suffix}`], contact: data[`contact${suffix}`],
    });
    return { wifi: { ssid: data.wifiSsid, password: data.wifiPassword }, ro: language('Ro'), en: language('En'), version: data.updatedAt };
  }
}

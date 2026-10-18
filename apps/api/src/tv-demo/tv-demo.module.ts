import { Controller, Get, Header, Module } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';

@Controller('tv/demo')
export class TvDemoController {
  @Public()
  @Get('content')
  @Header('Cache-Control', 'no-store')
  content() {
    return {
      mode: 'MOCK' as const,
      guest: { displayName: 'John Smith' },
      resortName: 'SUNSHINE RESORT',
      tagline: 'Your private escape into luxury.',
      information: [
        { title: 'Wi-Fi', text: 'Network: SunshineGuest-DEMO · Password: demo-only. Placeholder information.' },
        { title: 'Resort facilities', text: 'Pool, relaxation areas and private parking. Details to be confirmed.' },
        { title: 'House rules', text: 'Adults-only resort. Check-in 14:00 · Check-out 10:00. Full rules to follow.' },
        { title: 'Tourist attractions', text: 'Discover nearby beaches and local experiences. Recommendations to follow.' },
      ],
    };
  }
}

// Intentionally no Prisma, reservations, payments or authentication providers.
@Module({ controllers: [TvDemoController] })
export class TvDemoModule {}

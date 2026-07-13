import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { RatePeriodsController } from './rate-periods.controller';
import { RatePeriodsService } from './rate-periods.service';

@Module({
  imports: [AuthModule],
  controllers: [RatePeriodsController],
  providers: [RatePeriodsService],
  exports: [RatePeriodsService],
})
export class RatePeriodsModule {}
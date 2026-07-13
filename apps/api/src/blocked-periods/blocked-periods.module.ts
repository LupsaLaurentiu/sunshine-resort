import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BlockedPeriodsController } from './blocked-periods.controller';
import { BlockedPeriodsService } from './blocked-periods.service';

@Module({
  imports: [AuthModule],
  controllers: [BlockedPeriodsController],
  providers: [BlockedPeriodsService],
  exports: [BlockedPeriodsService],
})
export class BlockedPeriodsModule {}
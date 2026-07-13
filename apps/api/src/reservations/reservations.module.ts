import { Module } from '@nestjs/common';
import { AvailabilityModule } from '../availability/availability.module';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { ReservationAllocationService } from './services/reservation-allocation.service';
import { ReservationAvailabilityService } from './services/reservation-availability.service';
import { ReservationPricingService } from './services/reservation-pricing.service';
import { ReservationStatusService } from './services/reservation-status.service';

@Module({
  imports: [AvailabilityModule],
  controllers: [ReservationsController],
  providers: [
    ReservationsService,
    ReservationPricingService,
    ReservationAvailabilityService,
    ReservationStatusService,
    ReservationAllocationService,
  ],
  exports: [
    ReservationsService,
    ReservationPricingService,
    ReservationAvailabilityService,
    ReservationStatusService,
    ReservationAllocationService,
  ],
})
export class ReservationsModule {}
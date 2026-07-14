import { Module } from '@nestjs/common';
import { AvailabilityModule } from '../availability/availability.module';
import { ReservationChangesController } from './reservation-changes.controller';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { ReservationAllocationService } from './services/reservation-allocation.service';
import { ReservationAvailabilityService } from './services/reservation-availability.service';
import { ReservationCancellationService } from './services/reservation-cancellation.service';
import { ReservationChangeReviewService } from './services/reservation-change-review.service';
import { ReservationChangeService } from './services/reservation-change.service';
import { ReservationManualService } from './services/reservation-manual.service';
import { ReservationPricingService } from './services/reservation-pricing.service';
import { ReservationReviewService } from './services/reservation-review.service';
import { ReservationStatusService } from './services/reservation-status.service';

@Module({
  imports: [AvailabilityModule],

  controllers: [
    ReservationsController,
    ReservationChangesController,
  ],

  providers: [
    ReservationsService,
    ReservationPricingService,
    ReservationAvailabilityService,
    ReservationStatusService,
    ReservationAllocationService,
    ReservationReviewService,
    ReservationCancellationService,
    ReservationManualService,
    ReservationChangeService,
    ReservationChangeReviewService,
  ],

  exports: [
    ReservationsService,
    ReservationPricingService,
    ReservationAvailabilityService,
    ReservationStatusService,
    ReservationAllocationService,
    ReservationReviewService,
    ReservationCancellationService,
    ReservationManualService,
    ReservationChangeService,
    ReservationChangeReviewService,
  ],
})
export class ReservationsModule {}
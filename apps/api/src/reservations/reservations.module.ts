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
import { ReservationCheckInService } from './services/reservation-checkin.service';
import { ReservationExpirationService } from './services/reservation-expiration.service';
import { ReservationManualService } from './services/reservation-manual.service';
import { ReservationNotificationService } from './services/reservation-notification.service';
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
    ReservationCheckInService,
    ReservationExpirationService,
    ReservationNotificationService,
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
    ReservationCheckInService,
    ReservationExpirationService,
    ReservationNotificationService,
  ],
})
export class ReservationsModule {}
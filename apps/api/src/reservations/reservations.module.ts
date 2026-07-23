import { Module } from '@nestjs/common';
import { AvailabilityModule } from '../availability/availability.module';
import { ReservationChangesController } from './controllers/reservation-changes.controller';
import { ReservationPaymentAccessController } from './controllers/reservation-payment-access.controller';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { ReservationAllocationService } from './services/reservation-allocation.service';
import { ReservationAvailabilityService } from './services/reservation-availability.service';
import { ReservationCancellationService } from './services/reservation-cancellation.service';
import { ReservationChangeReviewService } from './services/reservation-change-review.service';
import { ReservationChangeService } from './services/reservation-change.service';
import { ReservationCheckInService } from './services/reservation-checkin.service';
import { ReservationEmailSchedulerService } from './services/reservation-email-scheduler.service';
import { ReservationExpirationService } from './services/reservation-expiration.service';
import { ReservationManualService } from './services/reservation-manual.service';
import { ReservationNotificationService } from './services/reservation-notification.service';
import { ReservationPaymentAccessService } from './services/reservation-payment-access.service';
import { ReservationPricingService } from './services/reservation-pricing.service';
import { ReservationReviewService } from './services/reservation-review.service';
import { ReservationStatusService } from './services/reservation-status.service';
import { ReservationEmailSchedulerController } from './controllers/reservation-email-scheduler.controller';
import { ReservationLifecycleSchedulerService } from './services/reservation-lifecycle-scheduler.service';
import { ReservationExportService } from './services/reservation-export.service';

@Module({
  imports: [AvailabilityModule],

  controllers: [
    ReservationPaymentAccessController,
    ReservationEmailSchedulerController,
    ReservationsController,
    ReservationChangesController,
  ],

  providers: [
    ReservationsService,
    ReservationExportService,
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
    ReservationPaymentAccessService,
    ReservationEmailSchedulerService,
    ReservationLifecycleSchedulerService,
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
    ReservationPaymentAccessService,
    ReservationEmailSchedulerService,
  ],
})
export class ReservationsModule {}
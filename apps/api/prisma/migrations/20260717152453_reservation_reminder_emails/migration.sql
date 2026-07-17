-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "oneDayReminderSentAt" TIMESTAMP(3),
ADD COLUMN     "postStayEmailSentAt" TIMESTAMP(3),
ADD COLUMN     "sevenDayReminderSentAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Reservation_sevenDayReminderSentAt_idx" ON "Reservation"("sevenDayReminderSentAt");

-- CreateIndex
CREATE INDEX "Reservation_oneDayReminderSentAt_idx" ON "Reservation"("oneDayReminderSentAt");

-- CreateIndex
CREATE INDEX "Reservation_postStayEmailSentAt_idx" ON "Reservation"("postStayEmailSentAt");

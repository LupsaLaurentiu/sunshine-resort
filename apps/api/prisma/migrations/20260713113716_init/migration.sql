/*
  Warnings:

  - The values [COMPLETED] on the enum `ReservationStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `providerPaymentId` on the `Payment` table. All the data in the column will be lost.
  - The `provider` column on the `Payment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `expiresAt` on the `Reservation` table. All the data in the column will be lost.
  - The `source` column on the `Reservation` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `pricePerNight` on the `ReservationRoom` table. All the data in the column will be lost.
  - You are about to drop the column `basePrice` on the `RoomType` table. All the data in the column will be lost.
  - You are about to drop the `Promotion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[stripeCheckoutSessionId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripePaymentIntentId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[providerEventId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tvDeviceId]` on the table `Room` will be added. If there are existing duplicate values, this will fail.
  - Made the column `phone` on table `Guest` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `nights` to the `Reservation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotalPrice` to the `Reservation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `adults` to the `ReservationRoom` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roomTypeId` to the `ReservationRoom` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weekdayPricePerNight` to the `ReservationRoom` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weekendPricePerNight` to the `ReservationRoom` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weekdayBasePrice` to the `RoomType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weekendBasePrice` to the `RoomType` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ReservationSource" AS ENUM ('DIRECT_WEBSITE', 'MANUAL_ADMIN', 'BOOKING_COM');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('STRIPE', 'CASH', 'POS', 'BANK_TRANSFER', 'MANUAL');

-- CreateEnum
CREATE TYPE "ReservationChangeStatus" AS ENUM ('PENDING_APPROVAL', 'APPROVED_AWAITING_PAYMENT', 'APPLIED', 'REJECTED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ExternalCalendarSource" AS ENUM ('BOOKING_COM');

-- CreateEnum
CREATE TYPE "Locale" AS ENUM ('RO', 'EN');

-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'CANCELLED';

-- AlterEnum
ALTER TYPE "PaymentType" ADD VALUE 'MODIFICATION_DIFFERENCE';

-- AlterEnum
BEGIN;
CREATE TYPE "ReservationStatus_new" AS ENUM ('PENDING_APPROVAL', 'APPROVED_AWAITING_PAYMENT', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'EXPIRED', 'CHECKED_IN', 'CHECKED_OUT');
ALTER TABLE "public"."Reservation" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Reservation" ALTER COLUMN "status" TYPE "ReservationStatus_new" USING ("status"::text::"ReservationStatus_new");
ALTER TYPE "ReservationStatus" RENAME TO "ReservationStatus_old";
ALTER TYPE "ReservationStatus_new" RENAME TO "ReservationStatus";
DROP TYPE "public"."ReservationStatus_old";
ALTER TABLE "Reservation" ALTER COLUMN "status" SET DEFAULT 'PENDING_APPROVAL';
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."ReservationRoom" DROP CONSTRAINT "ReservationRoom_roomId_fkey";

-- AlterTable
ALTER TABLE "BlockedPeriod" ADD COLUMN     "createdByAdminId" TEXT,
ALTER COLUMN "startDate" SET DATA TYPE DATE,
ALTER COLUMN "endDate" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "Guest" ALTER COLUMN "phone" SET NOT NULL;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "providerPaymentId",
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "failureReason" TEXT,
ADD COLUMN     "providerEventId" TEXT,
ADD COLUMN     "refundedAt" TIMESTAMP(3),
ADD COLUMN     "reservationChangeId" TEXT,
ADD COLUMN     "stripeCheckoutSessionId" TEXT,
ADD COLUMN     "stripePaymentIntentId" TEXT,
DROP COLUMN "provider",
ADD COLUMN     "provider" "PaymentProvider" NOT NULL DEFAULT 'STRIPE';

-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "expiresAt",
ADD COLUMN     "approvalExpiresAt" TIMESTAMP(3),
ADD COLUMN     "approvedByAdminId" TEXT,
ADD COLUMN     "cancellationReason" TEXT,
ADD COLUMN     "checkedInAt" TIMESTAMP(3),
ADD COLUMN     "checkedOutAt" TIMESTAMP(3),
ADD COLUMN     "createdByAdminId" TEXT,
ADD COLUMN     "depositPercentage" DECIMAL(5,2) NOT NULL DEFAULT 50,
ADD COLUMN     "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "isComplimentary" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "locale" "Locale" NOT NULL DEFAULT 'RO',
ADD COLUMN     "nights" INTEGER NOT NULL,
ADD COLUMN     "paymentExpiresAt" TIMESTAMP(3),
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "subtotalPrice" DECIMAL(10,2) NOT NULL,
ALTER COLUMN "checkInDate" SET DATA TYPE DATE,
ALTER COLUMN "checkOutDate" SET DATA TYPE DATE,
DROP COLUMN "source",
ADD COLUMN     "source" "ReservationSource" NOT NULL DEFAULT 'DIRECT_WEBSITE';

-- AlterTable
ALTER TABLE "ReservationRoom" DROP COLUMN "pricePerNight",
ADD COLUMN     "adults" INTEGER NOT NULL,
ADD COLUMN     "roomTypeId" TEXT NOT NULL,
ADD COLUMN     "weekdayNights" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "weekdayPricePerNight" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "weekendNights" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "weekendPricePerNight" DECIMAL(10,2) NOT NULL,
ALTER COLUMN "roomId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "tvDeviceId" TEXT;

-- AlterTable
ALTER TABLE "RoomType" DROP COLUMN "basePrice",
ADD COLUMN     "weekdayBasePrice" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "weekendBasePrice" DECIMAL(10,2) NOT NULL;

-- DropTable
DROP TABLE "public"."Promotion";

-- DropTable
DROP TABLE "public"."User";

-- DropEnum
DROP TYPE "public"."UserRole";

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RatePeriod" (
    "id" TEXT NOT NULL,
    "roomTypeId" TEXT NOT NULL,
    "createdByAdminId" TEXT,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "weekdayPrice" DECIMAL(10,2) NOT NULL,
    "weekendPrice" DECIMAL(10,2) NOT NULL,
    "isPromotion" BOOLEAN NOT NULL DEFAULT false,
    "originalWeekdayPrice" DECIMAL(10,2),
    "originalWeekendPrice" DECIMAL(10,2),
    "titleRo" TEXT,
    "titleEn" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RatePeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReservationChange" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "status" "ReservationChangeStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "requestedCheckInDate" DATE NOT NULL,
    "requestedCheckOutDate" DATE NOT NULL,
    "oldCheckInDate" DATE NOT NULL,
    "oldCheckOutDate" DATE NOT NULL,
    "oldSubtotalPrice" DECIMAL(10,2) NOT NULL,
    "newSubtotalPrice" DECIMAL(10,2) NOT NULL,
    "priceDifference" DECIMAL(10,2) NOT NULL,
    "amountDue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "retainedAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "approvedByAdminId" TEXT,
    "rejectedByAdminId" TEXT,
    "guestReason" TEXT,
    "adminNotes" TEXT,
    "rejectionReason" TEXT,
    "approvalExpiresAt" TIMESTAMP(3),
    "paymentExpiresAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "appliedAt" TIMESTAMP(3),
    "expiredAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReservationChange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalCalendar" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "source" "ExternalCalendarSource" NOT NULL DEFAULT 'BOOKING_COM',
    "importUrl" TEXT NOT NULL,
    "exportToken" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncedAt" TIMESTAMP(3),
    "lastSyncError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalCalendar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalCalendarEvent" (
    "id" TEXT NOT NULL,
    "externalCalendarId" TEXT NOT NULL,
    "externalUid" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "summary" TEXT,
    "description" TEXT,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalCalendarEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE INDEX "RatePeriod_roomTypeId_startDate_endDate_idx" ON "RatePeriod"("roomTypeId", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "RatePeriod_isActive_idx" ON "RatePeriod"("isActive");

-- CreateIndex
CREATE INDEX "RatePeriod_createdByAdminId_idx" ON "RatePeriod"("createdByAdminId");

-- CreateIndex
CREATE INDEX "ReservationChange_reservationId_idx" ON "ReservationChange"("reservationId");

-- CreateIndex
CREATE INDEX "ReservationChange_status_idx" ON "ReservationChange"("status");

-- CreateIndex
CREATE INDEX "ReservationChange_approvalExpiresAt_idx" ON "ReservationChange"("approvalExpiresAt");

-- CreateIndex
CREATE INDEX "ReservationChange_paymentExpiresAt_idx" ON "ReservationChange"("paymentExpiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalCalendar_exportToken_key" ON "ExternalCalendar"("exportToken");

-- CreateIndex
CREATE INDEX "ExternalCalendar_isActive_idx" ON "ExternalCalendar"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalCalendar_roomId_source_key" ON "ExternalCalendar"("roomId", "source");

-- CreateIndex
CREATE INDEX "ExternalCalendarEvent_externalCalendarId_idx" ON "ExternalCalendarEvent"("externalCalendarId");

-- CreateIndex
CREATE INDEX "ExternalCalendarEvent_startDate_endDate_idx" ON "ExternalCalendarEvent"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalCalendarEvent_externalCalendarId_externalUid_key" ON "ExternalCalendarEvent"("externalCalendarId", "externalUid");

-- CreateIndex
CREATE INDEX "BlockedPeriod_createdByAdminId_idx" ON "BlockedPeriod"("createdByAdminId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripeCheckoutSessionId_key" ON "Payment"("stripeCheckoutSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripePaymentIntentId_key" ON "Payment"("stripePaymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_providerEventId_key" ON "Payment"("providerEventId");

-- CreateIndex
CREATE INDEX "Payment_reservationId_idx" ON "Payment"("reservationId");

-- CreateIndex
CREATE INDEX "Payment_reservationChangeId_idx" ON "Payment"("reservationChangeId");

-- CreateIndex
CREATE INDEX "Payment_type_idx" ON "Payment"("type");

-- CreateIndex
CREATE INDEX "Reservation_guestId_idx" ON "Reservation"("guestId");

-- CreateIndex
CREATE INDEX "Reservation_source_idx" ON "Reservation"("source");

-- CreateIndex
CREATE INDEX "Reservation_createdByAdminId_idx" ON "Reservation"("createdByAdminId");

-- CreateIndex
CREATE INDEX "Reservation_approvedByAdminId_idx" ON "Reservation"("approvedByAdminId");

-- CreateIndex
CREATE INDEX "Reservation_approvalExpiresAt_idx" ON "Reservation"("approvalExpiresAt");

-- CreateIndex
CREATE INDEX "Reservation_paymentExpiresAt_idx" ON "Reservation"("paymentExpiresAt");

-- CreateIndex
CREATE INDEX "ReservationRoom_reservationId_idx" ON "ReservationRoom"("reservationId");

-- CreateIndex
CREATE INDEX "ReservationRoom_roomTypeId_idx" ON "ReservationRoom"("roomTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "Room_tvDeviceId_key" ON "Room"("tvDeviceId");

-- CreateIndex
CREATE INDEX "Room_roomTypeId_idx" ON "Room"("roomTypeId");

-- CreateIndex
CREATE INDEX "Room_isActive_idx" ON "Room"("isActive");

-- CreateIndex
CREATE INDEX "RoomType_isActive_idx" ON "RoomType"("isActive");

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_approvedByAdminId_fkey" FOREIGN KEY ("approvedByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationRoom" ADD CONSTRAINT "ReservationRoom_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationRoom" ADD CONSTRAINT "ReservationRoom_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RatePeriod" ADD CONSTRAINT "RatePeriod_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RatePeriod" ADD CONSTRAINT "RatePeriod_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationChange" ADD CONSTRAINT "ReservationChange_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationChange" ADD CONSTRAINT "ReservationChange_approvedByAdminId_fkey" FOREIGN KEY ("approvedByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationChange" ADD CONSTRAINT "ReservationChange_rejectedByAdminId_fkey" FOREIGN KEY ("rejectedByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_reservationChangeId_fkey" FOREIGN KEY ("reservationChangeId") REFERENCES "ReservationChange"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockedPeriod" ADD CONSTRAINT "BlockedPeriod_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalCalendar" ADD CONSTRAINT "ExternalCalendar_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalCalendarEvent" ADD CONSTRAINT "ExternalCalendarEvent_externalCalendarId_fkey" FOREIGN KEY ("externalCalendarId") REFERENCES "ExternalCalendar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

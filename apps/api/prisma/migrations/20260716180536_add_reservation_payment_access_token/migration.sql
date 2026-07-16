/*
  Warnings:

  - A unique constraint covering the columns `[paymentAccessTokenHash]` on the table `Reservation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "paymentAccessTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "paymentAccessTokenHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_paymentAccessTokenHash_key" ON "Reservation"("paymentAccessTokenHash");

-- CreateIndex
CREATE INDEX "Reservation_paymentAccessTokenExpiresAt_idx" ON "Reservation"("paymentAccessTokenExpiresAt");

-- AlterTable
ALTER TABLE "ReservationRoom" ADD COLUMN     "extraAdultPricePerNight" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "extraAdultSubtotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "hasExtraAdult" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "allowsExtraAdult" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "RoomType" ADD COLUMN     "extraAdultPrice" DECIMAL(10,2);

-- CreateIndex
CREATE INDEX "ReservationRoom_reservationId_hasExtraAdult_idx" ON "ReservationRoom"("reservationId", "hasExtraAdult");

-- CreateIndex
CREATE INDEX "Room_roomTypeId_allowsExtraAdult_isActive_idx" ON "Room"("roomTypeId", "allowsExtraAdult", "isActive");

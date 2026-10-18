-- Additive TV tables only. Existing Room.tvDeviceId values are not credentials.
CREATE TABLE "TvDevice" (
  "id" TEXT NOT NULL,
  "roomId" TEXT,
  "tokenHash" TEXT NOT NULL,
  "lastSeenAt" TIMESTAMP(3),
  "revokedAt" TIMESTAMP(3),
  "hideGuestName" BOOLEAN NOT NULL DEFAULT false,
  "forceStandard" BOOLEAN NOT NULL DEFAULT false,
  "registeredByAdminId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TvDevice_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "TvDevice_roomId_key" ON "TvDevice"("roomId");
CREATE UNIQUE INDEX "TvDevice_tokenHash_key" ON "TvDevice"("tokenHash");
ALTER TABLE "TvDevice" ADD CONSTRAINT "TvDevice_roomId_fkey"
  FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE TABLE "TvPairing" (
  "id" TEXT NOT NULL,
  "codeHash" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "consumedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TvPairing_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "TvPairing_codeHash_key" ON "TvPairing"("codeHash");
CREATE UNIQUE INDEX "TvPairing_tokenHash_key" ON "TvPairing"("tokenHash");
CREATE INDEX "TvPairing_expiresAt_idx" ON "TvPairing"("expiresAt");

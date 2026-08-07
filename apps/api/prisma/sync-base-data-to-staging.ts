import { PrismaClient } from "@prisma/client";

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is missing from environment variables.`);
  }

  return value;
}

const localDatabaseUrl = getRequiredEnv("LOCAL_DATABASE_URL");
const stagingDatabaseUrl = getRequiredEnv("STAGING_DATABASE_URL");

if (localDatabaseUrl === stagingDatabaseUrl) {
  throw new Error(
    "LOCAL_DATABASE_URL and STAGING_DATABASE_URL must point to different databases.",
  );
}

const local = new PrismaClient({
  datasources: {
    db: {
      url: localDatabaseUrl,
    },
  },
});

const staging = new PrismaClient({
  datasources: {
    db: {
      url: stagingDatabaseUrl,
    },
  },
});

type AdminIdMap = Map<string, string>;

async function assertStagingIsSafeToReplace(): Promise<void> {
  const guests =
    await staging.guest.count();

  const reservations =
    await staging.reservation.count();

  const reservationRooms =
    await staging.reservationRoom.count();

  const reservationChanges =
    await staging.reservationChange.count();

  const payments =
    await staging.payment.count();

  const externalCalendars =
    await staging.externalCalendar.count();

  const externalCalendarEvents =
    await staging.externalCalendarEvent.count();

  const transactionalDataCount =
    guests +
    reservations +
    reservationRooms +
    reservationChanges +
    payments;

  if (transactionalDataCount > 0) {
    throw new Error(
      [
        "Staging contains transactional data.",
        `guests=${guests}`,
        `reservations=${reservations}`,
        `reservationRooms=${reservationRooms}`,
        `reservationChanges=${reservationChanges}`,
        `payments=${payments}`,
        "The sync was stopped to avoid deleting or corrupting staging reservations.",
      ].join(" "),
    );
  }

  if (
    externalCalendars > 0 ||
    externalCalendarEvents > 0
  ) {
    console.warn(
      [
        "Warning: staging contains external calendar configuration.",
        `externalCalendars=${externalCalendars}`,
        `externalCalendarEvents=${externalCalendarEvents}`,
        "This script does not copy or delete Booking.com calendar integrations.",
      ].join(" "),
    );
  }
}

async function buildAdminIdMap(): Promise<AdminIdMap> {
  const localAdmins = await local.admin.findMany({
    select: {
      id: true,
      email: true,
    },
  });

  const stagingAdmins = await staging.admin.findMany({
    select: {
      id: true,
      email: true,
    },
  });

  const stagingByEmail = new Map(
    stagingAdmins.map((admin) => [
      admin.email.trim().toLowerCase(),
      admin.id,
    ]),
  );

  const result: AdminIdMap = new Map();

  for (const admin of localAdmins) {
    const stagingAdminId = stagingByEmail.get(
      admin.email.trim().toLowerCase(),
    );

    if (stagingAdminId) {
      result.set(admin.id, stagingAdminId);
    }
  }

  return result;
}

async function syncBaseData(): Promise<void> {
  await assertStagingIsSafeToReplace();

  const [
    roomTypes,
    rooms,
    ratePeriods,
    blockedPeriods,
  ] = await Promise.all([
    local.roomType.findMany({
      orderBy: {
        createdAt: "asc",
      },
    }),
    local.room.findMany({
      orderBy: {
        createdAt: "asc",
      },
    }),
    local.ratePeriod.findMany({
      orderBy: [
        {
          startDate: "asc",
        },
        {
          createdAt: "asc",
        },
      ],
    }),
    local.blockedPeriod.findMany({
      orderBy: [
        {
          startDate: "asc",
        },
        {
          createdAt: "asc",
        },
      ],
    }),
  ]);

  if (roomTypes.length === 0) {
    throw new Error(
      "The local database contains no RoomType records. Nothing was copied.",
    );
  }

  if (rooms.length === 0) {
    throw new Error(
      "The local database contains no Room records. Nothing was copied.",
    );
  }

  const adminIdMap = await buildAdminIdMap();

  console.log("Local base data found:");
  console.log(`- Room types: ${roomTypes.length}`);
  console.log(`- Rooms: ${rooms.length}`);
  console.log(`- Rate periods: ${ratePeriods.length}`);
  console.log(`- Blocked periods: ${blockedPeriods.length}`);

  await staging.$transaction(async (tx) => {
    await tx.blockedPeriod.deleteMany();
    await tx.ratePeriod.deleteMany();
    await tx.room.deleteMany();
    await tx.roomType.deleteMany();

    for (const roomType of roomTypes) {
      await tx.roomType.create({
        data: {
          id: roomType.id,
          nameRo: roomType.nameRo,
          nameEn: roomType.nameEn,
          slug: roomType.slug,
          descriptionRo: roomType.descriptionRo,
          descriptionEn: roomType.descriptionEn,
          weekdayBasePrice: roomType.weekdayBasePrice,
          weekendBasePrice: roomType.weekendBasePrice,
          maxAdults: roomType.maxAdults,
          extraAdultPrice: roomType.extraAdultPrice,
          sizeSqm: roomType.sizeSqm,
          isActive: roomType.isActive,
          createdAt: roomType.createdAt,
          updatedAt: roomType.updatedAt,
        },
      });
    }

    for (const room of rooms) {
      await tx.room.create({
        data: {
          id: room.id,
          name: room.name,
          code: room.code,
          roomTypeId: room.roomTypeId,
          floor: room.floor,
          tvDeviceId: room.tvDeviceId,
          isActive: room.isActive,
          allowsExtraAdult: room.allowsExtraAdult,
          createdAt: room.createdAt,
          updatedAt: room.updatedAt,
        },
      });
    }

    for (const ratePeriod of ratePeriods) {
      await tx.ratePeriod.create({
        data: {
          id: ratePeriod.id,
          roomTypeId: ratePeriod.roomTypeId,
          createdByAdminId: ratePeriod.createdByAdminId
            ? adminIdMap.get(ratePeriod.createdByAdminId) ?? null
            : null,
          startDate: ratePeriod.startDate,
          endDate: ratePeriod.endDate,
          weekdayPrice: ratePeriod.weekdayPrice,
          weekendPrice: ratePeriod.weekendPrice,
          isPromotion: ratePeriod.isPromotion,
          originalWeekdayPrice: ratePeriod.originalWeekdayPrice,
          originalWeekendPrice: ratePeriod.originalWeekendPrice,
          titleRo: ratePeriod.titleRo,
          titleEn: ratePeriod.titleEn,
          isActive: ratePeriod.isActive,
          createdAt: ratePeriod.createdAt,
          updatedAt: ratePeriod.updatedAt,
        },
      });
    }

    for (const blockedPeriod of blockedPeriods) {
      await tx.blockedPeriod.create({
        data: {
          id: blockedPeriod.id,
          roomId: blockedPeriod.roomId,
          createdByAdminId: blockedPeriod.createdByAdminId
            ? adminIdMap.get(blockedPeriod.createdByAdminId) ?? null
            : null,
          startDate: blockedPeriod.startDate,
          endDate: blockedPeriod.endDate,
          reason: blockedPeriod.reason,
          createdAt: blockedPeriod.createdAt,
          updatedAt: blockedPeriod.updatedAt,
        },
      });
    }
  });

  const [
    stagingRoomTypes,
    stagingRooms,
    stagingRatePeriods,
    stagingBlockedPeriods,
  ] = await Promise.all([
    staging.roomType.count(),
    staging.room.count(),
    staging.ratePeriod.count(),
    staging.blockedPeriod.count(),
  ]);

  console.log("");
  console.log("Staging sync completed successfully.");
  console.log(`- Room types: ${stagingRoomTypes}`);
  console.log(`- Rooms: ${stagingRooms}`);
  console.log(`- Rate periods: ${stagingRatePeriods}`);
  console.log(`- Blocked periods: ${stagingBlockedPeriods}`);
}

syncBaseData()
  .catch((error: unknown) => {
    console.error("");
    console.error("Base-data sync failed.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await Promise.all([
      local.$disconnect(),
      staging.$disconnect(),
    ]);
  });
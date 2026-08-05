import {
  ApartmentShowcase,
} from "@/components/rooms/ApartmentShowcase";

import {
  RoomAmenities,
} from "@/components/rooms/RoomAmenities";

import {
  RoomCTA,
} from "@/components/rooms/RoomCTA";

import {
  RoomHero,
} from "@/components/rooms/RoomHero";

import {
  RoomIntro,
} from "@/components/rooms/RoomIntro";

import {
  publicRooms,
} from "@/data/rooms";

import {
  getPublicHref,
  isPublicLocale,
  type PublicLocale,
} from "@/lib/public-routes";

type RoomsPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function RoomsPage({
  params,
}: RoomsPageProps) {
  const {
    locale: localeParam,
  } = await params;

  const locale: PublicLocale =
    isPublicLocale(
      localeParam,
    )
      ? localeParam
      : "ro";

  const roomsBaseHref =
    getPublicHref(
      "rooms",
      locale,
    );

  return (
    <main>
      <RoomHero />

      <RoomIntro />

      {publicRooms.map(
        (
          room,
          index,
        ) => {
          const content =
            room.content[locale];

          const roomHref =
            `${roomsBaseHref}/${room.slug}`;

          return (
            <ApartmentShowcase
              key={room.slug}
              title={
                content.title
              }
              description={
                content.shortDescription
              }
              image={
                room.image
              }
              href={
                roomHref
              }
              details={
                content.details
              }
              reverse={
                index % 2 === 1
              }
            />
          );
        },
      )}

      <RoomAmenities />

      <RoomCTA />
    </main>
  );
}
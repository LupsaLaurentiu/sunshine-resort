import { ApartmentShowcase } from "@/components/rooms/ApartmentShowcase";
import { RoomAmenities } from "@/components/rooms/RoomAmenities";
import { RoomCTA } from "@/components/rooms/RoomCTA";
import { RoomHero } from "@/components/rooms/RoomHero";
import { RoomIntro } from "@/components/rooms/RoomIntro";
import { publicRooms } from "@/data/rooms";

type RoomsPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function RoomsPage({
  params,
}: RoomsPageProps) {
  const { locale } = await params;

  return (
    <main>
      <RoomHero />
      <RoomIntro />

      {publicRooms.map((room, index) => (
        <ApartmentShowcase
          key={room.slug}
          title={room.title}
          description={room.shortDescription}
          image={room.image}
          href={`/${locale}/rooms/${room.slug}`}
          details={room.details}
          reverse={index % 2 === 1}
        />
      ))}

      <RoomAmenities />
      <RoomCTA />
    </main>
  );
}
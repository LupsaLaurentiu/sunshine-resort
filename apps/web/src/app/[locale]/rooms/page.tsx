import { ApartmentShowcase } from "@/components/rooms/ApartmentShowcase";
import { RoomAmenities } from "@/components/rooms/RoomAmenities";
import { RoomCTA } from "@/components/rooms/RoomCTA";
import { RoomHero } from "@/components/rooms/RoomHero";
import { RoomIntro } from "@/components/rooms/RoomIntro";
import { rooms } from "@/data/rooms";

export default function RoomsPage() {
  return (
    <main>
      <RoomHero />
      <RoomIntro />

      {rooms.map((room, index) => (
        <ApartmentShowcase
          key={room.slug}
          title={room.title}
          description={room.shortDescription}
          image={room.image}
          href={`/ro/rooms/${room.slug}`}
          details={room.details}
          reverse={index % 2 === 1}
        />
      ))}

      <RoomAmenities />
      <RoomCTA />
    </main>
  );
}
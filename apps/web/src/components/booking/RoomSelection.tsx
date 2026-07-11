"use client";

import Image from "next/image";

export type BookingRoom = {
  slug: string;
  title: string;
  description: string;
  image: string;
  availableUnits: number;
  pricePerNight: number;
};

type RoomSelectionProps = {
  rooms: BookingRoom[];
  selectedRooms: Record<string, number>;
  onQuantityChange: (slug: string, quantity: number) => void;
};

export function RoomSelection({
  rooms,
  selectedRooms,
  onQuantityChange,
}: RoomSelectionProps) {
  return (
    <section>
      <div className="mb-12">
        <p className="mb-4 text-xs uppercase tracking-[0.45em] text-gold">
          Available Apartments
        </p>

        <h2 className="heading text-5xl font-light md:text-7xl">
          Choose your stay.
        </h2>
      </div>

      <div className="space-y-8">
        {rooms.map((room) => (
          <article
            key={room.slug}
            className="grid overflow-hidden border border-white/10 bg-[#0b0b0b] lg:grid-cols-[.9fr_1.1fr]"
          >
            <div className="relative min-h-[320px]">
              <Image
                src={room.image}
                alt={room.title}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex flex-col justify-between p-8 md:p-10">
              <div>
                <div className="flex flex-col justify-between gap-5 sm:flex-row">
                  <div>
                    <h3 className="heading text-4xl font-light">
                      {room.title}
                    </h3>

                    <p className="mt-5 max-w-xl text-sm leading-7 text-white/55">
                      {room.description}
                    </p>
                  </div>

                  <div className="shrink-0 sm:text-right">
                    <p className="text-xs uppercase tracking-[0.25em] text-white/40">
                      From
                    </p>

                    <p className="heading mt-2 text-3xl">
                      {room.pricePerNight} RON
                    </p>

                    <p className="text-xs text-white/40">per night</p>
                  </div>
                </div>

                <div className="mt-8 border-y border-white/10 py-5 text-xs uppercase tracking-[0.22em] text-white/50">
                  {room.availableUnits} apartments available
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between gap-6">
                <span className="text-xs uppercase tracking-[0.25em] text-gold">
                  Number of apartments
                </span>

                <select
                  value={selectedRooms[room.slug] ?? 0}
                  onChange={(event) =>
                    onQuantityChange(room.slug, Number(event.target.value))
                  }
                  className="min-w-24 border border-white/20 bg-[#050505] px-4 py-3 text-white outline-none focus:border-gold"
                >
                  {Array.from(
                    { length: room.availableUnits + 1 },
                    (_, index) => index,
                  ).map((quantity) => (
                    <option key={quantity} value={quantity}>
                      {quantity}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
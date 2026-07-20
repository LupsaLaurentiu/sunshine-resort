"use client";

import Image from "next/image";

import type { NightlyRate } from "@/types/availability";

export type BookingRoom = {
  roomTypeId: string;
  slug: string;
  title: string;
  description: string;
  image: string;

  maxAdults: number;
  sizeSqm: number | null;

  totalUnits: number;
  availableUnits: number;

  totalPrice: number;
  averagePricePerNight: number;

  hasPromotion: boolean;
  nightlyRates: NightlyRate[];
};

type RoomSelectionProps = {
  rooms: BookingRoom[];
  selectedRooms: Record<string, number>;
  onQuantityChange: (slug: string, quantity: number) => void;
};

function formatPrice(value: number): string {
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: "RON",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function RoomSelection({
  rooms,
  selectedRooms,
  onQuantityChange,
}: RoomSelectionProps) {
  return (
    <section>
      <div className="mb-12">
        <p className="mb-4 text-xs uppercase tracking-[0.45em] text-gold">
          Apartamente disponibile
        </p>

        <h2 className="heading text-5xl font-light md:text-7xl">
          Alege apartamentul.
        </h2>
      </div>

      <div className="space-y-8">
        {rooms.map((room) => {
          const selectedQuantity = selectedRooms[room.slug] ?? 0;

          return (
            <article
              key={room.roomTypeId}
              className="grid overflow-hidden border border-white/10 bg-[#0b0b0b] lg:grid-cols-[0.9fr_1.1fr]"
            >
              <div className="relative min-h-[320px]">
                <Image
                  src={room.image}
                  alt={room.title}
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                />

                {room.hasPromotion && (
                  <div className="absolute left-5 top-5 bg-gold px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-black">
                    Promoție
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-between p-8 md:p-10">
                <div>
                  <div className="flex flex-col justify-between gap-6 sm:flex-row">
                    <div className="max-w-xl">
                      <h3 className="heading text-4xl font-light">
                        {room.title}
                      </h3>

                      <p className="mt-5 text-sm leading-7 text-white/55">
                        {room.description}
                      </p>

                      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-[10px] uppercase tracking-[0.22em] text-white/40">
                        <span>Maximum {room.maxAdults} adulți</span>

                        {room.sizeSqm !== null && (
                          <span>{room.sizeSqm} m²</span>
                        )}

                        <span>
                          {room.availableUnits} din {room.totalUnits} disponibile
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 sm:text-right">
                      <p className="text-xs uppercase tracking-[0.25em] text-white/40">
                        Total sejur
                      </p>

                      <p className="heading mt-2 text-3xl">
                        {formatPrice(room.totalPrice)}
                      </p>

                      <p className="mt-1 text-xs text-white/40">
                        aproximativ{" "}
                        {formatPrice(room.averagePricePerNight)} / noapte
                      </p>
                    </div>
                  </div>

                  {room.nightlyRates.length > 0 && (
                    <div className="mt-8 border-y border-white/10 py-6">
                      <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-gold">
                        Tarife pe nopți
                      </p>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {room.nightlyRates.map((night) => (
                          <div
                            key={night.date}
                            className="flex items-center justify-between gap-5 text-xs text-white/50"
                          >
                            <div>
                              <span>{night.date}</span>

                              <span className="ml-3 text-[9px] uppercase tracking-[0.2em] text-white/30">
                                {night.rateType === "WEEKEND"
                                  ? "Weekend"
                                  : "Weekday"}
                              </span>
                            </div>

                            <div className="text-right">
                              {night.originalPrice !== null &&
                                night.originalPrice > night.price && (
                                  <span className="mr-3 text-white/30 line-through">
                                    {formatPrice(night.originalPrice)}
                                  </span>
                                )}

                              <span
                                className={
                                  night.isPromotion
                                    ? "text-gold"
                                    : "text-white/70"
                                }
                              >
                                {formatPrice(night.price)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                  <div>
                    <span className="block text-xs uppercase tracking-[0.25em] text-gold">
                      Număr de apartamente
                    </span>

                    <p className="mt-2 text-xs leading-6 text-white/35">
                      Totalul se multiplică în funcție de cantitatea selectată.
                    </p>
                  </div>

                  <select
                    aria-label={`Număr de apartamente pentru ${room.title}`}
                    value={selectedQuantity}
                    onChange={(event) =>
                      onQuantityChange(
                        room.slug,
                        Number(event.target.value),
                      )
                    }
                    className="min-w-24 border border-white/20 bg-[#050505] px-4 py-3 text-white outline-none transition focus:border-gold"
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
          );
        })}
      </div>
    </section>
  );
}
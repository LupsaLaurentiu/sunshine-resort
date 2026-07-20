import { BedDouble, Building2, Users } from "lucide-react";

import type { ReservationRoomDetails } from "@/types/admin-reservation-details";

import { formatAdminPrice } from "./reservation-formatters";

type ReservationRoomsCardProps = {
  rooms: ReservationRoomDetails[];
};

export function ReservationRoomsCard({
  rooms,
}: ReservationRoomsCardProps) {
  return (
    <section className="border border-white/10 bg-[#0b0b0b]">
      <div className="border-b border-white/10 px-7 py-6">
        <p className="text-[10px] uppercase tracking-[0.32em] text-gold">
          Inventar
        </p>

        <h2 className="heading mt-3 text-3xl font-light">
          Apartamente rezervate
        </h2>
      </div>

      <div className="divide-y divide-white/10">
        {rooms.map((reservationRoom, index) => (
          <article
            key={reservationRoom.id}
            className="grid gap-7 px-7 py-7 lg:grid-cols-[1fr_auto]"
          >
            <div>
              <div className="flex flex-wrap items-center gap-4">
                <h3 className="heading text-2xl font-light">
                  {reservationRoom.roomType.nameRo}
                </h3>

                <span className="text-[9px] uppercase tracking-[0.25em] text-white/25">
                  Unitatea {index + 1}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap gap-x-8 gap-y-4 text-xs text-white/40">
                <span className="inline-flex items-center gap-2">
                  <Users className="h-4 w-4 text-gold" />
                  {reservationRoom.adults} adulți
                </span>

                <span className="inline-flex items-center gap-2">
                  <BedDouble className="h-4 w-4 text-gold" />
                  {reservationRoom.nights} nopți
                </span>

                <span className="inline-flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gold" />

                  {reservationRoom.room
                    ? `${reservationRoom.room.name} · ${reservationRoom.room.code}`
                    : "Camera fizică nu este încă alocată"}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3 text-xs text-white/30">
                <span>
                  Weekday: {reservationRoom.weekdayNights} nopți ×{" "}
                  {formatAdminPrice(
                    reservationRoom.weekdayPricePerNight,
                  )}
                </span>

                <span>
                  Weekend: {reservationRoom.weekendNights} nopți ×{" "}
                  {formatAdminPrice(
                    reservationRoom.weekendPricePerNight,
                  )}
                </span>
              </div>
            </div>

            <div className="lg:text-right">
              <p className="text-[9px] uppercase tracking-[0.25em] text-white/30">
                Subtotal
              </p>

              <p className="heading mt-2 text-3xl">
                {formatAdminPrice(reservationRoom.subtotal)}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
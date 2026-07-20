import { CalendarDays, Clock3, Moon, Users } from "lucide-react";

import type { AdminReservationDetails } from "@/types/admin-reservation-details";

import { formatAdminDate } from "./reservation-formatters";

type ReservationStayCardProps = {
  reservation: AdminReservationDetails;
};

export function ReservationStayCard({
  reservation,
}: ReservationStayCardProps) {
  return (
    <section className="border border-white/10 bg-[#0b0b0b] p-7">
      <p className="text-[10px] uppercase tracking-[0.32em] text-gold">
        Sejur
      </p>

      <h2 className="heading mt-3 text-3xl font-light">
        Perioada rezervării
      </h2>

      <div className="mt-7 grid gap-6 sm:grid-cols-2">
        <div className="flex items-start gap-4">
          <CalendarDays className="mt-0.5 h-4 w-4 text-gold" />

          <div>
            <p className="text-xs text-white/35">Check-in</p>
            <p className="mt-1 text-sm text-white/80">
              {formatAdminDate(reservation.checkInDate)}
            </p>
            <p className="mt-1 text-xs text-white/35">
              Ora {reservation.checkInTime}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <CalendarDays className="mt-0.5 h-4 w-4 text-gold" />

          <div>
            <p className="text-xs text-white/35">Check-out</p>
            <p className="mt-1 text-sm text-white/80">
              {formatAdminDate(reservation.checkOutDate)}
            </p>
            <p className="mt-1 text-xs text-white/35">
              Ora {reservation.checkOutTime}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <Moon className="mt-0.5 h-4 w-4 text-gold" />

          <div>
            <p className="text-xs text-white/35">Durată</p>
            <p className="mt-1 text-sm text-white/80">
              {reservation.nights}{" "}
              {reservation.nights === 1 ? "noapte" : "nopți"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <Users className="mt-0.5 h-4 w-4 text-gold" />

          <div>
            <p className="text-xs text-white/35">Oaspeți</p>
            <p className="mt-1 text-sm text-white/80">
              {reservation.adults} adulți
            </p>
          </div>
        </div>
      </div>

      <div className="mt-7 flex items-center gap-3 border-t border-white/10 pt-6">
        <Clock3 className="h-4 w-4 text-white/30" />

        <p className="text-xs leading-6 text-white/35">
          Limba comunicării:{" "}
          <span className="text-white/60">
            {reservation.locale === "RO" ? "Română" : "Engleză"}
          </span>
        </p>
      </div>
    </section>
  );
}
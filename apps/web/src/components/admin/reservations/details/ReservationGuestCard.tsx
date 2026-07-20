import { Mail, MapPin, Phone, UserRound } from "lucide-react";

import type { ReservationGuestDetails } from "@/types/admin-reservation-details";

type ReservationGuestCardProps = {
  guest: ReservationGuestDetails;
};

export function ReservationGuestCard({
  guest,
}: ReservationGuestCardProps) {
  const fullName =
    `${guest.firstName} ${guest.lastName}`.trim();

  return (
    <section className="border border-white/10 bg-[#0b0b0b] p-7">
      <p className="text-[10px] uppercase tracking-[0.32em] text-gold">
        Client
      </p>

      <h2 className="heading mt-3 text-3xl font-light">
        Date de contact
      </h2>

      <div className="mt-7 space-y-5">
        <div className="flex items-start gap-4">
          <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-gold" />

          <div>
            <p className="text-xs text-white/35">Nume complet</p>
            <p className="mt-1 text-sm text-white/80">{fullName}</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" />

          <div className="min-w-0">
            <p className="text-xs text-white/35">Email</p>

            <a
              href={`mailto:${guest.email}`}
              className="mt-1 block break-all text-sm text-white/80 transition hover:text-gold"
            >
              {guest.email}
            </a>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" />

          <div>
            <p className="text-xs text-white/35">Telefon</p>

            <a
              href={`tel:${guest.phone}`}
              className="mt-1 block text-sm text-white/80 transition hover:text-gold"
            >
              {guest.phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
import Link from "next/link";
import {
  Clock3,
  CreditCard,
  FileClock,
} from "lucide-react";

import type {
  CalendarUnassignedReservation,
} from "@/types/admin-calendar";

type TemporaryHoldsProps = {
  reservations: CalendarUnassignedReservation[];
};

function formatDate(value: string): string {
  const [year, month, day] = value
    .split("-")
    .map(Number);

  const date = new Date(
    Date.UTC(
      year,
      month - 1,
      day,
    ),
  );

  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function getStatusContent(
  status: CalendarUnassignedReservation["status"],
): {
  label: string;
  description: string;
  icon: typeof Clock3;
  badgeClassName: string;
} {
  switch (status) {
    case "PENDING_APPROVAL":
      return {
        label: "Așteaptă aprobarea",
        description:
          "Cererea blochează temporar disponibilitatea până la decizia administratorului.",
        icon: FileClock,
        badgeClassName:
          "border-sky-300/25 bg-sky-300/10 text-sky-200",
      };

    case "APPROVED_AWAITING_PAYMENT":
      return {
        label: "Așteaptă plata",
        description:
          "Disponibilitatea rămâne blocată până la efectuarea sau expirarea plății.",
        icon: CreditCard,
        badgeClassName:
          "border-amber-300/25 bg-amber-300/10 text-amber-200",
      };

    default:
      return {
        label: status,
        description:
          "Rezervarea blochează temporar disponibilitatea acestui tip de apartament.",
        icon: Clock3,
        badgeClassName:
          "border-white/15 bg-white/[0.04] text-white/60",
      };
  }
}

export function TemporaryHolds({
  reservations,
}: TemporaryHoldsProps) {
  if (reservations.length === 0) {
    return null;
  }

  return (
    <section className="border border-amber-300/15 bg-[#0b0b0b]">
      <div className="flex flex-col justify-between gap-6 border-b border-white/10 px-6 py-6 md:flex-row md:items-center md:px-8">
        <div>
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-[10px] uppercase tracking-[0.35em] text-gold">
              Disponibilitate temporar blocată
            </p>

            <span className="flex h-7 min-w-7 items-center justify-center border border-amber-300/20 bg-amber-300/10 px-2 text-xs text-amber-200">
              {reservations.length}
            </span>
          </div>

          <h2 className="heading mt-3 text-3xl font-light md:text-4xl">
            Hold-uri active
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/40">
            Aceste rezervări nu au încă un apartament fizic
            alocat, dar blochează disponibilitatea tipului de
            apartament pentru perioadele indicate.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-white/35">
          <Clock3 className="h-4 w-4 text-gold" />

          <span>
            Se eliberează automat dacă rezervarea expiră
          </span>
        </div>
      </div>

      <div className="grid gap-px bg-white/10 lg:grid-cols-2">
        {reservations.map((reservation) => {
          const statusContent =
            getStatusContent(
              reservation.status,
            );

          const StatusIcon =
            statusContent.icon;

          return (
            <article
              key={
                reservation.reservationRoomId
              }
              className="bg-[#0b0b0b] px-6 py-6 md:px-8"
            >
              <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="heading text-2xl font-light">
                      {reservation.roomTypeName}
                    </h3>

                    <span
                      className={`inline-flex items-center gap-2 border px-3 py-1 text-[9px] uppercase tracking-[0.2em] ${statusContent.badgeClassName}`}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />

                      {statusContent.label}
                    </span>
                  </div>

                  <p className="mt-4 text-sm text-white/75">
                    {reservation.guestName}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/35">
                    <span>
                      {formatDate(
                        reservation.start,
                      )}{" "}
                      –{" "}
                      {formatDate(
                        reservation.end,
                      )}
                    </span>

                    <span>
                      {reservation.adults}{" "}
                      {reservation.adults === 1
                        ? "adult"
                        : "adulți"}
                    </span>
                  </div>

                  <p className="mt-4 max-w-xl text-xs leading-6 text-white/30">
                    {statusContent.description}
                  </p>
                </div>

                <Link
                  href={`/admin/reservation/${reservation.reservationId}`}
                  className="shrink-0 border border-white/10 px-5 py-3 text-[9px] uppercase tracking-[0.24em] text-white/45 transition hover:border-gold hover:text-gold"
                >
                  Deschide rezervarea
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
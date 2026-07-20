"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { StatusBadge } from "@/components/admin/shared/StatusBadge";

import type {
  AdminReservationListItem,
} from "@/types/admin-reservation";

type ReservationsTableProps = {
  reservations: AdminReservationListItem[];
};

function formatPrice(value: number): string {
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: "RON",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string): string {
  if (!value) {
    return "—";
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getSourceLabel(
  source: AdminReservationListItem["source"],
): string {
  switch (source) {
    case "DIRECT_WEBSITE":
      return "Website";

    case "MANUAL_ADMIN":
      return "Manual";

    case "BOOKING_COM":
      return "Booking.com";

    default:
      return source;
  }
}

export function ReservationsTable({
  reservations,
}: ReservationsTableProps) {
  return (
    <div className="overflow-hidden border border-white/10 bg-[#0b0b0b]">
      <div className="overflow-x-auto">
        <table className="min-w-[1180px] w-full border-collapse">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-6 py-5 text-left text-[9px] font-medium uppercase tracking-[0.28em] text-white/35">
                Client
              </th>

              <th className="px-6 py-5 text-left text-[9px] font-medium uppercase tracking-[0.28em] text-white/35">
                Perioadă
              </th>

              <th className="px-6 py-5 text-left text-[9px] font-medium uppercase tracking-[0.28em] text-white/35">
                Apartamente
              </th>

              <th className="px-6 py-5 text-left text-[9px] font-medium uppercase tracking-[0.28em] text-white/35">
                Status
              </th>

              <th className="px-6 py-5 text-left text-[9px] font-medium uppercase tracking-[0.28em] text-white/35">
                Sursă
              </th>

              <th className="px-6 py-5 text-right text-[9px] font-medium uppercase tracking-[0.28em] text-white/35">
                Total
              </th>

              <th className="px-6 py-5 text-right text-[9px] font-medium uppercase tracking-[0.28em] text-white/35">
                Achitat
              </th>

              <th className="px-6 py-5 text-right text-[9px] font-medium uppercase tracking-[0.28em] text-white/35">
                Acțiuni
              </th>
            </tr>
          </thead>

          <tbody>
            {reservations.map((reservation) => {
              const guestName =
                `${reservation.guest.firstName} ${reservation.guest.lastName}`.trim();

              return (
                <tr
                  key={reservation.id}
                  className="border-b border-white/5 transition last:border-b-0 hover:bg-white/[0.025]"
                >
                  <td className="px-6 py-6 align-top">
                    <p className="text-sm text-white/85">
                      {guestName}
                    </p>

                    <p className="mt-1 text-xs text-white/35">
                      {reservation.guest.email}
                    </p>

                    <p className="mt-1 text-xs text-white/25">
                      {reservation.guest.phone}
                    </p>
                  </td>

                  <td className="px-6 py-6 align-top">
                    <p className="text-sm text-white/75">
                      {formatDate(reservation.checkIn)}
                    </p>

                    <p className="mt-1 text-xs text-white/35">
                      până la {formatDate(reservation.checkOut)}
                    </p>

                    <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-white/25">
                      {reservation.nights}{" "}
                      {reservation.nights === 1
                        ? "noapte"
                        : "nopți"}
                    </p>
                  </td>

                  <td className="px-6 py-6 align-top">
                    <div className="space-y-2">
                      {reservation.roomTypes.map((roomType) => (
                        <div
                          key={roomType.id}
                          className="flex items-center justify-between gap-5"
                        >
                          <span className="text-sm text-white/65">
                            {roomType.nameRo}
                          </span>

                          <span className="text-xs text-gold">
                            × {roomType.quantity}
                          </span>
                        </div>
                      ))}
                    </div>

                    <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-white/25">
                      {reservation.adults} adulți
                    </p>
                  </td>

                  <td className="px-6 py-6 align-top">
                    <StatusBadge status={reservation.status} />
                  </td>

                  <td className="px-6 py-6 align-top">
                    <span className="text-xs uppercase tracking-[0.2em] text-white/45">
                      {getSourceLabel(reservation.source)}
                    </span>
                  </td>

                  <td className="px-6 py-6 text-right align-top">
                    <p className="text-sm text-white/80">
                      {formatPrice(reservation.totalPrice)}
                    </p>
                  </td>

                  <td className="px-6 py-6 text-right align-top">
                    <p className="text-sm text-white/60">
                      {formatPrice(reservation.paidAmount)}
                    </p>
                  </td>

                  <td className="px-6 py-6 text-right align-top">
                    <Link
                      href={`/admin/reservation/${reservation.id}`}
                      className="inline-flex h-10 w-10 items-center justify-center border border-white/10 text-white/50 transition hover:border-gold hover:text-gold"
                      aria-label={`Vezi rezervarea ${reservation.id}`}
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
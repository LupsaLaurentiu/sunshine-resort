import Link from "next/link";
import {
  CalendarDays,
  Clock3,
  Mail,
  Phone,
  Users,
} from "lucide-react";

import type {
  DashboardPaymentItem,
  DashboardReservationItem,
} from "@/types/admin-dashboard";

type DashboardReservationListProps = {
  eyebrow: string;
  title: string;
  description: string;

  reservations: Array<
    DashboardReservationItem | DashboardPaymentItem
  >;

  emptyTitle: string;
  emptyDescription: string;

  variant?:
    | "default"
    | "warning"
    | "success"
    | "danger";

  showPaymentDeadline?: boolean;
};

const VARIANT_CLASSES = {
  default: {
    border: "border-white/10",
    eyebrow: "text-gold",
    badge:
      "border-white/10 bg-white/[0.03] text-white/55",
  },

  warning: {
    border: "border-amber-300/20",
    eyebrow: "text-amber-200",
    badge:
      "border-amber-300/20 bg-amber-300/10 text-amber-200",
  },

  success: {
    border: "border-emerald-300/20",
    eyebrow: "text-emerald-200",
    badge:
      "border-emerald-300/20 bg-emerald-300/10 text-emerald-200",
  },

  danger: {
    border: "border-red-300/20",
    eyebrow: "text-red-200",
    badge:
      "border-red-300/20 bg-red-300/10 text-red-200",
  },
} as const;

function formatDate(
  value: string,
): string {
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

  return new Intl.DateTimeFormat(
    "ro-RO",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    },
  ).format(date);
}

function formatPrice(
  value: number,
  currency = "RON",
): string {
  return new Intl.NumberFormat(
    "ro-RO",
    {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    },
  ).format(value);
}

function formatExpiration(
  value: string | null,
): string {
  if (!value) {
    return "Fără termen";
  }

  return new Intl.DateTimeFormat(
    "ro-RO",
    {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(new Date(value));
}

function isPaymentItem(
  reservation:
    | DashboardReservationItem
    | DashboardPaymentItem,
): reservation is DashboardPaymentItem {
  return (
    "isPaymentExpiringSoon" in
    reservation
  );
}

export function DashboardReservationList({
  eyebrow,
  title,
  description,
  reservations,
  emptyTitle,
  emptyDescription,
  variant = "default",
  showPaymentDeadline = false,
}: DashboardReservationListProps) {
  const styles =
    VARIANT_CLASSES[variant];

  return (
    <section
      className={`border bg-[#0b0b0b] ${styles.border}`}
    >
      <div className="flex flex-col justify-between gap-5 border-b border-white/10 px-6 py-6 md:flex-row md:items-center md:px-7">
        <div>
          <p
            className={`text-[10px] uppercase tracking-[0.32em] ${styles.eyebrow}`}
          >
            {eyebrow}
          </p>

          <h2 className="heading mt-2 text-3xl font-light">
            {title}
          </h2>

          <p className="mt-3 max-w-xl text-xs leading-6 text-white/35">
            {description}
          </p>
        </div>

        <span
          className={`inline-flex h-9 min-w-9 items-center justify-center border px-3 text-sm ${styles.badge}`}
        >
          {reservations.length}
        </span>
      </div>

      {reservations.length === 0 ? (
        <div className="px-7 py-14 text-center">
          <p className="heading text-2xl font-light text-white/55">
            {emptyTitle}
          </p>

          <p className="mx-auto mt-3 max-w-md text-xs leading-6 text-white/30">
            {emptyDescription}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-white/10">
          {reservations.map(
            (reservation) => {
              const roomLabel =
                reservation
                  .allocatedRooms
                  .length > 0
                  ? reservation
                      .allocatedRooms
                      .map(
                        (room) =>
                          room.name,
                      )
                      .join(", ")
                  : reservation
                      .roomNames
                      .join(", ");

              const paymentItem =
                isPaymentItem(
                  reservation,
                )
                  ? reservation
                  : null;

              return (
                <article
                  key={reservation.id}
                  className="px-6 py-6 md:px-7"
                >
                  <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-start">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="truncate text-sm font-medium text-white/85">
                          {
                            reservation.guestName
                          }
                        </h3>

                        {paymentItem
                          ?.isPaymentExpiringSoon && (
                          <span className="border border-red-300/20 bg-red-300/10 px-2.5 py-1 text-[9px] uppercase tracking-[0.2em] text-red-200">
                            Expiră curând
                          </span>
                        )}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3 text-xs text-white/35">
                        <span className="inline-flex items-center gap-2">
                          <CalendarDays className="h-3.5 w-3.5 text-gold" />

                          {formatDate(
                            reservation.checkIn,
                          )}{" "}
                          –{" "}
                          {formatDate(
                            reservation.checkOut,
                          )}
                        </span>

                        <span className="inline-flex items-center gap-2">
                          <Users className="h-3.5 w-3.5 text-gold" />

                          {
                            reservation.adults
                          }{" "}
                          adulți
                        </span>

                        <span>
                          {
                            reservation.nights
                          }{" "}
                          {reservation.nights ===
                          1
                            ? "noapte"
                            : "nopți"}
                        </span>
                      </div>

                      <p className="mt-4 text-xs text-white/45">
                        {roomLabel ||
                          "Cameră nealocată"}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3 text-xs text-white/30">
                        <span className="inline-flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5" />

                          {
                            reservation.guestEmail
                          }
                        </span>

                        <span className="inline-flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5" />

                          {
                            reservation.guestPhone
                          }
                        </span>
                      </div>

                      {showPaymentDeadline && (
                        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
                          <span className="inline-flex items-center gap-2 text-amber-200/80">
                            <Clock3 className="h-3.5 w-3.5" />

                            Termen:{" "}
                            {formatExpiration(
                              reservation.paymentExpiresAt,
                            )}
                          </span>

                          <span className="text-white/35">
                            Rămas de achitat:{" "}
                            <strong className="font-medium text-white/70">
                              {formatPrice(
                                reservation.remainingAmount,
                              )}
                            </strong>
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-col items-start gap-4 xl:items-end">
                      <div className="text-left xl:text-right">
                        <p className="text-[9px] uppercase tracking-[0.22em] text-white/25">
                          Total
                        </p>

                        <p className="mt-2 text-sm text-gold">
                          {formatPrice(
                            reservation.totalPrice,
                          )}
                        </p>
                      </div>

                      <Link
                        href={`/admin/reservation/${reservation.id}`}
                        className="border border-white/10 px-5 py-3 text-[9px] uppercase tracking-[0.22em] text-white/45 transition hover:border-gold hover:text-gold"
                      >
                        Deschide
                      </Link>
                    </div>
                  </div>
                </article>
              );
            },
          )}
        </div>
      )}
    </section>
  );
}
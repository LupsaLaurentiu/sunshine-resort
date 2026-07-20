"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { useParams } from "next/navigation";

import type { CreateReservationResponse } from "@/types/reservation";

type BookingSuccessProps = {
  reservation: CreateReservationResponse;
};

function formatPrice(value: number, locale: "ro" | "en"): string {
  return new Intl.NumberFormat(
    locale === "ro" ? "ro-RO" : "en-GB",
    {
      style: "currency",
      currency: "RON",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    },
  ).format(value);
}

function formatDate(value: string, locale: "ro" | "en"): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  return new Intl.DateTimeFormat(
    locale === "ro" ? "ro-RO" : "en-GB",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}

export function BookingSuccess({
  reservation,
}: BookingSuccessProps) {
  const params = useParams<{ locale?: string }>();
  const locale = params.locale === "en" ? "en" : "ro";

  return (
    <section className="flex min-h-screen items-center bg-[#050505] px-6 py-32 text-center text-[#f5f2eb] md:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-gold text-gold">
          <Check className="h-9 w-9 stroke-[1.2]" />
        </div>

        <p className="mt-10 text-xs uppercase tracking-[0.45em] text-gold">
          {locale === "en"
            ? "Request received"
            : "Cerere înregistrată"}
        </p>

        <h1 className="heading mt-6 text-6xl font-light leading-tight md:text-8xl">
          {locale === "en"
            ? "Your escape begins here."
            : "Escapada ta începe aici."}
        </h1>

        <p className="mx-auto mt-10 max-w-2xl text-sm leading-8 text-white/55">
          {locale === "en"
            ? "Your reservation request is pending approval. After review, you will receive an email with the confirmation and secure payment link."
            : "Cererea ta de rezervare este în așteptarea aprobării. După verificare, vei primi pe email confirmarea și linkul securizat pentru plată."}
        </p>

        <div className="mx-auto mt-14 max-w-2xl border border-white/10 bg-[#0b0b0b] p-8 text-left md:p-10">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/35">
                {locale === "en"
                  ? "Reservation ID"
                  : "ID rezervare"}
              </p>

              <p className="mt-2 break-all text-sm text-white/80">
                {reservation.id}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/35">
                {locale === "en" ? "Status" : "Status"}
              </p>

              <p className="mt-2 text-sm uppercase tracking-[0.15em] text-gold">
                {reservation.status.replaceAll("_", " ")}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/35">
                {locale === "en" ? "Total" : "Total"}
              </p>

              <p className="heading mt-2 text-3xl">
                {formatPrice(reservation.totalPrice, locale)}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/35">
                {locale === "en"
                  ? "Minimum deposit"
                  : "Avans minim"}
              </p>

              <p className="heading mt-2 text-3xl">
                {formatPrice(reservation.depositAmount, locale)}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/35">
                {locale === "en"
                  ? "Number of nights"
                  : "Număr de nopți"}
              </p>

              <p className="mt-2 text-sm text-white/80">
                {reservation.nights}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/35">
                {locale === "en"
                  ? "Approval deadline"
                  : "Termen aprobare"}
              </p>

              <p className="mt-2 text-sm text-white/80">
                {formatDate(reservation.approvalExpiresAt, locale)}
              </p>
            </div>
          </div>
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-xs leading-6 text-white/35">
          {reservation.message}
        </p>

        <Link
          href={`/${locale}`}
          className="mt-14 inline-block border border-gold px-12 py-5 text-xs uppercase tracking-[0.3em] text-gold transition hover:bg-gold hover:text-black"
        >
          {locale === "en"
            ? "Return Home"
            : "Înapoi la pagina principală"}
        </Link>
      </div>
    </section>
  );
}
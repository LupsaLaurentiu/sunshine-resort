"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CreditCard,
  Info,
  X,
} from "lucide-react";

export default function PaymentCancelledPage() {
  const params = useParams<{
    locale?: string;
  }>();

  const searchParams = useSearchParams();

  const locale =
    params.locale === "en" ? "en" : "ro";

  const reservationId =
    searchParams.get("reservationId");

  const reservationChangeId =
    searchParams.get("reservationChangeId");

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050505] px-6 py-20 text-[#f5f2eb]">
      <section className="w-full max-w-3xl text-center">
        <Link
          href={`/${locale}`}
          className="inline-block"
        >
          <Image
            src="/logo-sunshine.png"
            alt="Sunshine Resort"
            width={145}
            height={87}
            priority
            className="mx-auto h-auto w-[130px] md:w-[145px]"
          />
        </Link>

        <div className="mx-auto mt-14 flex h-20 w-20 items-center justify-center rounded-full border border-white/15 bg-white/[0.03] text-white/60">
          <X className="h-9 w-9 stroke-[1.3]" />
        </div>

        <p className="mt-10 text-[10px] uppercase tracking-[0.42em] text-gold">
          {locale === "en"
            ? "Payment cancelled"
            : "Plată anulată"}
        </p>

        <h1 className="heading mt-6 text-5xl font-light leading-tight md:text-7xl">
          {locale === "en"
            ? "No payment was processed."
            : "Plata nu a fost procesată."}
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-sm leading-8 text-white/50">
          {locale === "en"
            ? "You left the Stripe payment page before completing the transaction. Your reservation is still awaiting payment."
            : "Ai părăsit pagina Stripe înainte de finalizarea tranzacției. Rezervarea ta se află în continuare în așteptarea plății."}
        </p>

        <div className="mx-auto mt-12 grid max-w-2xl gap-4 text-left sm:grid-cols-2">
          <div className="border border-white/10 bg-[#0b0b0b] p-6">
            <CreditCard className="h-5 w-5 text-gold" />

            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-white/75">
              {locale === "en"
                ? "No charge"
                : "Nicio sumă încasată"}
            </p>

            <p className="mt-3 text-xs leading-6 text-white/35">
              {locale === "en"
                ? "Your card has not been charged by Sunshine Resort."
                : "Sunshine Resort nu a încasat nicio sumă prin această încercare de plată."}
            </p>
          </div>

          <div className="border border-white/10 bg-[#0b0b0b] p-6">
            <Info className="h-5 w-5 text-gold" />

            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-white/75">
              {locale === "en"
                ? "Payment deadline"
                : "Termenul de plată"}
            </p>

            <p className="mt-3 text-xs leading-6 text-white/35">
              {locale === "en"
                ? "You may try again while the payment link remains valid."
                : "Poți încerca din nou cât timp linkul de plată și termenul rezervării sunt încă valabile."}
            </p>
          </div>
        </div>

        {(reservationId || reservationChangeId) && (
          <div className="mx-auto mt-8 max-w-2xl border border-white/10 bg-[#0b0b0b] px-5 py-4 text-left">
            <p className="text-[9px] uppercase tracking-[0.28em] text-white/30">
              {reservationChangeId
                ? locale === "en"
                  ? "Reservation change reference"
                  : "Referință modificare rezervare"
                : locale === "en"
                  ? "Reservation reference"
                  : "Referință rezervare"}
            </p>

            <p className="mt-2 break-all text-xs text-white/45">
              {reservationChangeId ?? reservationId}
            </p>
          </div>
        )}

        <p className="mx-auto mt-8 max-w-2xl text-xs leading-6 text-white/30">
          {locale === "en"
            ? "Return to the payment link received by email to restart the secure checkout."
            : "Revino la linkul de plată primit pe email pentru a relua plata securizată."}
        </p>

        <div className="mt-12 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-3 border border-white/15 px-9 py-5 text-[10px] uppercase tracking-[0.28em] text-white/55 transition hover:border-gold hover:text-gold"
          >
            <ArrowLeft className="h-4 w-4" />

            {locale === "en"
              ? "Go back"
              : "Înapoi"}
          </button>

          <Link
            href={`/${locale}`}
            className="inline-flex items-center justify-center bg-gold px-10 py-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-black transition hover:bg-white"
          >
            {locale === "en"
              ? "Return home"
              : "Pagina principală"}
          </Link>
        </div>
      </section>
    </main>
  );
}
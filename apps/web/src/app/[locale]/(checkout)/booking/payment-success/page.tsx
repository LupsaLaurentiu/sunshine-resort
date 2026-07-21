"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Check, Mail, ShieldCheck } from "lucide-react";

export default function PaymentSuccessPage() {
  const params = useParams<{
    locale?: string;
  }>();

  const searchParams = useSearchParams();

  const locale =
    params.locale === "en" ? "en" : "ro";

  const sessionId =
    searchParams.get("session_id");

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

        <div className="mx-auto mt-14 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-300/40 bg-emerald-300/5 text-emerald-200">
          <Check className="h-9 w-9 stroke-[1.3]" />
        </div>

        <p className="mt-10 text-[10px] uppercase tracking-[0.42em] text-gold">
          {locale === "en"
            ? "Payment received"
            : "Plată înregistrată"}
        </p>

        <h1 className="heading mt-6 text-5xl font-light leading-tight md:text-7xl">
          {locale === "en"
            ? "Your reservation is being confirmed."
            : "Rezervarea ta este în curs de confirmare."}
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-sm leading-8 text-white/50">
          {locale === "en"
            ? "Stripe has received your payment. The reservation will be confirmed automatically as soon as the payment webhook is processed."
            : "Stripe a înregistrat plata. Rezervarea va fi confirmată automat imediat ce notificarea de plată este procesată."}
        </p>

        <div className="mx-auto mt-12 grid max-w-2xl gap-4 text-left sm:grid-cols-2">
          <div className="border border-white/10 bg-[#0b0b0b] p-6">
            <ShieldCheck className="h-5 w-5 text-gold" />

            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-white/75">
              {locale === "en"
                ? "Secure payment"
                : "Plată securizată"}
            </p>

            <p className="mt-3 text-xs leading-6 text-white/35">
              {locale === "en"
                ? "Your card details were processed securely by Stripe."
                : "Datele cardului au fost procesate securizat de Stripe."}
            </p>
          </div>

          <div className="border border-white/10 bg-[#0b0b0b] p-6">
            <Mail className="h-5 w-5 text-gold" />

            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-white/75">
              {locale === "en"
                ? "Confirmation email"
                : "Email de confirmare"}
            </p>

            <p className="mt-3 text-xs leading-6 text-white/35">
              {locale === "en"
                ? "You will receive the reservation confirmation by email."
                : "Vei primi confirmarea rezervării pe email."}
            </p>
          </div>
        </div>

        {sessionId && (
          <div className="mx-auto mt-8 max-w-2xl border border-white/10 bg-[#0b0b0b] px-5 py-4 text-left">
            <p className="text-[9px] uppercase tracking-[0.28em] text-white/30">
              Stripe session
            </p>

            <p className="mt-2 break-all text-xs text-white/45">
              {sessionId}
            </p>
          </div>
        )}

        <p className="mx-auto mt-8 max-w-2xl text-xs leading-6 text-white/30">
          {locale === "en"
            ? "Do not refresh or repeat the payment. Stripe and Sunshine Resort process the transaction automatically."
            : "Nu repeta plata și nu iniția o altă tranzacție. Stripe și Sunshine Resort procesează automat plata."}
        </p>

        <Link
          href={`/${locale}`}
          className="mt-12 inline-block bg-gold px-10 py-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-black transition hover:bg-white"
        >
          {locale === "en"
            ? "Return home"
            : "Înapoi la pagina principală"}
        </Link>
      </section>
    </main>
  );
}
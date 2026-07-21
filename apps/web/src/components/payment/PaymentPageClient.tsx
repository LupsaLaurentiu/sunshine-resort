"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  CalendarDays,
  Check,
  Clock3,
  CreditCard,
  LockKeyhole,
  Moon,
  Users,
} from "lucide-react";

import { usePaymentAccess } from "@/hooks/usePaymentAccess";
import { usePublicCheckout } from "@/hooks/usePublicCheckout";

import type { PublicPaymentType } from "@/types/payment";

function formatPrice(
  value: number,
  locale: "ro" | "en",
): string {
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

function formatDate(
  value: string,
  locale: "ro" | "en",
): string {
  const [year, month, day] = value
    .split("-")
    .map(Number);

  const date = new Date(
    year,
    month - 1,
    day,
  );

  return new Intl.DateTimeFormat(
    locale === "ro" ? "ro-RO" : "en-GB",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    },
  ).format(date);
}

function formatDateTime(
  value: string,
  locale: "ro" | "en",
): string {
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

function getPaymentAmount(
  paymentType: PublicPaymentType,
  depositAmount: number,
  remainingAmount: number,
): number {
  return paymentType === "DEPOSIT"
    ? depositAmount
    : remainingAmount;
}

export function PaymentPageClient() {
  const params = useParams<{
    locale?: string;
  }>();

  const searchParams = useSearchParams();

  const locale =
    params.locale === "en" ? "en" : "ro";

  const token =
    searchParams.get("token")?.trim() ?? "";

  const {
    reservation,
    error: paymentAccessError,
    isLoading: isLoadingReservation,
    refresh,
  } = usePaymentAccess(token);

  const {
    error: checkoutError,
    isLoading: isCreatingCheckout,
    startCheckout,
    clearError,
  } = usePublicCheckout();

  const [selectedPaymentType, setSelectedPaymentType] =
    useState<PublicPaymentType | null>(null);

  const selectedAmount = useMemo(() => {
    if (
      !reservation ||
      !selectedPaymentType
    ) {
      return 0;
    }

    return getPaymentAmount(
      selectedPaymentType,
      reservation.depositAmount,
      reservation.remainingAmount,
    );
  }, [
    reservation,
    selectedPaymentType,
  ]);

  async function handleContinueToCheckout() {
    if (
      !token ||
      !reservation ||
      !selectedPaymentType
    ) {
      return;
    }

    await startCheckout({
      token,
      paymentType:
        selectedPaymentType,
    });
  }

  if (isLoadingReservation) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] px-6 text-[#f5f2eb]">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border border-gold border-t-transparent" />

          <p className="mt-7 text-[10px] uppercase tracking-[0.35em] text-white/40">
            {locale === "en"
              ? "Loading payment details"
              : "Se încarcă detaliile plății"}
          </p>
        </div>
      </main>
    );
  }

  if (
    paymentAccessError ||
    !reservation
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] px-6 py-20 text-[#f5f2eb]">
        <section className="w-full max-w-2xl border border-red-300/20 bg-[#0b0b0b] px-8 py-16 text-center md:px-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-red-300/30 text-red-200">
            <LockKeyhole className="h-6 w-6" />
          </div>

          <p className="mt-8 text-[10px] uppercase tracking-[0.35em] text-red-200">
            {locale === "en"
              ? "Payment unavailable"
              : "Plată indisponibilă"}
          </p>

          <h1 className="heading mt-5 text-5xl font-light md:text-7xl">
            {locale === "en"
              ? "This payment link cannot be used."
              : "Acest link de plată nu poate fi folosit."}
          </h1>

          <p className="mx-auto mt-7 max-w-xl text-sm leading-8 text-white/45">
            {paymentAccessError ??
              (locale === "en"
                ? "The payment link is invalid or has expired."
                : "Linkul de plată este invalid sau a expirat.")}
          </p>

          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() =>
                void refresh()
              }
              className="border border-white/15 px-8 py-4 text-[10px] uppercase tracking-[0.28em] text-white/55 transition hover:border-gold hover:text-gold"
            >
              {locale === "en"
                ? "Try again"
                : "Încearcă din nou"}
            </button>

            <Link
              href={`/${locale}`}
              className="bg-gold px-8 py-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-black transition hover:bg-white"
            >
              {locale === "en"
                ? "Return home"
                : "Înapoi la pagina principală"}
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-[#f5f2eb]">
      <header className="border-b border-white/10 px-6 py-7 md:px-10">
        <div className="mx-auto flex max-w-[1450px] items-center justify-between gap-6">
          <Link href={`/${locale}`}>
            <Image
              src="/logo-sunshine.png"
              alt="Sunshine Resort"
              width={130}
              height={78}
              priority
              className="h-auto w-[110px] md:w-[130px]"
            />
          </Link>

          <div className="hidden items-center gap-3 text-right sm:flex">
            <LockKeyhole className="h-4 w-4 text-gold" />

            <div>
              <p className="text-[9px] uppercase tracking-[0.3em] text-white/35">
                {locale === "en"
                  ? "Secure payment"
                  : "Plată securizată"}
              </p>

              <p className="mt-1 text-xs text-white/60">
                Stripe Checkout
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-[1450px]">
          <div className="max-w-4xl">
            <p className="text-[10px] uppercase tracking-[0.42em] text-gold">
              {locale === "en"
                ? "Reservation payment"
                : "Plata rezervării"}
            </p>

            <h1 className="heading mt-5 text-5xl font-light leading-tight md:text-7xl">
              {locale === "en"
                ? `Welcome, ${reservation.guestFirstName}.`
                : `Bine ai venit, ${reservation.guestFirstName}.`}
            </h1>

            <p className="mt-6 max-w-2xl text-sm leading-8 text-white/45">
              {locale === "en"
                ? "Review your reservation and choose how you would like to complete the payment."
                : "Verifică detaliile rezervării și alege modalitatea în care dorești să efectuezi plata."}
            </p>
          </div>

          <div className="mt-14 grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_430px]">
            <div className="space-y-8">
              <section className="border border-white/10 bg-[#0b0b0b]">
                <div className="border-b border-white/10 px-7 py-6 md:px-9">
                  <p className="text-[10px] uppercase tracking-[0.32em] text-gold">
                    {locale === "en"
                      ? "Your stay"
                      : "Sejurul tău"}
                  </p>

                  <h2 className="heading mt-3 text-3xl font-light">
                    {locale === "en"
                      ? "Reservation details"
                      : "Detaliile rezervării"}
                  </h2>
                </div>

                <div className="grid gap-8 px-7 py-8 md:grid-cols-2 md:px-9">
                  <div className="flex items-start gap-4">
                    <CalendarDays className="mt-1 h-5 w-5 shrink-0 text-gold" />

                    <div>
                      <p className="text-xs text-white/35">
                        Check-in
                      </p>

                      <p className="mt-2 text-sm text-white/80">
                        {formatDate(
                          reservation.checkIn,
                          locale,
                        )}
                      </p>

                      <p className="mt-1 text-xs text-white/30">
                        14:00
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <CalendarDays className="mt-1 h-5 w-5 shrink-0 text-gold" />

                    <div>
                      <p className="text-xs text-white/35">
                        Check-out
                      </p>

                      <p className="mt-2 text-sm text-white/80">
                        {formatDate(
                          reservation.checkOut,
                          locale,
                        )}
                      </p>

                      <p className="mt-1 text-xs text-white/30">
                        10:00
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Moon className="mt-1 h-5 w-5 shrink-0 text-gold" />

                    <div>
                      <p className="text-xs text-white/35">
                        {locale === "en"
                          ? "Duration"
                          : "Durată"}
                      </p>

                      <p className="mt-2 text-sm text-white/80">
                        {reservation.nights}{" "}
                        {locale === "en"
                          ? reservation.nights === 1
                            ? "night"
                            : "nights"
                          : reservation.nights === 1
                            ? "noapte"
                            : "nopți"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Users className="mt-1 h-5 w-5 shrink-0 text-gold" />

                    <div>
                      <p className="text-xs text-white/35">
                        {locale === "en"
                          ? "Guests"
                          : "Oaspeți"}
                      </p>

                      <p className="mt-2 text-sm text-white/80">
                        {reservation.adults}{" "}
                        {locale === "en"
                          ? "adults"
                          : "adulți"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 px-7 py-7 md:px-9">
                  <p className="text-[9px] uppercase tracking-[0.28em] text-white/30">
                    {locale === "en"
                      ? "Apartments"
                      : "Apartamente"}
                  </p>

                  <div className="mt-5 space-y-3">
                    {reservation.roomNames.map(
                      (roomName, index) => (
                        <div
                          key={`${roomName}-${index}`}
                          className="flex items-center justify-between gap-6 border border-white/10 bg-[#050505] px-5 py-4"
                        >
                          <span className="text-sm text-white/70">
                            {roomName}
                          </span>

                          <Check className="h-4 w-4 text-gold" />
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </section>

              <section className="border border-white/10 bg-[#0b0b0b] px-7 py-7 md:px-9">
                <div className="flex items-start gap-4">
                  <Clock3 className="mt-1 h-5 w-5 shrink-0 text-gold" />

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gold">
                      {locale === "en"
                        ? "Payment deadline"
                        : "Termen de plată"}
                    </p>

                    <p className="mt-3 text-sm leading-7 text-white/65">
                      {locale === "en"
                        ? "Payment must be completed before"
                        : "Plata trebuie efectuată până la"}{" "}
                      <span className="text-white">
                        {formatDateTime(
                          reservation.paymentExpiresAt,
                          locale,
                        )}
                      </span>
                      .
                    </p>
                  </div>
                </div>
              </section>
            </div>

            <aside className="border border-white/10 bg-[#0b0b0b] p-7 xl:sticky xl:top-8 md:p-9">
              <p className="text-[10px] uppercase tracking-[0.32em] text-gold">
                {locale === "en"
                  ? "Payment"
                  : "Plată"}
              </p>

              <h2 className="heading mt-3 text-4xl font-light">
                {locale === "en"
                  ? "Choose an option"
                  : "Alege o opțiune"}
              </h2>

              <div className="mt-8 space-y-3">
                {reservation.availablePaymentTypes.includes(
                  "DEPOSIT",
                ) && (
                  <button
                    type="button"
                    disabled={
                      isCreatingCheckout
                    }
                    onClick={() => {
                      clearError();
                      setSelectedPaymentType(
                        "DEPOSIT",
                      );
                    }}
                    className={`w-full border p-5 text-left transition ${
                      selectedPaymentType ===
                      "DEPOSIT"
                        ? "border-gold bg-gold/5"
                        : "border-white/10 bg-[#050505] hover:border-white/25"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/75">
                          {locale === "en"
                            ? "Minimum deposit"
                            : "Avans minim"}
                        </p>

                        <p className="mt-2 text-xs leading-6 text-white/35">
                          {locale === "en"
                            ? "Pay 50% now and the remaining balance at the resort."
                            : "Achită acum 50%, iar diferența poate fi plătită la locație."}
                        </p>
                      </div>

                      <span
                        className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          selectedPaymentType ===
                          "DEPOSIT"
                            ? "border-gold"
                            : "border-white/20"
                        }`}
                      >
                        {selectedPaymentType ===
                          "DEPOSIT" && (
                          <span className="h-2 w-2 rounded-full bg-gold" />
                        )}
                      </span>
                    </div>

                    <p className="heading mt-5 text-3xl text-gold">
                      {formatPrice(
                        reservation.depositAmount,
                        locale,
                      )}
                    </p>
                  </button>
                )}

                {reservation.availablePaymentTypes.includes(
                  "FULL",
                ) && (
                  <button
                    type="button"
                    disabled={
                      isCreatingCheckout
                    }
                    onClick={() => {
                      clearError();
                      setSelectedPaymentType(
                        "FULL",
                      );
                    }}
                    className={`w-full border p-5 text-left transition ${
                      selectedPaymentType ===
                      "FULL"
                        ? "border-gold bg-gold/5"
                        : "border-white/10 bg-[#050505] hover:border-white/25"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/75">
                          {locale === "en"
                            ? "Full payment"
                            : "Plată integrală"}
                        </p>

                        <p className="mt-2 text-xs leading-6 text-white/35">
                          {locale === "en"
                            ? "Complete the full payment securely online."
                            : "Achită integral rezervarea prin plata online securizată."}
                        </p>
                      </div>

                      <span
                        className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          selectedPaymentType ===
                          "FULL"
                            ? "border-gold"
                            : "border-white/20"
                        }`}
                      >
                        {selectedPaymentType ===
                          "FULL" && (
                          <span className="h-2 w-2 rounded-full bg-gold" />
                        )}
                      </span>
                    </div>

                    <p className="heading mt-5 text-3xl text-gold">
                      {formatPrice(
                        reservation.remainingAmount,
                        locale,
                      )}
                    </p>
                  </button>
                )}
              </div>

              <div className="mt-8 space-y-4 border-y border-white/10 py-6 text-sm">
                <div className="flex items-center justify-between gap-6 text-white/40">
                  <span>
                    {locale === "en"
                      ? "Reservation total"
                      : "Total rezervare"}
                  </span>

                  <span className="text-white/75">
                    {formatPrice(
                      reservation.totalPrice,
                      locale,
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-6 text-white/40">
                  <span>
                    {locale === "en"
                      ? "Already paid"
                      : "Deja achitat"}
                  </span>

                  <span className="text-white/75">
                    {formatPrice(
                      reservation.paidAmount,
                      locale,
                    )}
                  </span>
                </div>

                <div className="flex items-end justify-between gap-6 border-t border-white/10 pt-5">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                    {locale === "en"
                      ? "Selected payment"
                      : "Plată selectată"}
                  </span>

                  <span className="heading text-3xl text-gold">
                    {selectedPaymentType
                      ? formatPrice(
                          selectedAmount,
                          locale,
                        )
                      : "—"}
                  </span>
                </div>
              </div>

              {checkoutError && (
                <div
                  role="alert"
                  className="mt-6 border border-red-300/20 bg-red-300/5 px-4 py-4 text-sm leading-6 text-red-200"
                >
                  {checkoutError}
                </div>
              )}

              <button
                type="button"
                disabled={
                  !selectedPaymentType ||
                  isCreatingCheckout
                }
                onClick={() =>
                  void handleContinueToCheckout()
                }
                className="mt-8 flex w-full items-center justify-center gap-3 bg-gold px-7 py-5 text-[10px] font-semibold uppercase tracking-[0.28em] text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-35"
              >
                <CreditCard className="h-4 w-4" />

                {isCreatingCheckout
                  ? locale === "en"
                    ? "Redirecting..."
                    : "Se deschide plata..."
                  : locale === "en"
                    ? "Continue to secure payment"
                    : "Continuă către plata securizată"}
              </button>

              <div className="mt-6 flex items-start gap-3">
                <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-white/25" />

                <p className="text-xs leading-6 text-white/30">
                  {locale === "en"
                    ? "Payment is processed securely by Stripe. Sunshine Resort does not store your card details."
                    : "Plata este procesată securizat prin Stripe. Sunshine Resort nu stochează datele cardului tău."}
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
"use client";

import {
  useMemo,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  useParams,
  useSearchParams,
} from "next/navigation";

import {
  CalendarDays,
  Check,
  Clock3,
  CreditCard,
  LockKeyhole,
  Moon,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
} from "lucide-react";

import {
  usePaymentAccess,
} from "@/hooks/usePaymentAccess";

import {
  usePublicCheckout,
} from "@/hooks/usePublicCheckout";

import type {
  PublicPaymentType,
} from "@/types/payment";

type Locale = "ro" | "en";

const PAYMENT_PAGE_CONTENT = {
  ro: {
    loading: "Se încarcă detaliile plății",
    unavailableEyebrow: "Plată indisponibilă",
    unavailableTitle: "Acest link de plată nu poate fi folosit.",
    unavailableFallback: "Linkul de plată este invalid sau a expirat.",
    tryAgain: "Încearcă din nou",
    returnHome: "Înapoi la pagina principală",
    securePayment: "Plată securizată",
    eyebrow: "Ultimul pas",
    titlePrefix: "Sejurul tău este aproape confirmat",
    reservationFor: "Rezervare pentru",
    description: "Verifică detaliile sejurului și alege modalitatea de plată potrivită pentru tine.",
    yourStay: "Sejurul tău",
    reservationDetails: "Detaliile rezervării",
    checkIn: "Check-in",
    checkOut: "Check-out",
    duration: "Durată",
    guests: "Oaspeți",
    night: "noapte",
    nights: "nopți",
    adults: "adulți",
    apartments: "Apartamente",
    adultsOnly: "Adults Only",
    directBooking: "Rezervare directă",
    paymentDeadline: "Termen de plată",
    paymentDeadlinePrefix: "Finalizează plata până la",
    paymentDeadlineSuffix: "pentru ca rezervarea să rămână disponibilă.",
    payment: "Plată",
    chooseOption: "Alege cum dorești să confirmi rezervarea.",
    minimumDeposit: "Avans minim",
    minimumDepositDescription: "Achită acum 50%, iar diferența poate fi plătită la locație.",
    fullPayment: "Plată integrală",
    fullPaymentDescription: "Achită integral rezervarea prin plata online securizată.",
    reservationTotal: "Total rezervare",
    alreadyPaid: "Deja achitat",
    selectedPayment: "Plată selectată",
    remainingAtResort: "Diferență la locație",
    continue: "Continuă către plata securizată",
    redirecting: "Se deschide plata...",
    stripeNotice: "Plata este procesată securizat prin Stripe. Sunshine Resort nu stochează datele cardului tău.",
    acceptedPayments: "Visa · Mastercard · Apple Pay · Google Pay",
    secureCheckout: "Stripe Secure Checkout",
  },
  en: {
    loading: "Loading payment details",
    unavailableEyebrow: "Payment unavailable",
    unavailableTitle: "This payment link cannot be used.",
    unavailableFallback: "The payment link is invalid or has expired.",
    tryAgain: "Try again",
    returnHome: "Return home",
    securePayment: "Secure payment",
    eyebrow: "The final step",
    titlePrefix: "Your stay is almost confirmed",
    reservationFor: "Reservation for",
    description: "Review your stay details and choose the payment option that suits you.",
    yourStay: "Your stay",
    reservationDetails: "Reservation details",
    checkIn: "Check-in",
    checkOut: "Check-out",
    duration: "Duration",
    guests: "Guests",
    night: "night",
    nights: "nights",
    adults: "adults",
    apartments: "Apartments",
    adultsOnly: "Adults Only",
    directBooking: "Direct booking",
    paymentDeadline: "Payment deadline",
    paymentDeadlinePrefix: "Complete payment before",
    paymentDeadlineSuffix: "to keep your reservation available.",
    payment: "Payment",
    chooseOption: "Choose how you would like to confirm your reservation.",
    minimumDeposit: "Minimum deposit",
    recommended: "Recommended",
    minimumDepositDescription: "Pay 50% now and the remaining balance at the resort.",
    fullPayment: "Full payment",
    fullPaymentDescription: "Complete the full payment securely online.",
    reservationTotal: "Reservation total",
    alreadyPaid: "Already paid",
    selectedPayment: "Selected payment",
    remainingAtResort: "Balance at the resort",
    continue: "Continue to secure payment",
    redirecting: "Redirecting...",
    stripeNotice: "Payment is processed securely by Stripe. Sunshine Resort does not store your card details.",
    acceptedPayments: "Visa · Mastercard · Apple Pay · Google Pay",
    secureCheckout: "Stripe Secure Checkout",
  },
} as const;

function formatPrice(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "ro" ? "ro-RO" : "en-GB", {
    style: "currency",
    currency: "RON",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string, locale: Locale): string {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat(locale === "ro" ? "ro-RO" : "en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value: string, locale: Locale): string {
  const date = new Date(value);

  return new Intl.DateTimeFormat(locale === "ro" ? "ro-RO" : "en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getPaymentAmount(
  paymentType: PublicPaymentType,
  depositAmount: number,
  remainingAmount: number,
): number {
  return paymentType === "DEPOSIT" ? depositAmount : remainingAmount;
}

export function PaymentPageClient() {
  const params = useParams<{ locale?: string }>();
  const searchParams = useSearchParams();
  const locale: Locale = params.locale === "en" ? "en" : "ro";
  const content = PAYMENT_PAGE_CONTENT[locale];
  const token = searchParams.get("token")?.trim() ?? "";

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
    if (!reservation || !selectedPaymentType) {
      return 0;
    }

    return getPaymentAmount(
      selectedPaymentType,
      reservation.depositAmount,
      reservation.remainingAmount,
    );
  }, [reservation, selectedPaymentType]);

  const remainingAtResort = useMemo(() => {
    if (!reservation || selectedPaymentType !== "DEPOSIT") {
      return 0;
    }

    return Math.max(
      reservation.remainingAmount - reservation.depositAmount,
      0,
    );
  }, [reservation, selectedPaymentType]);

  async function handleContinueToCheckout() {
    if (!token || !reservation || !selectedPaymentType) {
      return;
    }

    await startCheckout({
      token,
      paymentType: selectedPaymentType,
    });
  }

  if (isLoadingReservation) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050505] px-6 text-[#f5f2eb]">
        <Image
          src="/hero-mockup.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-20"
        />

        <div className="absolute inset-0 bg-black/75" />

        <div className="relative z-10 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border border-gold border-t-transparent" />

          <p className="mt-7 text-[10px] uppercase tracking-[0.35em] text-white/45">
            {content.loading}
          </p>
        </div>
      </main>
    );
  }

  if (paymentAccessError || !reservation) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050505] px-6 py-20 text-[#f5f2eb]">
        <Image
          src="/hero-mockup.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-25"
        />

        <div className="absolute inset-0 bg-black/80" />

        <section className="relative z-10 w-full max-w-2xl border border-red-300/20 bg-black/55 px-8 py-16 text-center backdrop-blur-md md:px-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-red-300/30 text-red-200">
            <LockKeyhole className="h-6 w-6" />
          </div>

          <p className="mt-8 text-[10px] uppercase tracking-[0.35em] text-red-200">
            {content.unavailableEyebrow}
          </p>

          <h1 className="heading mt-5 text-5xl font-light md:text-7xl">
            {content.unavailableTitle}
          </h1>

          <p className="mx-auto mt-7 max-w-xl text-sm leading-8 text-white/45">
            {paymentAccessError ?? content.unavailableFallback}
          </p>

          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => void refresh()}
              className="border border-white/15 px-8 py-4 text-[10px] uppercase tracking-[0.28em] text-white/55 transition hover:border-gold hover:text-gold"
            >
              {content.tryAgain}
            </button>

            <Link
              href={`/${locale}`}
              className="bg-gold px-8 py-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-black transition hover:bg-white"
            >
              {content.returnHome}
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-[#f5f2eb]">
      <div className="absolute inset-x-0 top-0 h-[560px] overflow-hidden">
        <Image
          src="/hero-mockup.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-40"
        />

        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-[#050505]/55 to-[#050505]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
      </div>

      <header className="relative z-20 border-b border-white/10 px-6 py-6 md:px-10">
        <div className="mx-auto flex max-w-[1450px] items-center justify-between gap-6">
          <Link
            href={`/${locale}`}
            aria-label="Sunshine Resort"
            className="inline-block"
          >
            <Image
              src="/logo-sunshine.png"
              alt="Sunshine Resort"
              width={150}
              height={90}
              priority
              className="h-auto w-[118px] brightness-0 invert transition-opacity duration-300 hover:opacity-80 md:w-[138px]"
            />
          </Link>

          <div className="hidden items-center gap-3 text-right sm:flex">
            <LockKeyhole className="h-4 w-4 text-gold" />

            <div>
              <p className="text-[9px] uppercase tracking-[0.3em] text-white/40">
                {content.securePayment}
              </p>

              <p className="mt-1 text-xs text-white/65">
                {content.secureCheckout}
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="relative z-10 px-6 pb-20 pt-16 md:px-10 md:pb-28 md:pt-20">
        <div className="mx-auto max-w-[1450px]">
          <div className="max-w-5xl">
            <p className="text-[10px] font-medium uppercase tracking-[0.45em] text-gold">
              {content.eyebrow}
            </p>

            <h1 className="heading mt-6 max-w-5xl text-5xl font-light leading-[0.98] tracking-[-0.015em] sm:text-6xl md:text-7xl lg:text-[5.5rem]">
              {content.titlePrefix}.
            </h1>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
              <p className="text-[9px] uppercase tracking-[0.3em] text-white/35 sm:text-[10px]">
                {content.reservationFor}
              </p>

              <span className="hidden h-px w-10 bg-gold/50 sm:block" />

              <p className="heading text-2xl font-light text-white/85 sm:text-3xl">
                {reservation.guestFirstName}
              </p>
            </div>

            <p className="mt-7 max-w-2xl text-sm leading-8 text-white/55 sm:text-[15px] md:text-base md:leading-9">
              {content.description}
            </p>
          </div>

          <div className="mt-14 grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_440px] xl:gap-10">
            <div className="space-y-8">
              <section className="overflow-hidden border border-white/10 bg-black/45 backdrop-blur-md">
                <div className="flex flex-col gap-6 border-b border-white/10 px-7 py-7 md:flex-row md:items-end md:justify-between md:px-9">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.32em] text-gold">
                      {content.yourStay}
                    </p>

                    <h2 className="heading mt-3 text-3xl font-light sm:text-4xl">
                      {content.reservationDetails}
                    </h2>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="border border-white/10 px-3 py-2 text-[8px] uppercase tracking-[0.22em] text-white/45 sm:text-[9px]">
                      {content.adultsOnly}
                    </span>

                    <span className="border border-gold/30 px-3 py-2 text-[8px] uppercase tracking-[0.22em] text-gold/80 sm:text-[9px]">
                      {content.directBooking}
                    </span>
                  </div>
                </div>

                <div className="grid gap-x-10 gap-y-9 px-7 py-9 md:grid-cols-2 md:px-9 md:py-10">
                  <div className="flex items-start gap-4">
                    <CalendarDays className="mt-1 h-5 w-5 shrink-0 text-gold stroke-[1.4]" />
                    <div>
                      <p className="text-xs text-white/35">{content.checkIn}</p>
                      <p className="mt-2 text-sm text-white/85 sm:text-[15px]">
                        {formatDate(reservation.checkIn, locale)}
                      </p>
                      <p className="mt-1 text-xs text-white/30">14:00</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <CalendarDays className="mt-1 h-5 w-5 shrink-0 text-gold stroke-[1.4]" />
                    <div>
                      <p className="text-xs text-white/35">{content.checkOut}</p>
                      <p className="mt-2 text-sm text-white/85 sm:text-[15px]">
                        {formatDate(reservation.checkOut, locale)}
                      </p>
                      <p className="mt-1 text-xs text-white/30">10:00</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Moon className="mt-1 h-5 w-5 shrink-0 text-gold stroke-[1.4]" />
                    <div>
                      <p className="text-xs text-white/35">{content.duration}</p>
                      <p className="mt-2 text-sm text-white/85 sm:text-[15px]">
                        {reservation.nights} {reservation.nights === 1 ? content.night : content.nights}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Users className="mt-1 h-5 w-5 shrink-0 text-gold stroke-[1.4]" />
                    <div>
                      <p className="text-xs text-white/35">{content.guests}</p>
                      <p className="mt-2 text-sm text-white/85 sm:text-[15px]">
                        {reservation.adults} {content.adults}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 px-7 py-8 md:px-9">
                  <p className="text-[9px] uppercase tracking-[0.28em] text-white/30">
                    {content.apartments}
                  </p>

                  <div className="mt-5 space-y-3">
                    {reservation.roomNames.map((roomName, index) => (
                      <div
                        key={`${roomName}-${index}`}
                        className="flex items-center justify-between gap-6 border border-white/10 bg-black/35 px-5 py-4"
                      >
                        <span className="text-sm text-white/75">{roomName}</span>
                        <Check className="h-4 w-4 text-gold stroke-[1.5]" />
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="relative overflow-hidden border border-gold/20 bg-[#15120c]/75 px-7 py-8 backdrop-blur-md md:px-9">
                <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 translate-x-1/3 -translate-y-1/3 rounded-full bg-gold/[0.06] blur-3xl" />

                <div className="relative flex items-start gap-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-gold/30 text-gold">
                    <Clock3 className="h-5 w-5 stroke-[1.35]" />
                  </span>

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gold">
                      {content.paymentDeadline}
                    </p>

                    <p className="mt-4 text-sm leading-7 text-white/55">
                      {content.paymentDeadlinePrefix}
                    </p>

                    <p className="heading mt-2 text-2xl font-light text-white sm:text-3xl">
                      {formatDateTime(reservation.paymentExpiresAt, locale)}
                    </p>

                    <p className="mt-3 text-xs leading-6 text-white/35">
                      {content.paymentDeadlineSuffix}
                    </p>
                  </div>
                </div>
              </section>
            </div>

            <aside className="border border-white/10 bg-black/55 p-7 backdrop-blur-md md:p-9 xl:sticky xl:top-8">
              <p className="text-[10px] uppercase tracking-[0.32em] text-gold">
                {content.payment}
              </p>

              <h2 className="heading mt-3 max-w-sm text-4xl font-light leading-[1.05]">
                {content.chooseOption}
              </h2>

              <div className="mt-8 space-y-3">
                {reservation.availablePaymentTypes.includes("DEPOSIT") && (
                  <button
                    type="button"
                    disabled={isCreatingCheckout}
                    onClick={() => {
                      clearError();
                      setSelectedPaymentType("DEPOSIT");
                    }}
                    className={`relative w-full overflow-hidden border p-5 text-left transition duration-500 ${
                      selectedPaymentType === "DEPOSIT"
                        ? "border-gold bg-gold/[0.07]"
                        : "border-white/10 bg-black/30 hover:border-white/25"
                    }`}
                  >
                    {selectedPaymentType === "DEPOSIT" && (
                      <div className="absolute inset-y-0 left-0 w-px bg-gold" />
                    )}

                    <div className="flex items-start justify-between gap-6">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
                            {content.minimumDeposit}
                          </p>
                        </div>

                        <p className="mt-3 text-xs leading-6 text-white/40">
                          {content.minimumDepositDescription}
                        </p>
                      </div>

                      <span
                        className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          selectedPaymentType === "DEPOSIT"
                            ? "border-gold"
                            : "border-white/20"
                        }`}
                      >
                        {selectedPaymentType === "DEPOSIT" && (
                          <span className="h-2 w-2 rounded-full bg-gold" />
                        )}
                      </span>
                    </div>

                    <p className="heading mt-6 text-3xl text-gold">
                      {formatPrice(reservation.depositAmount, locale)}
                    </p>
                  </button>
                )}

                {reservation.availablePaymentTypes.includes("FULL") && (
                  <button
                    type="button"
                    disabled={isCreatingCheckout}
                    onClick={() => {
                      clearError();
                      setSelectedPaymentType("FULL");
                    }}
                    className={`relative w-full overflow-hidden border p-5 text-left transition duration-500 ${
                      selectedPaymentType === "FULL"
                        ? "border-gold bg-gold/[0.07]"
                        : "border-white/10 bg-black/30 hover:border-white/25"
                    }`}
                  >
                    {selectedPaymentType === "FULL" && (
                      <div className="absolute inset-y-0 left-0 w-px bg-gold" />
                    )}

                    <div className="flex items-start justify-between gap-6">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
                          {content.fullPayment}
                        </p>

                        <p className="mt-3 text-xs leading-6 text-white/40">
                          {content.fullPaymentDescription}
                        </p>
                      </div>

                      <span
                        className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          selectedPaymentType === "FULL"
                            ? "border-gold"
                            : "border-white/20"
                        }`}
                      >
                        {selectedPaymentType === "FULL" && (
                          <span className="h-2 w-2 rounded-full bg-gold" />
                        )}
                      </span>
                    </div>

                    <p className="heading mt-6 text-3xl text-gold">
                      {formatPrice(reservation.remainingAmount, locale)}
                    </p>
                  </button>
                )}
              </div>

              <div className="mt-8 border-y border-white/10 py-6">
                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between gap-6 text-white/40">
                    <span>{content.reservationTotal}</span>
                    <span className="text-white/80">
                      {formatPrice(reservation.totalPrice, locale)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-6 text-white/40">
                    <span>{content.alreadyPaid}</span>
                    <span className="text-white/80">
                      {formatPrice(reservation.paidAmount, locale)}
                    </span>
                  </div>

                  {selectedPaymentType === "DEPOSIT" && (
                    <div className="flex items-center justify-between gap-6 text-white/40">
                      <span>{content.remainingAtResort}</span>
                      <span className="text-white/80">
                        {formatPrice(remainingAtResort, locale)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex items-end justify-between gap-6 border-t border-white/10 pt-6">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                    {content.selectedPayment}
                  </span>

                  <span className="heading text-3xl text-gold">
                    {selectedPaymentType
                      ? formatPrice(selectedAmount, locale)
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
                disabled={!selectedPaymentType || isCreatingCheckout}
                onClick={() => void handleContinueToCheckout()}
                className="group mt-8 flex min-h-[62px] w-full items-center justify-center gap-3 bg-gold px-7 py-5 text-[10px] font-semibold uppercase tracking-[0.28em] text-black transition duration-500 hover:bg-white disabled:cursor-not-allowed disabled:opacity-35"
              >
                <WalletCards className="h-4 w-4 transition-transform duration-500 group-hover:-translate-y-0.5" />
                {isCreatingCheckout ? content.redirecting : content.continue}
              </button>

              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold/70" />
                  <p className="text-xs leading-6 text-white/35">
                    {content.stripeNotice}
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-white/25" />
                  <p className="text-xs leading-6 text-white/30">
                    {content.acceptedPayments}
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
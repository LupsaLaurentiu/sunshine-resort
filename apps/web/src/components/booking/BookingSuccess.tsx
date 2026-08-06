"use client";

import {
  useEffect,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  CreditCard,
  Mail,
} from "lucide-react";

import {
  useParams,
} from "next/navigation";

import {
  useSmoothScroll,
} from "@/components/animations/SmoothScroll";

import type {
  CreateReservationResponse,
} from "@/types/reservation";

type BookingSuccessProps = {
  reservation: CreateReservationResponse;
};

type Locale =
  | "ro"
  | "en";

const BOOKING_SUCCESS_CONTENT = {
  ro: {
    eyebrow:
      "Cerere înregistrată",

    title:
      "Escapada ta începe aici.",

    description:
      "Cererea de rezervare a fost înregistrată și este în așteptarea aprobării. După verificare, vei primi prin email confirmarea și linkul securizat pentru plată.",

    detailsEyebrow:
      "Detaliile cererii",

    detailsTitle:
      "Rezumatul rezervării",

    reservationId:
      "ID rezervare",

    status:
      "Status",

    total:
      "Total",

    minimumDeposit:
      "Avans minim",

    nights:
      "Număr de nopți",

    approvalDeadline:
      "Termen pentru aprobare",

    pendingApproval:
      "În așteptarea aprobării",

    nextStepsEyebrow:
      "Ce urmează",

    nextStepsTitle:
      "De aici, ne ocupăm noi.",

    steps: [
      {
        title:
          "Verificăm cererea",

        description:
          "Echipa Sunshine Resort verifică disponibilitatea și detaliile rezervării.",
      },

      {
        title:
          "Primești confirmarea",

        description:
          "După aprobare, vei primi un email cu toate informațiile necesare.",
      },

      {
        title:
          "Alegi plata",

        description:
          "Vei putea achita avansul minim de 50% sau valoarea integrală a sejurului.",
      },

      {
        title:
          "Rezervarea este confirmată",

        description:
          "După înregistrarea plății, rezervarea ta devine confirmată.",
      },
    ],

    note:
      "Păstrează ID-ul rezervării. Acesta poate fi folosit pentru identificarea rapidă a cererii tale.",

    home:
      "Înapoi la pagina principală",

    apartments:
      "Descoperă apartamentele",
  },

  en: {
    eyebrow:
      "Request received",

    title:
      "Your escape begins here.",

    description:
      "Your booking request has been registered and is awaiting approval. After review, you will receive a confirmation email and a secure payment link.",

    detailsEyebrow:
      "Request details",

    detailsTitle:
      "Booking summary",

    reservationId:
      "Reservation ID",

    status:
      "Status",

    total:
      "Total",

    minimumDeposit:
      "Minimum deposit",

    nights:
      "Number of nights",

    approvalDeadline:
      "Approval deadline",

    pendingApproval:
      "Pending approval",

    nextStepsEyebrow:
      "What happens next",

    nextStepsTitle:
      "From here, we take care of everything.",

    steps: [
      {
        title:
          "We review your request",

        description:
          "The Sunshine Resort team verifies availability and the booking details.",
      },

      {
        title:
          "You receive confirmation",

        description:
          "After approval, you will receive an email with all the necessary information.",
      },

      {
        title:
          "You choose the payment",

        description:
          "You can pay the minimum 50% deposit or the full value of the stay.",
      },

      {
        title:
          "Your booking is confirmed",

        description:
          "Once payment is registered, your reservation becomes confirmed.",
      },
    ],

    note:
      "Keep your reservation ID. It can be used to identify your request quickly.",

    home:
      "Return home",

    apartments:
      "Explore apartments",
  },
} as const;

function formatPrice(
  value: number,
  locale: Locale,
): string {
  return new Intl.NumberFormat(
    locale === "ro"
      ? "ro-RO"
      : "en-GB",
    {
      style:
        "currency",

      currency:
        "RON",

      minimumFractionDigits:
        0,

      maximumFractionDigits:
        2,
    },
  ).format(
    value,
  );
}

function formatDate(
  value: string,
  locale: Locale,
): string {
  if (!value) {
    return "—";
  }

  const date =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    locale === "ro"
      ? "ro-RO"
      : "en-GB",
    {
      day:
        "2-digit",

      month:
        "long",

      year:
        "numeric",

      hour:
        "2-digit",

      minute:
        "2-digit",
    },
  ).format(
    date,
  );
}

function getStatusLabel(
  status: string,
  locale: Locale,
): string {
  if (
    status ===
    "PENDING_APPROVAL"
  ) {
    return BOOKING_SUCCESS_CONTENT[
      locale
    ].pendingApproval;
  }

  return status
    .replaceAll(
      "_",
      " ",
    )
    .toLowerCase()
    .replace(
      /^./,
      (
        firstCharacter,
      ) =>
        firstCharacter.toUpperCase(),
    );
}

export function BookingSuccess({
  reservation,
}: BookingSuccessProps) {
  const params =
    useParams<{
      locale?: string;
    }>();

  const locale: Locale =
    params.locale === "en"
      ? "en"
      : "ro";

  const {
    lenis,
  } = useSmoothScroll();

  useEffect(() => {
    if (lenis) {
      lenis.scrollTo(
        0,
        {
          immediate:
            true,

          force:
            true,
        },
      );

      return;
    }

    window.scrollTo({
      top:
        0,

      left:
        0,

      behavior:
        "instant",
    });
  }, [
    lenis,
  ]);

  const content =
    BOOKING_SUCCESS_CONTENT[
      locale
    ];

  const homeHref =
    `/${locale}`;

  const roomsHref =
    locale === "ro"
      ? "/ro/camere"
      : "/en/rooms";

  return (
    <section className="relative isolate overflow-hidden bg-[#050505] px-6 pb-24 pt-28 text-[#f5f2eb] sm:px-8 md:pb-32 md:pt-36">
      <Image
        src="/hero-mockup.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center opacity-45"
      />

      <div className="absolute inset-0 bg-black/55" />

      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-[#050505]/65 to-[#050505]" />

      <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />

      <div className="pointer-events-none absolute left-1/2 top-[22rem] h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-gold/[0.025] blur-3xl" />

 
      <div className="relative z-10 mx-auto w-full max-w-[1100px]">
        <header className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-gold/80 text-gold sm:h-20 sm:w-20">
            <Check className="h-7 w-7 stroke-[1.25] sm:h-9 sm:w-9" />
          </div>

          <p className="mt-8 text-[9px] font-medium uppercase tracking-[0.48em] text-gold sm:text-[10px] md:text-xs">
            {content.eyebrow}
          </p>

          <h1 className="heading mx-auto mt-6 max-w-5xl text-5xl font-light leading-[0.98] tracking-[-0.015em] sm:text-6xl md:text-7xl lg:text-8xl">
            {content.title}
          </h1>

          <div className="mx-auto mt-9 h-px w-16 bg-gold/70 md:w-20" />

          <p className="mx-auto mt-9 max-w-2xl text-sm leading-8 text-white/55 sm:text-[15px] md:text-base md:leading-9">
            {content.description}
          </p>
        </header>

        <div className="mx-auto mt-14 max-w-3xl border border-white/10 bg-black/45 p-6 backdrop-blur-md sm:p-8 md:mt-16 md:p-10">
          <div className="border-b border-white/10 pb-7">
            <p className="text-[9px] font-medium uppercase tracking-[0.4em] text-gold sm:text-[10px]">
              {content.detailsEyebrow}
            </p>

            <h2 className="heading mt-4 text-3xl font-light sm:text-4xl">
              {content.detailsTitle}
            </h2>
          </div>

          <dl className="grid gap-x-12 gap-y-7 py-8 sm:grid-cols-2">
            <div>
              <dt className="text-[9px] uppercase tracking-[0.28em] text-white/35 sm:text-[10px]">
                {content.reservationId}
              </dt>

              <dd className="mt-2 break-all text-sm leading-6 text-white/80">
                {reservation.id}
              </dd>
            </div>

            <div>
              <dt className="text-[9px] uppercase tracking-[0.28em] text-white/35 sm:text-[10px]">
                {content.status}
              </dt>

              <dd className="mt-2 text-sm tracking-[0.08em] text-gold">
                {getStatusLabel(
                  reservation.status,
                  locale,
                )}
              </dd>
            </div>

            <div>
              <dt className="text-[9px] uppercase tracking-[0.28em] text-white/35 sm:text-[10px]">
                {content.total}
              </dt>

              <dd className="heading mt-2 text-3xl font-light">
                {formatPrice(
                  reservation.totalPrice,
                  locale,
                )}
              </dd>
            </div>

            <div>
              <dt className="text-[9px] uppercase tracking-[0.28em] text-white/35 sm:text-[10px]">
                {content.minimumDeposit}
              </dt>

              <dd className="heading mt-2 text-3xl font-light">
                {formatPrice(
                  reservation.depositAmount,
                  locale,
                )}
              </dd>
            </div>

            <div>
              <dt className="text-[9px] uppercase tracking-[0.28em] text-white/35 sm:text-[10px]">
                {content.nights}
              </dt>

              <dd className="mt-2 text-sm text-white/80">
                {reservation.nights}
              </dd>
            </div>

            <div>
              <dt className="text-[9px] uppercase tracking-[0.28em] text-white/35 sm:text-[10px]">
                {content.approvalDeadline}
              </dt>

              <dd className="mt-2 text-sm leading-6 text-white/80">
                {formatDate(
                  reservation.approvalExpiresAt,
                  locale,
                )}
              </dd>
            </div>
          </dl>

          <div className="border-t border-white/10 pt-6">
            <p className="text-xs leading-7 text-white/40">
              {reservation.message}
            </p>
          </div>
        </div>

        <section
          aria-labelledby="booking-next-steps-title"
          className="mt-20 md:mt-24"
        >
          <div className="text-center">
            <p className="text-[9px] font-medium uppercase tracking-[0.45em] text-gold sm:text-[10px]">
              {content.nextStepsEyebrow}
            </p>

            <h2
              id="booking-next-steps-title"
              className="heading mx-auto mt-5 max-w-4xl text-4xl font-light leading-[1.05] sm:text-5xl md:text-6xl"
            >
              {content.nextStepsTitle}
            </h2>
          </div>

          <div className="mt-12 grid gap-px border border-white/10 bg-white/10 md:grid-cols-2 lg:grid-cols-4">
            {content.steps.map(
              (
                step,
                index,
              ) => {
                const icons = [
                  Clock3,
                  Mail,
                  CreditCard,
                  CheckCircle2,
                ];

                const StepIcon =
                  icons[
                    index
                  ];

                return (
                  <article
                    key={
                      step.title
                    }
                    className="bg-black/45 p-7 backdrop-blur-md sm:p-8"
                  >
                    <div className="flex items-center justify-between gap-6">
                      <StepIcon className="h-5 w-5 text-gold stroke-[1.25]" />

                      <span className="text-[9px] tracking-[0.28em] text-white/25">
                        {String(
                          index +
                            1,
                        ).padStart(
                          2,
                          "0",
                        )}
                      </span>
                    </div>

                    <h3 className="heading mt-8 text-2xl font-light leading-tight">
                      {step.title}
                    </h3>

                    <p className="mt-4 text-xs leading-7 text-white/40">
                      {
                        step.description
                      }
                    </p>
                  </article>
                );
              },
            )}
          </div>
        </section>

        <div className="mt-14 text-center md:mt-16">
          <p className="mx-auto max-w-xl text-xs leading-7 text-white/35">
            {content.note}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={homeHref}
              className="inline-flex min-h-14 items-center justify-center border border-gold px-8 py-4 text-[9px] font-semibold uppercase tracking-[0.28em] text-gold transition duration-500 hover:bg-gold hover:text-black sm:px-10 sm:text-[10px]"
            >
              {content.home}
            </Link>

            <Link
              href={roomsHref}
              className="group inline-flex min-h-14 items-center justify-center gap-4 border border-white/15 px-8 py-4 text-[9px] font-semibold uppercase tracking-[0.28em] text-white/70 transition duration-500 hover:border-white hover:text-white sm:px-10 sm:text-[10px]"
            >
              {content.apartments}

              <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
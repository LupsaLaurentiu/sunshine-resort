"use client";

import Image from "next/image";
import Link from "next/link";

import {
  useParams,
  usePathname,
  useSearchParams,
} from "next/navigation";

import {
  ArrowLeft,
  CreditCard,
  Info,
  X,
} from "lucide-react";

type Locale =
  | "ro"
  | "en";

const PAYMENT_CANCELLED_CONTENT = {
  ro: {
    eyebrow:
      "Plată anulată",

    title:
      "Plata nu a fost procesată.",

    description:
      "Ai părăsit pagina Stripe înainte de finalizarea tranzacției. Rezervarea ta se află în continuare în așteptarea plății.",

    noChargeTitle:
      "Nicio sumă încasată",

    noChargeDescription:
      "Sunshine Resort nu a încasat nicio sumă prin această încercare de plată.",

    deadlineTitle:
      "Termenul de plată",

    deadlineDescription:
      "Poți încerca din nou cât timp linkul de plată și termenul rezervării sunt încă valabile.",

    reservationReference:
      "Referință rezervare",

    reservationChangeReference:
      "Referință modificare rezervare",

    notice:
      "Revino la linkul de plată primit pe email pentru a relua plata securizată.",

    back:
      "Înapoi",

    home:
      "Pagina principală",

    logoAriaLabel:
      "Mergi la pagina principală Sunshine Resort",

    romanianAriaLabel:
      "Afișează pagina în limba română",

    englishAriaLabel:
      "Display the page in English",
  },

  en: {
    eyebrow:
      "Payment cancelled",

    title:
      "No payment was processed.",

    description:
      "You left the Stripe payment page before completing the transaction. Your reservation is still awaiting payment.",

    noChargeTitle:
      "No charge",

    noChargeDescription:
      "Sunshine Resort did not collect any payment during this checkout attempt.",

    deadlineTitle:
      "Payment deadline",

    deadlineDescription:
      "You may try again while the payment link and reservation deadline remain valid.",

    reservationReference:
      "Reservation reference",

    reservationChangeReference:
      "Reservation change reference",

    notice:
      "Return to the payment link received by email to restart the secure checkout.",

    back:
      "Go back",

    home:
      "Return home",

    logoAriaLabel:
      "Go to the Sunshine Resort homepage",

    romanianAriaLabel:
      "Afișează pagina în limba română",

    englishAriaLabel:
      "Display the page in English",
  },
} as const;

function replaceLocaleInPathname(
  pathname: string,
  locale: Locale,
): string {
  if (
    /^\/(ro|en)(?=\/|$)/.test(
      pathname,
    )
  ) {
    return pathname.replace(
      /^\/(ro|en)(?=\/|$)/,
      `/${locale}`,
    );
  }

  return `/${locale}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

export default function PaymentCancelledPage() {
  const params =
    useParams<{
      locale?: string;
    }>();

  const pathname =
    usePathname();

  const searchParams =
    useSearchParams();

  const locale: Locale =
    params.locale === "en"
      ? "en"
      : "ro";

  const content =
    PAYMENT_CANCELLED_CONTENT[
      locale
    ];

  const reservationId =
    searchParams.get(
      "reservationId",
    );

  const reservationChangeId =
    searchParams.get(
      "reservationChangeId",
    );

  const reference =
    reservationChangeId ??
    reservationId;

  const referenceLabel =
    reservationChangeId
      ? content.reservationChangeReference
      : content.reservationReference;

  const queryString =
    searchParams.toString();

  function getLocaleHref(
    targetLocale: Locale,
  ): string {
    const localizedPath =
      replaceLocaleInPathname(
        pathname,
        targetLocale,
      );

    return queryString
      ? `${localizedPath}?${queryString}`
      : localizedPath;
  }

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#050505] px-6 py-20 text-[#f5f2eb] md:py-24">
      <Image
        src="/hero-mockup.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center opacity-40"
      />

      <div className="absolute inset-0 bg-black/55" />

      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-[#050505]/65 to-[#050505]/95" />

      <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/[0.02] blur-3xl" />

      <nav
        aria-label="Language selector"
        className="absolute right-6 top-6 z-20 flex items-center gap-3 sm:right-8 sm:top-8"
      >
        <Link
          href={getLocaleHref(
            "ro",
          )}
          aria-label={
            content.romanianAriaLabel
          }
          aria-current={
            locale === "ro"
              ? "page"
              : undefined
          }
          className={`text-[9px] uppercase tracking-[0.3em] transition duration-300 sm:text-[10px] ${
            locale === "ro"
              ? "text-gold"
              : "text-white/45 hover:text-white"
          }`}
        >
          RO
        </Link>

        <span className="h-4 w-px bg-white/20" />

        <Link
          href={getLocaleHref(
            "en",
          )}
          aria-label={
            content.englishAriaLabel
          }
          aria-current={
            locale === "en"
              ? "page"
              : undefined
          }
          className={`text-[9px] uppercase tracking-[0.3em] transition duration-300 sm:text-[10px] ${
            locale === "en"
              ? "text-gold"
              : "text-white/45 hover:text-white"
          }`}
        >
          EN
        </Link>
      </nav>

      <section className="relative z-10 w-full max-w-3xl text-center">
        <Link
          href={`/${locale}`}
          aria-label={
            content.logoAriaLabel
          }
          className="inline-block"
        >
          <Image
            src="/logo-sunshine.png"
            alt="Sunshine Resort"
            width={145}
            height={87}
            priority
            className="brightness-0 invert mx-auto h-auto w-[110px] opacity-85 transition-opacity duration-300 hover:opacity-100 md:w-[125px]"
          />
        </Link>

        <div className="mx-auto mt-10 flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-white/[0.03] text-white/60 md:h-[72px] md:w-[72px]">
          <X className="h-7 w-7 stroke-[1.3] md:h-8 md:w-8" />
        </div>

        <p className="mt-8 text-[9px] font-medium uppercase tracking-[0.45em] text-gold sm:text-[10px] md:text-xs">
          {content.eyebrow}
        </p>

        <h1 className="heading mx-auto mt-6 max-w-4xl text-5xl font-light leading-[1.04] tracking-[-0.015em] sm:text-6xl md:text-7xl">
          {content.title}
        </h1>

        <div className="mx-auto mt-8 h-px w-16 bg-gold/70 md:w-20" />

        <p className="mx-auto mt-8 max-w-2xl text-sm leading-8 text-white/55 sm:text-[15px] md:text-base md:leading-9">
          {content.description}
        </p>

        <div className="mx-auto mt-10 grid max-w-2xl gap-4 text-left sm:grid-cols-2">
          <article className="border border-white/10 bg-black/45 p-6 backdrop-blur-md">
            <CreditCard className="h-5 w-5 text-gold stroke-[1.4]" />

            <h2 className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-white/75">
              {content.noChargeTitle}
            </h2>

            <p className="mt-3 text-xs leading-6 text-white/35">
              {content.noChargeDescription}
            </p>
          </article>

          <article className="border border-white/10 bg-black/45 p-6 backdrop-blur-md">
            <Info className="h-5 w-5 text-gold stroke-[1.4]" />

            <h2 className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-white/75">
              {content.deadlineTitle}
            </h2>

            <p className="mt-3 text-xs leading-6 text-white/35">
              {content.deadlineDescription}
            </p>
          </article>
        </div>

        {reference && (
          <div className="mx-auto mt-6 max-w-2xl border border-white/10 bg-black/40 px-5 py-4 text-left backdrop-blur-md">
            <p className="text-[9px] uppercase tracking-[0.28em] text-white/30">
              {referenceLabel}
            </p>

            <p className="mt-2 break-all text-xs leading-6 text-white/45">
              {reference}
            </p>
          </div>
        )}

        <p className="mx-auto mt-7 max-w-2xl text-xs leading-6 text-white/30">
          {content.notice}
        </p>

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() =>
              window.history.back()
            }
            className="inline-flex min-h-14 items-center justify-center gap-3 border border-white/15 px-9 py-4 text-[9px] uppercase tracking-[0.28em] text-white/55 transition duration-500 hover:border-gold hover:text-gold sm:text-[10px]"
          >
            <ArrowLeft className="h-4 w-4" />

            {content.back}
          </button>

          <Link
            href={`/${locale}`}
            className="inline-flex min-h-14 items-center justify-center bg-gold px-10 py-4 text-[9px] font-semibold uppercase tracking-[0.3em] text-black transition duration-500 hover:bg-white sm:text-[10px]"
          >
            {content.home}
          </Link>
        </div>
      </section>
    </main>
  );
}
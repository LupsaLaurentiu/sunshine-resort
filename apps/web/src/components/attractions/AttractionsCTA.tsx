"use client";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
} from "lucide-react";

import {
  usePathname,
} from "next/navigation";

import {
  FadeIn,
} from "@/components/animations/FadeIn";

import {
  getLocaleFromPathname,
  getPublicHref,
} from "@/lib/public-routes";

const ATTRACTIONS_CTA_CONTENT = {
  ro: {
    eyebrow:
      "Sunshine Resort",

    title:
      "Întoarce-te la liniște\ndupă fiecare aventură.",

    description:
      "După o zi petrecută descoperind Maramureșul, relaxează-te într-un resort boutique adults-only, creat pentru confort, intimitate și momente fără grabă.",

    button:
      "Rezervă acum",

    imageAlt:
      "Peisaj din Maramureș în apropierea Sunshine Resort",
  },

  en: {
    eyebrow:
      "Sunshine Resort",

    title:
      "Return to silence\nafter every journey.",

    description:
      "After a day exploring Maramureș, return to an adults-only boutique resort designed for comfort, privacy and unhurried moments.",

    button:
      "Book your stay",

    imageAlt:
      "Landscape near Sunshine Resort in Maramureș",
  },
} as const;

export function AttractionsCTA() {
  const pathname =
    usePathname();

  const locale =
    getLocaleFromPathname(
      pathname,
    );

  const content =
    ATTRACTIONS_CTA_CONTENT[
      locale
    ];

  const bookingHref =
    getPublicHref(
      "book",
      locale,
    );

  return (
    <section
      aria-labelledby="attractions-cta-title"
      className="relative isolate min-h-[720px] overflow-hidden bg-[#050505] text-[#f5f2eb]"
    >
      <Image
        src="/images/ogna-sugatag-3.png"
        alt={content.imageAlt}
        fill
        sizes="100vw"
        className="object-cover object-center"
      />

      <div className="absolute inset-0 bg-black/80" />

      <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/85 via-black/25 to-[#050505]/90" />

      <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/25" />

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/[0.035] blur-3xl" />

      <div className="relative z-10 flex min-h-[720px] items-center justify-center px-6 py-32 text-center sm:px-8 md:py-40">
        <div className="mx-auto flex max-w-5xl flex-col items-center">
          <FadeIn>
            <p className="text-[9px] font-medium uppercase tracking-[0.5em] text-gold sm:text-[10px] md:text-xs">
              {content.eyebrow}
            </p>
          </FadeIn>

          <FadeIn
            delay={0.12}
            distance={46}
          >
            <h2
              id="attractions-cta-title"
              className="heading mt-8 whitespace-pre-line text-5xl font-light leading-[0.95] tracking-[-0.02em] sm:text-6xl md:text-7xl lg:text-8xl"
            >
              {content.title}
            </h2>
          </FadeIn>

          <FadeIn
            delay={0.24}
            distance={22}
          >
            <div className="mt-10 h-px w-20 bg-gold/75" />
          </FadeIn>

          <FadeIn
            delay={0.32}
            distance={24}
          >
            <p className="mt-10 max-w-2xl text-sm leading-8 text-white/70 sm:text-[15px] md:text-base md:leading-9">
              {content.description}
            </p>
          </FadeIn>

          <FadeIn
            delay={0.42}
            distance={20}
          >
            <Link
              href={bookingHref}
              className="group mt-14 inline-flex min-h-14 items-center gap-4 border border-gold bg-gold px-10 py-4 text-[9px] font-semibold uppercase tracking-[0.3em] text-black transition duration-500 hover:border-white hover:bg-white sm:px-12 sm:text-[10px]"
            >
              {content.button}

              <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
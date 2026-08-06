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

const CONTACT_CTA_CONTENT = {
  ro: {
    eyebrow:
      "Sunshine Resort",

    title:
      "Ești pregătit să încetinești ritmul?",

    description:
      "Alege perioada potrivită și rezervă un sejur adults-only creat pentru liniște, confort și momente fără grabă.",

    button:
      "Rezervă sejurul",

    imageAlt:
      "Atmosfera liniștită de la Sunshine Resort",
  },

  en: {
    eyebrow:
      "Sunshine Resort",

    title:
      "Ready to slow down?",

    description:
      "Choose your dates and reserve an adults-only stay designed for tranquillity, comfort and unhurried moments.",

    button:
      "Reserve your stay",

    imageAlt:
      "The peaceful atmosphere of Sunshine Resort",
  },
} as const;

export function ContactCTA() {
  const pathname =
    usePathname();

  const locale =
    getLocaleFromPathname(
      pathname,
    );

  const content =
    CONTACT_CTA_CONTENT[
      locale
    ];

  const bookingHref =
    getPublicHref(
      "book",
      locale,
    );

  return (
    <section
      aria-labelledby="contact-cta-title"
      className="relative isolate overflow-hidden bg-[#050505] py-40 text-[#f5f2eb] md:py-52"
    >
      <Image
        src="/hero-mockup.jpg"
        alt={content.imageAlt}
        fill
        sizes="100vw"
        className="object-cover object-center"
      />

      <div className="absolute inset-0 bg-black/85" />

      <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/90 via-black/25 to-[#050505]/95" />

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/[0.035] blur-3xl" />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 text-center">
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
            id="contact-cta-title"
            className="heading mt-8 text-5xl font-light leading-[0.97] tracking-[-0.02em] sm:text-6xl md:text-7xl lg:text-8xl"
          >
            {content.title}
          </h2>
        </FadeIn>

        <FadeIn
          delay={0.24}
          distance={22}
        >
          <div className="mt-10 h-px w-20 bg-gold/70" />
        </FadeIn>

        <FadeIn
          delay={0.32}
          distance={24}
        >
          <p className="mt-10 max-w-2xl text-sm leading-8 text-white/60 sm:text-[15px] md:text-base md:leading-9">
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
    </section>
  );
}
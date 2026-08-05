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

const RESORT_EXPERIENCE_CONTENT = {
  ro: {
    eyebrow:
      "Sunshine Resort",

    title:
      "Creat pentru intimitate, liniște și confort rafinat.",

    description:
      "Cu doar opt apartamente, Sunshine Resort oferă o atmosferă adults-only discretă și personală, în care fiecare detaliu este gândit pentru relaxare, eleganță și momente petrecute fără grabă.",

    cta:
      "Descoperă resortul",

    imageAlt:
      "Atmosfera elegantă și intimă de la Sunshine Resort",
  },

  en: {
    eyebrow:
      "Sunshine Resort",

    title:
      "Created for privacy, calm and refined comfort.",

    description:
      "With only eight apartments, Sunshine Resort offers an intimate adults-only atmosphere where every detail is designed for relaxation, elegance and moments enjoyed without hurry.",

    cta:
      "Discover the resort",

    imageAlt:
      "The elegant and intimate atmosphere of Sunshine Resort",
  },
} as const;

export function ResortExperienceSection() {
  const pathname =
    usePathname();

  const locale =
    getLocaleFromPathname(
      pathname,
    );

  const content =
    RESORT_EXPERIENCE_CONTENT[
      locale
    ];

  const aboutHref =
    getPublicHref(
      "about",
      locale,
    );

  return (
    <section
      aria-labelledby="resort-experience-title"
      className="grid min-h-screen overflow-hidden bg-[#0b0b0b] text-[#f5f2eb] lg:grid-cols-[1.08fr_0.92fr]"
    >
      <FadeIn className="relative min-h-[520px] sm:min-h-[620px] lg:min-h-screen">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/images/apps-1.jpg"
            alt={content.imageAlt}
            fill
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover object-center transition-transform duration-[1800ms] ease-out hover:scale-[1.025]"
          />

          <div className="absolute inset-0 bg-black/10" />

          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10 lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-black/20" />

          <div className="absolute bottom-8 left-8 hidden items-center gap-4 text-[8px] uppercase tracking-[0.34em] text-white/55 sm:flex lg:bottom-10 lg:left-10">
            <span className="h-px w-10 bg-gold/80" />

            <span>
              Adults Only
            </span>
          </div>
        </div>
      </FadeIn>

      <div className="relative flex items-center px-6 py-24 sm:px-10 sm:py-28 lg:px-16 lg:py-32 xl:px-20">
        <div className="pointer-events-none absolute right-0 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-gold/[0.025] blur-3xl" />

        <div className="relative max-w-xl">
          <FadeIn>
            <p className="text-[9px] font-medium uppercase tracking-[0.48em] text-gold sm:text-[10px] md:text-xs">
              {content.eyebrow}
            </p>
          </FadeIn>

          <FadeIn delay={0.12}>
            <h2
              id="resort-experience-title"
              className="heading mt-8 text-4xl font-light leading-[1.04] tracking-[-0.015em] text-[#f5f2eb] sm:text-5xl md:text-6xl lg:text-[4rem] xl:text-[4.5rem]"
            >
              {content.title}
            </h2>
          </FadeIn>

          <FadeIn delay={0.24}>
            <div className="mt-10 h-px w-16 bg-gold/70" />
          </FadeIn>

          <FadeIn delay={0.32}>
            <p className="mt-10 max-w-lg text-sm leading-8 text-white/50 sm:text-[15px] md:text-base md:leading-9">
              {content.description}
            </p>
          </FadeIn>

          <FadeIn delay={0.42}>
            <Link
              href={aboutHref}
              className="group mt-12 inline-flex min-h-12 items-center justify-center gap-4 border border-gold px-8 py-3.5 text-[9px] font-semibold uppercase tracking-[0.28em] text-gold transition duration-500 hover:bg-gold hover:text-black sm:px-10 sm:text-[10px]"
            >
              {content.cta}

              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
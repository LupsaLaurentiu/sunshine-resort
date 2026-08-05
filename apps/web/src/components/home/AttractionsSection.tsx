"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { usePathname } from "next/navigation";

import { FadeIn } from "@/components/animations/FadeIn";

import {
  getLocaleFromPathname,
  getPublicHref,
} from "@/lib/public-routes";

const ATTRACTIONS_CONTENT = {
  ro: {
    eyebrow: "Descoperă împrejurimile",
    title: "Explorează Maramureșul.",
    description:
      "Lacuri, păduri, sate tradiționale și peisaje montane se află la doar câteva minute de Sunshine Resort.",
    cta: "Descoperă atracțiile",
    imageAlt:
      "Peisaj natural din apropierea Sunshine Resort",
    imageLabel: "Natură · Tradiție · Munte",
  },

  en: {
    eyebrow: "Explore the surroundings",
    title: "Discover Maramureș.",
    description:
      "Lakes, forests, traditional villages and mountain landscapes are only minutes away from Sunshine Resort.",
    cta: "Explore attractions",
    imageAlt:
      "Natural landscape near Sunshine Resort",
    imageLabel: "Nature · Tradition · Mountains",
  },
} as const;

export function AttractionsSection() {
  const pathname =
    usePathname();

  const locale =
    getLocaleFromPathname(
      pathname,
    );

  const content =
    ATTRACTIONS_CONTENT[locale];

  const attractionsHref =
    getPublicHref(
      "attractions",
      locale,
    );

  return (
    <section
      aria-labelledby="attractions-title"
      className="grid min-h-screen overflow-hidden bg-[#0b0b0b] text-[#f5f2eb] lg:grid-cols-[0.9fr_1.1fr]"
    >
      <div className="relative flex items-center px-6 py-24 sm:px-10 sm:py-28 lg:px-16 lg:py-32 xl:px-20">
        <div className="pointer-events-none absolute left-0 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-gold/[0.025] blur-3xl" />

        <div className="relative max-w-xl">
          <FadeIn>
            <p className="text-[9px] font-medium uppercase tracking-[0.48em] text-gold sm:text-[10px] md:text-xs">
              {content.eyebrow}
            </p>
          </FadeIn>

          <FadeIn delay={0.12}>
            <h2
              id="attractions-title"
              className="heading mt-8 text-4xl font-light leading-[1.04] tracking-[-0.015em] sm:text-5xl md:text-6xl lg:text-[4rem] xl:text-[4.5rem]"
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
              href={attractionsHref}
              className="group mt-12 inline-flex min-h-12 items-center justify-center gap-4 border border-gold px-8 py-3.5 text-[9px] font-semibold uppercase tracking-[0.28em] text-gold transition duration-500 hover:bg-gold hover:text-black sm:px-10 sm:text-[10px]"
            >
              {content.cta}

              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
          </FadeIn>
        </div>
      </div>

      <FadeIn
        delay={0.18}
        className="relative min-h-[520px] sm:min-h-[620px] lg:min-h-screen"
      >
        <div className="group absolute inset-0 overflow-hidden">
          <Image
            src="/images/atractions-4.jpg"
            alt={content.imageAlt}
            fill
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover object-center transition-transform duration-[1800ms] ease-out group-hover:scale-[1.025]"
          />

          <div className="absolute inset-0 bg-black/10" />

          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10 lg:bg-gradient-to-l lg:from-transparent lg:via-transparent lg:to-black/20" />

          <div className="absolute bottom-8 right-8 flex items-center gap-4 text-[8px] uppercase tracking-[0.34em] text-white/60 lg:bottom-10 lg:right-10">
            <span>
              {content.imageLabel}
            </span>

            <span className="h-px w-10 bg-gold/80" />
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
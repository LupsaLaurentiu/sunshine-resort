"use client";

import Image from "next/image";

import {
  usePathname,
} from "next/navigation";

import {
  FadeIn,
} from "@/components/animations/FadeIn";

import {
  getLocaleFromPathname,
} from "@/lib/public-routes";

const POOL_EXPERIENCE_CONTENT = {
  ro: {
    eyebrow:
      "Experiența",

    title:
      "Liniște, căldură și apă minerală.",

    description:
      "Creată pentru dimineți fără grabă și seri liniștite, piscina oferă un ambient wellness intim, în care apa, lumina și intimitatea devin parte din experiența sejurului.",

    imageAlt:
      "Piscina interioară cu apă sărată de la Sunshine Resort",

    imageLabel:
      "Wellness · Apă sărată · Relaxare",
  },

  en: {
    eyebrow:
      "The experience",

    title:
      "Silence, warmth and mineral water.",

    description:
      "Designed for slow mornings and peaceful evenings, the pool offers an intimate wellness atmosphere where water, light and privacy become part of the stay.",

    imageAlt:
      "The indoor saltwater pool at Sunshine Resort",

    imageLabel:
      "Wellness · Saltwater · Relaxation",
  },
} as const;

export function PoolExperience() {
  const pathname =
    usePathname();

  const locale =
    getLocaleFromPathname(
      pathname,
    );

  const content =
    POOL_EXPERIENCE_CONTENT[
      locale
    ];

  return (
    <section
      aria-labelledby="pool-experience-title"
      className="grid min-h-screen overflow-hidden bg-[#0b0b0b] text-[#f5f2eb] lg:grid-cols-2"
    >
      <FadeIn className="relative min-h-[560px] sm:min-h-[640px] lg:min-h-screen">
        <div className="group absolute inset-0 overflow-hidden bg-[#111]">
          <Image
            src="/images/salt-pool.webp"
            alt={content.imageAlt}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center transition-transform duration-[1800ms] ease-out group-hover:scale-[1.025]"
          />

          <div className="absolute inset-0 bg-black/10" />

          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/5 lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-black/15" />

          <div className="absolute bottom-8 left-8 flex items-center gap-4 text-[8px] uppercase tracking-[0.34em] text-white/60 lg:bottom-10 lg:left-10">
            <span className="h-px w-10 bg-gold/80" />

            <span>
              {content.imageLabel}
            </span>
          </div>
        </div>
      </FadeIn>

      <div className="relative flex items-center px-6 py-24 sm:px-10 sm:py-28 lg:px-16 lg:py-32 xl:px-20">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/[0.025] blur-3xl" />

        <div className="relative max-w-xl">
          <FadeIn>
            <p className="text-[9px] font-medium uppercase tracking-[0.48em] text-gold sm:text-[10px] md:text-xs">
              {content.eyebrow}
            </p>
          </FadeIn>

          <FadeIn
            delay={0.12}
            distance={44}
          >
            <h2
              id="pool-experience-title"
              className="heading mt-8 text-4xl font-light leading-[1.04] tracking-[-0.015em] sm:text-5xl md:text-6xl lg:text-7xl"
            >
              {content.title}
            </h2>
          </FadeIn>

          <FadeIn
            delay={0.24}
            distance={22}
          >
            <div className="mt-10 h-px w-16 bg-gold/70" />
          </FadeIn>

          <FadeIn
            delay={0.32}
            distance={24}
          >
            <p className="mt-10 max-w-lg text-sm leading-8 text-white/55 sm:text-[15px] md:text-base md:leading-9">
              {content.description}
            </p>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
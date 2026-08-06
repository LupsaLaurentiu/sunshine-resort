"use client";

import {
  usePathname,
} from "next/navigation";

import {
  FadeIn,
} from "@/components/animations/FadeIn";

import {
  getLocaleFromPathname,
} from "@/lib/public-routes";

const ABOUT_PHILOSOPHY_CONTENT = {
  ro: {
    eyebrow:
      "Filosofia noastră",

    titleLineOne:
      "Mai puțin zgomot.",

    titleLineTwo:
      "Mai multă prezență.",

    description:
      "Credem că adevăratul confort începe acolo unde dispar distragerile. Doar opt apartamente, un concept exclusiv adults-only și spații create pentru dimineți liniștite, seri fără grabă și momente care rămân în memorie.",

    signature:
      "Adults Only · Boutique Resort",
  },

  en: {
    eyebrow:
      "Our Philosophy",

    titleLineOne:
      "Less noise.",

    titleLineTwo:
      "More presence.",

    description:
      "We believe true comfort begins where distractions end. Just eight apartments, an adults-only concept and spaces designed for calm mornings, slow evenings and meaningful moments shared together.",

    signature:
      "Adults Only · Boutique Resort",
  },
} as const;

export function AboutPhilosophy() {
  const pathname =
    usePathname();

  const locale =
    getLocaleFromPathname(
      pathname,
    );

  const content =
    ABOUT_PHILOSOPHY_CONTENT[
      locale
    ];

  return (
    <section
      aria-labelledby="about-philosophy-title"
      className="relative overflow-hidden bg-[#050505] px-6 py-32 text-center text-[#f5f2eb] sm:px-8 md:py-40 lg:py-48"
    >
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(88vw,1200px)] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/[0.03] blur-3xl" />

      <div className="relative mx-auto max-w-5xl">
        <FadeIn>
          <p className="text-[9px] font-medium uppercase tracking-[0.48em] text-gold sm:text-[10px] md:text-xs">
            {content.eyebrow}
          </p>
        </FadeIn>

        <FadeIn
          delay={0.12}
          distance={46}
        >
          <h2
            id="about-philosophy-title"
            className="heading mt-8 text-4xl font-light leading-[1.02] tracking-[-0.015em] sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl"
          >
            <span className="block">
              {
                content.titleLineOne
              }
            </span>

            <span className="mt-2 block text-white">
              {
                content.titleLineTwo
              }
            </span>
          </h2>
        </FadeIn>

        <FadeIn
          delay={0.24}
          distance={22}
        >
          <div className="mx-auto mt-10 h-px w-16 bg-gold/75 md:w-20" />
        </FadeIn>

        <FadeIn
          delay={0.32}
          distance={24}
        >
          <p className="mx-auto mt-10 max-w-2xl text-sm leading-8 text-white/55 sm:text-[15px] md:text-base md:leading-9">
            {
              content.description
            }
          </p>
        </FadeIn>

        <FadeIn
          delay={0.42}
          distance={18}
        >
          <p className="mt-10 text-[8px] uppercase tracking-[0.38em] text-white/25 sm:text-[9px]">
            {
              content.signature
            }
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
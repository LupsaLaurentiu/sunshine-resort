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

const FACILITIES_INTRO_CONTENT = {
  ro: {
    eyebrow:
      "Create pentru relaxare",

    title:
      "Fiecare detaliu este gândit pentru un sejur calm, simplu și profund confortabil.",

    description:
      "De la piscina interioară cu apă sărată până la atmosfera intimă adults-only, facilitățile Sunshine Resort sunt concepute în jurul intimității, relaxării și momentelor petrecute fără grabă în natură.",

    signature:
      "Confort · Intimitate · Stare de bine",
  },

  en: {
    eyebrow:
      "Designed for rest",

    title:
      "Every detail is created to make your stay feel calm, effortless and deeply comfortable.",

    description:
      "From the indoor saltwater pool to the intimate adults-only atmosphere, Sunshine Resort offers facilities designed around privacy, relaxation and unhurried moments in nature.",

    signature:
      "Comfort · Privacy · Wellbeing",
  },
} as const;

export function FacilitiesIntro() {
  const pathname =
    usePathname();

  const locale =
    getLocaleFromPathname(
      pathname,
    );

  const content =
    FACILITIES_INTRO_CONTENT[
      locale
    ];

  return (
    <section
      aria-labelledby="facilities-intro-title"
      className="relative overflow-hidden bg-[#050505] px-6 py-32 text-center text-[#f5f2eb] sm:px-8 md:py-40 lg:py-48"
    >
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(82vw,1100px)] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/[0.025] blur-3xl md:h-[620px] md:w-[620px]" />

      <div className="relative mx-auto max-w-6xl">
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
            id="facilities-intro-title"
            className="heading mx-auto mt-8 max-w-5xl text-4xl font-light leading-[1.06] tracking-[-0.015em] sm:text-5xl md:mt-10 md:text-6xl lg:text-7xl"
          >
            {content.title}
          </h2>
        </FadeIn>

        <FadeIn
          delay={0.24}
          distance={22}
        >
          <div className="mx-auto mt-10 h-px w-16 bg-gold/75 md:mt-12 md:w-20" />
        </FadeIn>

        <FadeIn
          delay={0.32}
          distance={24}
        >
          <p className="mx-auto mt-10 max-w-2xl text-sm leading-8 text-white/50 sm:text-[15px] md:mt-12 md:text-base md:leading-9">
            {content.description}
          </p>
        </FadeIn>

        <FadeIn
          delay={0.4}
          distance={18}
        >
          <p className="mt-10 text-[8px] uppercase tracking-[0.38em] text-white/25 sm:text-[9px] md:mt-12">
            {content.signature}
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
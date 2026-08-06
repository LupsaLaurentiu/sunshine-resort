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

const ABOUT_INTRO_CONTENT = {
  ro: {
    eyebrow:
      "Slow Luxury",

    title:
      "Unele călătorii nu sunt despre locuri noi, ci despre regăsirea propriului ritm.",

    description:
      "Așezat între natură și liniște, Sunshine Resort a fost imaginat ca un refugiu în care fiecare moment te invită să încetinești, să respiri profund și să te reconectezi cu ceea ce contează cu adevărat.",
  },

  en: {
    eyebrow:
      "Slow Luxury",

    title:
      "Some journeys are not about discovering new places, but about finding your own rhythm again.",

    description:
      "Set between nature and silence, Sunshine Resort was imagined as a retreat where every moment invites you to slow down, breathe deeply and reconnect with what truly matters.",
  },
} as const;

export function AboutIntro() {
  const pathname =
    usePathname();

  const locale =
    getLocaleFromPathname(
      pathname,
    );

  const content =
    ABOUT_INTRO_CONTENT[
      locale
    ];

  return (
    <section
      aria-labelledby="about-intro-title"
      className="relative overflow-hidden bg-[#050505] px-6 py-28 text-center text-[#f5f2eb] sm:px-8 sm:py-32 md:py-40"
    >
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(88vw,1200px)] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative mx-auto max-w-5xl">
        <FadeIn>
          <p className="text-[9px] font-medium uppercase tracking-[0.5em] text-gold sm:text-[10px] md:text-xs">
            {content.eyebrow}
          </p>
        </FadeIn>

        <FadeIn
          delay={0.12}
          distance={44}
        >
          <h2
            id="about-intro-title"
            className="heading mx-auto mt-8 text-4xl font-light leading-[1.05] tracking-[-0.015em] sm:text-5xl md:text-6xl lg:text-7xl"
          >
            {content.title}
          </h2>
        </FadeIn>

        <FadeIn
          delay={0.24}
          distance={22}
        >
          <div className="mx-auto mt-10 h-px w-16 bg-gold/70 md:w-20" />
        </FadeIn>

        <FadeIn
          delay={0.32}
          distance={24}
        >
          <p className="mx-auto mt-10 max-w-3xl text-sm leading-8 text-white/50 sm:text-[15px] md:text-base md:leading-9">
            {content.description}
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
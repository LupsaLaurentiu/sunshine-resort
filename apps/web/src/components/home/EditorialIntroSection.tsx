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

const EDITORIAL_CONTENT = {
  ro: {
    eyebrow:
      "Resort boutique adults-only",

    title:
      "Un refugiu intim, creat pentru liniște, confort și momente trăite în ritmul naturii.",

    description:
      "Sunshine Resort este dedicat adulților care caută intimitate, relaxare și o experiență premium, departe de agitația cotidiană.",

    signature:
      "Natură · Intimitate · Relaxare",
  },

  en: {
    eyebrow:
      "Adults-only boutique resort",

    title:
      "An intimate retreat created for quiet moments, comfort and life at nature’s own pace.",

    description:
      "Sunshine Resort is designed for adults seeking privacy, relaxation and a premium escape away from the noise of everyday life.",

    signature:
      "Nature · Intimacy · Relaxation",
  },
} as const;

export function EditorialIntroSection() {
  const pathname =
    usePathname();

  const locale =
    getLocaleFromPathname(
      pathname,
    );

  const content =
    EDITORIAL_CONTENT[locale];

  return (
    <section
      aria-labelledby="editorial-intro-title"
      className="relative overflow-hidden bg-[#050505] px-6 py-32 text-[#f5f2eb] sm:px-8 md:py-40 lg:py-48"
    >
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(82vw,1100px)] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/[0.025] blur-3xl md:h-[620px] md:w-[620px]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto max-w-5xl text-center">
          <FadeIn>
            <p className="text-[9px] font-medium uppercase tracking-[0.48em] text-gold sm:text-[10px] md:text-xs">
              {content.eyebrow}
            </p>
          </FadeIn>

          <FadeIn delay={0.12}>
            <h2
              id="editorial-intro-title"
              className="heading mx-auto mt-8 max-w-5xl text-4xl font-light leading-[1.06] tracking-[-0.015em] text-[#f5f2eb] sm:text-5xl md:mt-10 md:text-6xl lg:text-7xl"
            >
              {content.title}
            </h2>
          </FadeIn>

          <FadeIn delay={0.24}>
            <div className="mx-auto mt-10 h-px w-16 bg-gold/75 md:mt-12 md:w-20" />
          </FadeIn>

          <FadeIn delay={0.32}>
            <p className="mx-auto mt-10 max-w-2xl text-sm leading-8 text-white/50 sm:text-[15px] md:mt-12 md:text-base md:leading-9">
              {content.description}
            </p>
          </FadeIn>

          <FadeIn delay={0.4}>
            <p className="mt-10 text-[8px] uppercase tracking-[0.38em] text-white/25 sm:text-[9px] md:mt-12">
              {content.signature}
            </p>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
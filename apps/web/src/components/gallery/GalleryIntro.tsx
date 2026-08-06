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

const GALLERY_INTRO_CONTENT = {
  ro: {
    eyebrow:
      "Poveste vizuală",

    title:
      "O colecție de imagini care surprinde atmosfera Sunshine Resort.",

    description:
      "Lumina caldă, natura, arhitectura și detaliile atent alese definesc experiența unui resort boutique creat pentru liniște, confort și relaxare.",
  },

  en: {
    eyebrow:
      "Visual story",

    title:
      "A collection of images capturing the atmosphere of Sunshine Resort.",

    description:
      "Warm light, nature, architecture and carefully crafted details define the experience of a boutique resort designed for tranquillity, comfort and relaxation.",
  },
} as const;

export function GalleryIntro() {
  const pathname =
    usePathname();

  const locale =
    getLocaleFromPathname(
      pathname,
    );

  const content =
    GALLERY_INTRO_CONTENT[
      locale
    ];

  return (
    <section
      aria-labelledby="gallery-intro-title"
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
            id="gallery-intro-title"
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
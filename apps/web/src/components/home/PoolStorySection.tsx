"use client";

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
  ParallaxImage,
} from "@/components/animations/ParallaxImage";

import {
  getLocaleFromPathname,
  getPublicHref,
} from "@/lib/public-routes";

const POOL_CONTENT = {
  ro: {
    eyebrow:
      "Experiență wellness",

    titleLineOne:
      "Piscină interioară",

    titleLineTwo:
      "cu apă sărată",

    description:
      "Apă caldă, minerale naturale și o atmosferă liniștită, creată pentru relaxare profundă în orice anotimp.",

    cta:
      "Descoperă piscina",

    imageAlt:
      "Piscina interioară cu apă sărată de la Sunshine Resort",

    imageLabel:
      "Wellness · Relaxare · Adults Only",
  },

  en: {
    eyebrow:
      "Wellness experience",

    titleLineOne:
      "Indoor",

    titleLineTwo:
      "saltwater pool",

    description:
      "Warm water, natural minerals and a peaceful atmosphere designed for deep relaxation throughout every season.",

    cta:
      "Explore the pool",

    imageAlt:
      "The indoor saltwater pool at Sunshine Resort",

    imageLabel:
      "Wellness · Relaxation · Adults Only",
  },
} as const;

export function PoolStorySection() {
  const pathname =
    usePathname();

  const locale =
    getLocaleFromPathname(
      pathname,
    );

  const content =
    POOL_CONTENT[locale];

  const poolHref =
    getPublicHref(
      "saltWaterPool",
      locale,
    );

  return (
    <section
      aria-labelledby="pool-story-title"
      className="relative isolate min-h-[100svh] overflow-hidden bg-[#050505]"
    >
      <ParallaxImage
        src="/images/pool-salt.jpg"
        alt={content.imageAlt}
        sizes="100vw"
        speed={1.2}
        overscan={22}
      />

      <div className="absolute inset-0 bg-black/35" />

      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-black/10" />

      <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/75" />

      <div className="relative z-10 flex min-h-[100svh] items-center">
        <div className="mx-auto w-full max-w-7xl px-6 py-28 sm:px-8 md:py-32 lg:px-16">
          <div className="max-w-3xl">
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
                id="pool-story-title"
                className="heading mt-8 text-5xl font-light leading-[0.94] tracking-[-0.02em] text-white sm:text-6xl md:text-7xl lg:text-8xl"
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
              <div className="mt-10 h-px w-16 bg-gold/75 md:w-20" />
            </FadeIn>

            <FadeIn
              delay={0.32}
              distance={24}
            >
              <p className="mt-10 max-w-xl text-sm leading-8 text-white/70 sm:text-[15px] md:text-base md:leading-9">
                {content.description}
              </p>
            </FadeIn>

            <FadeIn
              delay={0.42}
              distance={18}
            >
              <Link
                href={poolHref}
                className="group mt-12 inline-flex min-h-12 items-center justify-center gap-4 border border-gold px-8 py-3.5 text-[9px] font-semibold uppercase tracking-[0.28em] text-gold transition duration-500 hover:bg-gold hover:text-black sm:px-10 sm:text-[10px]"
              >
                {content.cta}

                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" />
              </Link>
            </FadeIn>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-8 right-8 z-10 hidden items-center gap-4 text-[8px] uppercase tracking-[0.34em] text-white/40 md:flex lg:bottom-10 lg:right-12">
        <span>
          {content.imageLabel}
        </span>

        <span className="h-px w-10 bg-gold/70" />
      </div>
    </section>
  );
}
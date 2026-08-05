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

const ADULTS_ONLY_CONTENT = {
  ro: {
    eyebrow:
      "Adults Only",

    title:
      "Un mod mai liniștit de a trăi luxul.",

    description:
      "Sunshine Resort este creat exclusiv pentru adulți, oferind un refugiu intim destinat cuplurilor și oaspeților care apreciază liniștea, intimitatea și timpul petrecut împreună.",

    cta:
      "Despre Sunshine Resort",

    imageAlt:
      "Atmosfera adults only de la Sunshine Resort",

    label:
      "Exclusiv adulți",
  },

  en: {
    eyebrow:
      "Adults Only",

    title:
      "A quieter way to experience luxury.",

    description:
      "Sunshine Resort is designed exclusively for adults, offering an intimate retreat for couples and guests seeking privacy, tranquillity and meaningful time together.",

    cta:
      "About Sunshine Resort",

    imageAlt:
      "Adults-only atmosphere at Sunshine Resort",

    label:
      "Adults Only",
  },
} as const;

export function AdultsOnlyFeature() {
  const pathname =
    usePathname();

  const locale =
    getLocaleFromPathname(
      pathname,
    );

  const content =
    ADULTS_ONLY_CONTENT[
      locale
    ];

  const aboutHref =
    getPublicHref(
      "about",
      locale,
    );

  return (
    <section
      aria-labelledby="adults-only-title"
      className="bg-[#050505] px-6 py-28 text-[#f5f2eb] sm:px-8 md:py-32 lg:px-12 lg:py-40"
    >
      <div className="mx-auto grid max-w-[1380px] items-center gap-12 md:gap-16 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20 xl:gap-28">
        <FadeIn>
          <div className="max-w-xl">
            <p className="text-[9px] font-medium uppercase tracking-[0.48em] text-gold sm:text-[10px] md:text-xs">
              {content.eyebrow}
            </p>

            <h2
              id="adults-only-title"
              className="heading mt-8 text-4xl font-light leading-[1.02] tracking-[-0.015em] sm:text-5xl md:text-6xl lg:text-7xl"
            >
              {content.title}
            </h2>

            <div className="mt-8 h-px w-16 bg-gold/70" />

            <p className="mt-8 text-sm leading-8 text-white/55 sm:text-[15px] md:text-base md:leading-9">
              {content.description}
            </p>

            <Link
              href={aboutHref}
              className="group mt-10 inline-flex min-h-12 items-center gap-4 border border-gold px-8 py-3.5 text-[9px] font-semibold uppercase tracking-[0.28em] text-gold transition duration-500 hover:bg-gold hover:text-black sm:px-10 sm:text-[10px]"
            >
              {content.cta}

              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
          </div>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="group relative aspect-[4/5] overflow-hidden bg-[#111]">
            <Image
              src="/images/apps-2.jpg"
              alt={content.imageAlt}
              fill
              sizes="(max-width:1024px)100vw,50vw"
              className="object-cover object-center transition-transform duration-[1600ms] ease-out group-hover:scale-[1.035]"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/5" />

            <div className="absolute bottom-6 left-6 flex items-center gap-4 text-[8px] uppercase tracking-[0.34em] text-white/70 sm:bottom-8 sm:left-8">
              <span className="h-px w-10 bg-gold/80" />

              <span>
                {content.label}
              </span>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
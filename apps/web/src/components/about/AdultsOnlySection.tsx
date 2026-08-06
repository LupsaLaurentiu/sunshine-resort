"use client";

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
} from "@/lib/public-routes";

const ADULTS_ONLY_CONTENT = {
  ro: {
    eyebrow:
      "Adults Only",

    title:
      "Creat pentru momente mai liniștite.",

    paragraphs: [
      "Sunshine Resort nu a fost gândit ca un loc plin de agitație. A fost creat pentru dimineți fără grabă, conversații care continuă după apus și acea senzație rară că nu trebuie să fii nicăieri altundeva.",

      "Fiecare apartament oferă intimitate, spațiu generos și o atmosferă inspirată de liniștea naturii din jur. În locul spațiilor aglomerate am ales discreția. În locul programului încărcat am ales un ritm mai lent.",

      "Conceptul adults-only le oferă oaspeților libertatea de a se deconecta de rutina zilnică și de a redescoperi luxul timpului — fie că înseamnă o dimineață la piscină, un pahar de vin pe terasă sau pur și simplu priveliștea munților.",
    ],

    imageAlt:
      "Atmosfera adults-only de la Sunshine Resort",
  },

  en: {
    eyebrow:
      "Adults Only",

    title:
      "Designed for quieter moments.",

    paragraphs: [
      "Sunshine Resort was never imagined as a place filled with constant activity. It was created for slow mornings, conversations that continue after sunset and the rare feeling of having nowhere else to be.",

      "Each apartment offers privacy, generous space and an atmosphere inspired by the surrounding landscape. Instead of crowded spaces, we chose intimacy. Instead of a packed schedule, we chose a slower rhythm.",

      "Our adults-only concept gives guests the freedom to disconnect from everyday routines and rediscover the luxury of time — whether that means a morning by the pool, a glass of wine on the terrace or simply watching the mountains in silence.",
    ],

    imageAlt:
      "The adults-only atmosphere at Sunshine Resort",
  },
} as const;

export function AdultsOnlySection() {
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

  return (
    <section
      aria-labelledby="adults-only-title"
      className="grid min-h-screen overflow-hidden bg-[#050505] text-[#f5f2eb] lg:grid-cols-[1.02fr_0.98fr]"
    >
      <FadeIn className="relative min-h-[560px] sm:min-h-[680px] lg:min-h-screen">
        <div className="absolute inset-0 overflow-hidden bg-[#111]">
          <ParallaxImage
            src="/images/about-adults.jpg"
            alt={content.imageAlt}
            priority={false}
            sizes="(max-width: 1024px) 100vw, 52vw"
            speed={0.4}
            overscan={20}
          />

          <div className="absolute inset-0 bg-black/10" />

          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/5 lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-black/20" />

          <div className="absolute bottom-8 left-8 flex items-center gap-4 text-[8px] uppercase tracking-[0.34em] text-white/55 sm:bottom-10 sm:left-10">
            <span className="h-px w-10 bg-gold/80" />

            <span>
              Adults Only · Sunshine Resort
            </span>
          </div>
        </div>
      </FadeIn>

      <div className="relative flex items-center px-6 py-24 sm:px-10 sm:py-28 lg:px-16 lg:py-32 xl:px-20">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/[0.02] blur-3xl" />

        <div className="relative max-w-2xl">
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
              id="adults-only-title"
              className="heading mt-8 text-4xl font-light leading-[1.04] tracking-[-0.015em] sm:text-5xl md:text-6xl lg:text-7xl"
            >
              {content.title}
            </h2>
          </FadeIn>

          <FadeIn
            delay={0.24}
            distance={22}
          >
            <div className="mt-10 h-px w-16 bg-gold/70 md:w-20" />
          </FadeIn>

          <div className="mt-10 space-y-7">
            {content.paragraphs.map(
              (
                paragraph,
                index,
              ) => (
                <FadeIn
                  key={paragraph}
                  delay={
                    0.3 +
                    index * 0.08
                  }
                  distance={22}
                >
                  <p className="max-w-xl text-sm leading-8 text-white/55 sm:text-[15px] md:text-base md:leading-9">
                    {paragraph}
                  </p>
                </FadeIn>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
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

const SLOW_LUXURY_CONTENT = {
  ro: {
    eyebrow:
      "Arta luxului fără grabă",

    title:
      "Luxul înseamnă timpul pe care îl poți trăi în ritmul tău.",

    paragraphs: [
      "Pentru noi, luxul nu înseamnă opulență. Înseamnă dimineți liniștite, lumina care pătrunde încet în cameră și momente în care nu există nimic care să te grăbească.",

      "Am creat Sunshine Resort ca pe un refugiu boutique în care fiecare spațiu inspiră calm, iar fiecare detaliu contribuie la o experiență discretă și autentică. De la materialele naturale și designul minimalist până la liniștea împrejurimilor, totul este gândit pentru confort fără exces.",

      "Credem că cele mai memorabile experiențe nu sunt cele pline de activități, ci cele în care ai timp să privești munții, să citești câteva pagini, să savurezi un pahar de vin sau pur și simplu să nu faci nimic.",
    ],

    imageAlt:
      "Conceptul de slow luxury la Sunshine Resort",

    imageCaption:
      "Slow Luxury · Sunshine Resort",
  },

  en: {
    eyebrow:
      "The Art of Slow Luxury",

    title:
      "Luxury is the freedom to experience time at your own pace.",

    paragraphs: [
      "For us, luxury is never about excess. It is found in quiet mornings, warm light entering the room and moments that ask nothing from you except to be present.",

      "Sunshine Resort was designed as a boutique retreat where every space encourages calm and every detail contributes to an understated, authentic experience. From natural materials and minimalist interiors to the silence of the surrounding landscape, everything exists to create effortless comfort.",

      "We believe the most memorable moments are rarely the busiest ones. They are the moments spent watching the mountains, reading a few pages, sharing a glass of wine or simply enjoying the privilege of doing nothing at all.",
    ],

    imageAlt:
      "The slow luxury philosophy at Sunshine Resort",

    imageCaption:
      "The Art of Slow Luxury",
  },
} as const;

export function SlowLuxurySection() {
  const pathname =
    usePathname();

  const locale =
    getLocaleFromPathname(
      pathname,
    );

  const content =
    SLOW_LUXURY_CONTENT[
      locale
    ];

  return (
    <section
      aria-labelledby="slow-luxury-title"
      className="grid min-h-screen overflow-hidden bg-[#0b0b0b] text-[#f5f2eb] lg:grid-cols-[0.98fr_1.02fr]"
    >
      <FadeIn className="relative min-h-[560px] sm:min-h-[680px] lg:min-h-screen">
        <div className="absolute inset-0 overflow-hidden bg-[#111]">
          <ParallaxImage
            src="/images/about-slow.webp"
            alt={content.imageAlt}
            priority={false}
            sizes="(max-width: 1024px) 100vw, 49vw"
            speed={0.4}
            overscan={20}
          />

          <div className="absolute inset-0 bg-black/10" />

          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/5 lg:bg-gradient-to-r lg:from-black/10 lg:via-transparent lg:to-black/35" />

          <div className="absolute bottom-8 left-8 z-10 flex items-center gap-4 text-[8px] uppercase tracking-[0.34em] text-white/55 sm:bottom-10 sm:left-10">
            <span className="h-px w-10 bg-gold/80" />

            <span>
              {content.imageCaption}
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
              id="slow-luxury-title"
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
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

const ATTRACTIONS_GRID_CONTENT = {
  ro: {
    eyebrow:
      "Experiențe în apropiere",

    titleLineOne:
      "Locuri care merită",

    titleLineTwo:
      "descoperite.",

    attractions: [
      "Ocna Șugatag",
      "Lacurile sărate",
      "Mănăstirea Bârsana",
      "Cimitirul Vesel",
      "Mocănița",
      "Sate tradiționale",
      "Biserici de lemn",
      "Drumuri montane",
      "Pârtii de schi",
      "Trasee montane",
      "Gastronomie locală",
      "Meșteșuguri tradiționale",
    ],
  },

  en: {
    eyebrow:
      "Nearby experiences",

    titleLineOne:
      "Places worth",

    titleLineTwo:
      "discovering.",

    attractions: [
      "Ocna Șugatag",
      "Salt Lakes",
      "Bârsana Monastery",
      "Merry Cemetery",
      "Mocănița Steam Train",
      "Traditional Villages",
      "Wooden Churches",
      "Mountain Roads",
      "Ski Slopes",
      "Hiking Trails",
      "Local Cuisine",
      "Traditional Crafts",
    ],
  },
} as const;

export function AttractionsGrid() {
  const pathname =
    usePathname();

  const locale =
    getLocaleFromPathname(
      pathname,
    );

  const content =
    ATTRACTIONS_GRID_CONTENT[
      locale
    ];

  return (
    <section className="bg-[#0b0b0b] px-6 py-28 text-[#f5f2eb] sm:px-8 sm:py-32 md:py-40">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-16 text-center md:mb-20">
          <FadeIn>
            <p className="text-[9px] font-medium uppercase tracking-[0.48em] text-gold sm:text-[10px] md:text-xs">
              {content.eyebrow}
            </p>
          </FadeIn>

          <FadeIn
            delay={0.12}
            distance={44}
          >
            <h2 className="heading mt-8 text-4xl font-light leading-[1.04] tracking-[-0.015em] sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="block">
                {content.titleLineOne}
              </span>

              <span className="mt-2 block">
                {content.titleLineTwo}
              </span>
            </h2>
          </FadeIn>

          <FadeIn
            delay={0.24}
            distance={22}
          >
            <div className="mx-auto mt-10 h-px w-16 bg-gold/70 md:w-20" />
          </FadeIn>
        </div>

        <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-4">
          {content.attractions.map(
            (
              item,
              index,
            ) => (
              <FadeIn
                key={item}
                delay={
                  index * 0.04
                }
              >
                <div className="bg-[#0b0b0b] px-8 py-10 text-center text-[10px] uppercase tracking-[0.24em] text-white/60 transition duration-300 hover:text-gold">
                  {item}
                </div>
              </FadeIn>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
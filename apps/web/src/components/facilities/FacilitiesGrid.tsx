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

const FACILITIES_CONTENT = {
  ro: {
    eyebrow:
      "Facilități incluse",

    titleLineOne:
      "Tot ce ai nevoie.",

    titleLineTwo:
      "Nimic în plus.",

    facilities: [
      "Piscină interioară cu apă sărată",
      "Adults Only",
      "Parcare privată",
      "Wi-Fi gratuit",
      "Smart TV",
      "Bucătărie complet utilată",
      "Stație de cafea",
      "Bar integrat",
      "Baie premium",
      "Cadru natural liniștit",
      "Atmosferă montană",
      "Sejururi romantice",
    ],
  },

  en: {
    eyebrow:
      "Included facilities",

    titleLineOne:
      "Everything you need.",

    titleLineTwo:
      "Nothing unnecessary.",

    facilities: [
      "Indoor saltwater pool",
      "Adults Only",
      "Private parking",
      "Free Wi-Fi",
      "Smart TV",
      "Fully equipped kitchen",
      "Coffee station",
      "Built-in bar",
      "Premium bathroom",
      "Quiet natural surroundings",
      "Mountain atmosphere",
      "Romantic stays",
    ],
  },
} as const;

export function FacilitiesGrid() {
  const pathname =
    usePathname();

  const locale =
    getLocaleFromPathname(
      pathname,
    );

  const content =
    FACILITIES_CONTENT[
      locale
    ];

  return (
    <section
      aria-labelledby="facilities-grid-title"
      className="relative overflow-hidden bg-[#0b0b0b] px-6 py-32 text-[#f5f2eb] sm:px-8 md:py-40 lg:py-48"
    >
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(82vw,1100px)] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto max-w-[1240px]">
        <div className="mx-auto mb-20 max-w-4xl text-center md:mb-24">
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
              id="facilities-grid-title"
              className="heading mt-8 text-4xl font-light leading-[1.02] tracking-[-0.015em] sm:text-5xl md:text-6xl lg:text-7xl"
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
        </div>

        <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-3">
          {content.facilities.map(
            (
              item,
              index,
            ) => (
              <FadeIn
                key={item}
                delay={
                  index * 0.04
                }
                distance={18}
              >
                <div className="group flex min-h-[110px] items-center justify-center bg-[#0b0b0b] px-8 py-10 text-center transition duration-500 hover:bg-[#101010]">
                  <span className="text-[10px] uppercase tracking-[0.26em] text-white/60 transition duration-500 group-hover:text-gold">
                    {item}
                  </span>
                </div>
              </FadeIn>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
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

const ROOM_INTRO_CONTENT = {
  ro: {
    eyebrow:
      "Concepute pentru relaxare",

    title:
      "Fiecare apartament spune propria poveste.",

    description:
      "Fiecare dintre cele patru tipuri de apartamente a fost proiectat diferit, păstrând aceeași atenție pentru lumină naturală, materiale premium și confort. Indiferent de alegere, experiența rămâne una intimă, liniștită și exclusiv adults-only.",
  },

  en: {
    eyebrow:
      "Designed for relaxation",

    title:
      "Every apartment tells its own story.",

    description:
      "Each of the four apartment types has been designed with its own character while sharing the same attention to natural light, premium materials and comfort. Whichever you choose, the experience remains intimate, peaceful and exclusively adults-only.",
  },
} as const;

export function RoomIntro() {
  const pathname =
    usePathname();

  const locale =
    getLocaleFromPathname(
      pathname,
    );

  const content =
    ROOM_INTRO_CONTENT[
      locale
    ];

  return (
    <section className="bg-[#050505] px-6 py-28 text-center text-[#f5f2eb] sm:px-8 sm:py-32 md:py-40">
      <div className="mx-auto max-w-5xl">
        <FadeIn>
          <p className="text-[9px] font-medium uppercase tracking-[0.5em] text-gold sm:text-[10px] md:text-xs">
            {content.eyebrow}
          </p>
        </FadeIn>

        <FadeIn delay={0.12}>
          <h2 className="heading mt-8 text-4xl font-light leading-[1.05] tracking-[-0.015em] sm:text-5xl md:text-6xl lg:text-7xl">
            {content.title}
          </h2>
        </FadeIn>

        <FadeIn delay={0.24}>
          <div className="mx-auto mt-10 h-px w-16 bg-gold/70" />
        </FadeIn>

        <FadeIn delay={0.34}>
          <p className="mx-auto mt-10 max-w-3xl text-sm leading-8 text-white/50 sm:text-[15px] md:text-base md:leading-9">
            {content.description}
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
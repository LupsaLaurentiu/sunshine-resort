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

const CONTACT_INTRO_CONTENT = {
  ro: {
    eyebrow:
      "Suntem aproape",

    title:
      "Fie că planifici un sejur romantic sau câteva zile de liniște, suntem aici să te ajutăm.",

    description:
      "Trimite-ne un mesaj pentru întrebări despre rezervări, disponibilitate sau orice detaliu care te poate ajuta să pregătești experiența potrivită la Sunshine Resort.",
  },

  en: {
    eyebrow:
      "Reach us",

    title:
      "Whether you are planning a romantic escape or a quiet stay, we are here to help.",

    description:
      "Send us a message with any questions about reservations, availability or the details that will help you prepare the right Sunshine Resort experience.",
  },
} as const;

export function ContactIntro() {
  const pathname =
    usePathname();

  const locale =
    getLocaleFromPathname(
      pathname,
    );

  const content =
    CONTACT_INTRO_CONTENT[
      locale
    ];

  return (
    <section
      aria-labelledby="contact-intro-title"
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
            id="contact-intro-title"
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
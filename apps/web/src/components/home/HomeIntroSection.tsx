"use client";

import { usePathname } from "next/navigation";

import { FadeIn } from "@/components/animations/FadeIn";
import { getLocaleFromPathname } from "@/lib/public-routes";

const CONTENT = {
  ro: {
    eyebrow: "Experiența Sunshine",

    title:
      "Mai puține apartamente. Mai multă liniște.",

    description:
      "Cu doar opt apartamente și un concept exclusiv adults-only, Sunshine Resort oferă o experiență boutique în care intimitatea și confortul sunt întotdeauna pe primul loc.",
  },

  en: {
    eyebrow: "The Sunshine Experience",

    title:
      "Fewer apartments. More tranquillity.",

    description:
      "With only eight apartments and an adults-only concept, Sunshine Resort offers a boutique experience where privacy and comfort always come first.",
  },
} as const;

export function HomeIntroSection() {
  const pathname = usePathname();

  const locale =
    getLocaleFromPathname(pathname);

  const content = CONTENT[locale];

  return (
    <section className="bg-[#050505] px-6 py-28 text-center text-[#f5f2eb] md:py-36">
      <div className="mx-auto max-w-5xl">
        <FadeIn>
          <p className="text-[9px] font-medium uppercase tracking-[0.48em] text-gold md:text-xs">
            {content.eyebrow}
          </p>
        </FadeIn>

        <FadeIn delay={0.12}>
          <h2 className="heading mt-8 text-4xl font-light leading-[1.05] tracking-[-0.015em] md:text-6xl lg:text-7xl">
            {content.title}
          </h2>
        </FadeIn>

        <FadeIn delay={0.24}>
          <div className="mx-auto mt-10 h-px w-16 bg-gold/70" />
        </FadeIn>

        <FadeIn delay={0.32}>
          <p className="mx-auto mt-10 max-w-2xl text-sm leading-8 text-white/50 md:text-base md:leading-9">
            {content.description}
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
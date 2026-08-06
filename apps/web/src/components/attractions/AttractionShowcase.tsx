"use client";

import Image from "next/image";

import {
  usePathname,
} from "next/navigation";

import {
  FadeIn,
} from "@/components/animations/FadeIn";

import {
  getLocaleFromPathname,
} from "@/lib/public-routes";

type AttractionShowcaseProps = {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  reverse?: boolean;
};

const SHOWCASE_CONTENT = {
  ro: {
    eyebrow: "Atracție",
  },

  en: {
    eyebrow: "Attraction",
  },
} as const;

export function AttractionShowcase({
  title,
  description,
  image,
  imageAlt,
  reverse = false,
}: AttractionShowcaseProps) {
  const pathname =
    usePathname();

  const locale =
    getLocaleFromPathname(
      pathname,
    );

  const content =
    SHOWCASE_CONTENT[
      locale
    ];

  return (
    <section className="bg-[#050505] px-6 py-24 text-[#f5f2eb] sm:px-8 sm:py-28 lg:py-32">
      <div
        className={[
          "mx-auto grid max-w-[1380px] items-center gap-12",
          "md:gap-16 lg:grid-cols-2 lg:gap-20 xl:gap-28",
        ].join(" ")}
      >
        <FadeIn
          className={
            reverse
              ? "lg:order-2"
              : undefined
          }
        >
          <div className="group relative min-h-[520px] overflow-hidden bg-[#111] sm:min-h-[620px] lg:min-h-[680px]">
            <Image
              src={image}
              alt={imageAlt}
              fill
              sizes="(max-width:1024px) 100vw, 50vw"
              className="object-cover object-center transition-transform duration-[1800ms] ease-out group-hover:scale-[1.03]"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
          </div>
        </FadeIn>

        <div
          className={[
            "max-w-xl",
            reverse
              ? "lg:order-1 lg:ml-auto"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <FadeIn>
            <p className="text-[9px] uppercase tracking-[0.48em] text-gold sm:text-[10px] md:text-xs">
              {content.eyebrow}
            </p>
          </FadeIn>

          <FadeIn
            delay={0.12}
            distance={44}
          >
            <h2 className="heading mt-6 text-4xl font-light leading-[1.03] tracking-[-0.015em] sm:text-5xl md:text-6xl lg:text-7xl">
              {title}
            </h2>
          </FadeIn>

          <FadeIn
            delay={0.24}
            distance={22}
          >
            <div className="mt-8 h-px w-16 bg-gold/70" />
          </FadeIn>

          <FadeIn
            delay={0.32}
            distance={24}
          >
            <p className="mt-8 max-w-lg text-sm leading-8 text-white/55 sm:text-[15px] md:text-base md:leading-9">
              {description}
            </p>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
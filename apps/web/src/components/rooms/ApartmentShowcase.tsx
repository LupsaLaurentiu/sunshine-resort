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
} from "@/lib/public-routes";

type ApartmentShowcaseProps = {
  title: string;
  description: string;
  image: string;
  href: string;
  reverse?: boolean;
  details: string[];
};

const SHOWCASE_CONTENT = {
  ro: {
    cta:
      "Descoperă apartamentul",

    imageAriaLabel:
      "Vezi detaliile pentru",
  },

  en: {
    cta:
      "Explore apartment",

    imageAriaLabel:
      "View details for",
  },
} as const;

export function ApartmentShowcase({
  title,
  description,
  image,
  href,
  reverse = false,
  details,
}: ApartmentShowcaseProps) {
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

  const apartmentTypeLabel =
    details[0] ?? "";

  return (
    <section className="bg-[#050505] px-6 py-24 text-[#f5f2eb] sm:px-8 sm:py-28 lg:py-32">
      <div
        className={[
          "mx-auto grid max-w-[1380px] items-center gap-12",
          "md:gap-16 lg:grid-cols-2 lg:gap-12 xl:gap-16",
        ].join(" ")}
      >
        <FadeIn
          className={
            reverse
              ? "lg:order-2"
              : undefined
          }
        >
          <Link
            href={href}
            aria-label={`${content.imageAriaLabel} ${title}`}
            className="group relative block min-h-[520px] overflow-hidden bg-[#111] sm:min-h-[620px] lg:min-h-[680px]"
          >
            <Image
              src={image}
              alt={title}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center transition-transform duration-[1600ms] ease-out group-hover:scale-[1.035]"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/5" />

            <div className="absolute bottom-6 right-6 flex h-11 w-11 items-center justify-center border border-white/25 bg-black/20 text-white/75 backdrop-blur-sm transition duration-500 group-hover:border-gold group-hover:bg-gold group-hover:text-black sm:bottom-8 sm:right-8">
              <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-0.5" />
            </div>
          </Link>
        </FadeIn>

        <div
          className={[
            "w-full max-w-xl",
            reverse
              ? "lg:order-1 lg:justify-self-start lg:pr-8 xl:pr-12"
              : "lg:justify-self-start lg:pl-8 xl:pl-12",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <FadeIn>
            <p className="text-[9px] uppercase tracking-[0.45em] text-gold sm:text-[10px]">
              {
                apartmentTypeLabel
              }
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <h2 className="heading mt-6 text-4xl font-light leading-[1.03] tracking-[-0.015em] sm:text-5xl md:text-6xl lg:text-7xl">
              {title}
            </h2>
          </FadeIn>

          <FadeIn delay={0.3}>
            <p className="mt-8 max-w-lg text-sm leading-8 text-white/60 sm:text-[15px] md:text-base md:leading-9">
              {description}
            </p>
          </FadeIn>

          <FadeIn delay={0.4}>
            <div className="mt-10 grid gap-x-12 gap-y-5 border-y border-white/10 py-8 sm:grid-cols-2">
              {details.map(
                (item) => (
                  <span
                    key={item}
                    className="text-[10px] uppercase leading-6 tracking-[0.22em] text-white/55"
                  >
                    {item}
                  </span>
                ),
              )}
            </div>
          </FadeIn>

          <FadeIn delay={0.5}>
            <Link
              href={href}
              className="group mt-10 inline-flex min-h-12 items-center justify-center gap-4 border border-gold px-8 py-3.5 text-[9px] font-semibold uppercase tracking-[0.28em] text-gold transition duration-500 hover:bg-gold hover:text-black sm:px-10 sm:text-[10px]"
            >
              {content.cta}

              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
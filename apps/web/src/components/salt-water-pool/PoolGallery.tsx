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

const POOL_GALLERY_CONTENT = {
  ro: {
    eyebrow:
      "Galerie",

    title:
      "Momente de relaxare.",

    description:
      "Lumina caldă, apa liniștită și atmosfera intimă definesc experiența wellness de la Sunshine Resort.",

    images: [
      {
        src: "/images/pool-gallery-1.jpg",
        alt: "Piscina interioară cu apă sărată",
      },
      {
        src: "/images/pool-gallery-2.jpg",
        alt: "Zona de relaxare a piscinei",
      },
      {
        src: "/images/pool-gallery-3.jpg",
        alt: "Atmosfera piscinei Sunshine Resort",
      },
    ],
  },

  en: {
    eyebrow:
      "Gallery",

    title:
      "Moments of relaxation.",

    description:
      "Warm light, calm water and an intimate atmosphere define the wellness experience at Sunshine Resort.",

    images: [
      {
        src: "/images/pool-gallery-1.jpg",
        alt: "The indoor saltwater pool",
      },
      {
        src: "/images/pool-gallery-2.jpg",
        alt: "The pool relaxation area",
      },
      {
        src: "/images/pool-gallery-3.jpg",
        alt: "The atmosphere of the Sunshine Resort pool",
      },
    ],
  },
} as const;

export function PoolGallery() {
  const pathname =
    usePathname();

  const locale =
    getLocaleFromPathname(
      pathname,
    );

  const content =
    POOL_GALLERY_CONTENT[
      locale
    ];

  return (
    <section className="bg-[#0b0b0b] px-6 py-28 text-[#f5f2eb] sm:px-8 sm:py-32 md:py-40">
      <div className="mx-auto max-w-[1380px]">
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
            <p className="mx-auto mt-10 max-w-2xl text-sm leading-8 text-white/50 sm:text-[15px] md:text-base md:leading-9">
              {content.description}
            </p>
          </FadeIn>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_.8fr_.95fr]">
          {content.images.map(
            (
              image,
              index,
            ) => (
              <FadeIn
                key={image.src}
                delay={
                  index * 0.12
                }
              >
                <div
                  className={`group relative overflow-hidden ${
                    index === 0
                      ? "h-[700px]"
                      : index === 1
                        ? "mt-16 h-[520px]"
                        : "mt-6 h-[620px]"
                  }`}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover object-center transition-transform duration-[1800ms] ease-out group-hover:scale-[1.03]"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
                </div>
              </FadeIn>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
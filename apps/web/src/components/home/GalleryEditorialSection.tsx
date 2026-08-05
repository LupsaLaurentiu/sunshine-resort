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
  getPublicHref,
} from "@/lib/public-routes";

type GalleryImage = {
  src: string;
  alt: string;
  height: string;
  marginTop?: string;
};

const GALLERY_CONTENT = {
  ro: {
    eyebrow: "Galerie",

    title:
      "Momente care merită trăite.",

    description:
      "Lumină naturală, interioare elegante și peisaje care transformă fiecare sejur într-o experiență memorabilă.",

    cta:
      "Vezi galeria",

    images: [
      {
        src: "/images/atractions-1.jpg",
        alt: "Exterior Sunshine Resort",
        height: "h-[680px]",
      },

      {
        src: "/images/atractions-2.jpg",
        alt: "Atmosfera resortului",
        height: "h-[500px]",
        marginTop: "mt-14",
      },

      {
        src: "/images/atractions-3.jpg",
        alt: "Relaxare la Sunshine Resort",
        height: "h-[610px]",
        marginTop: "mt-8",
      },
    ] satisfies GalleryImage[],
  },

  en: {
    eyebrow: "Gallery",

    title:
      "Moments worth experiencing.",

    description:
      "Natural light, elegant interiors and landscapes that transform every stay into a memorable experience.",

    cta:
      "View gallery",

    images: [
      {
        src: "/images/atractions-1.jpg",
        alt: "Sunshine Resort exterior",
        height: "h-[680px]",
      },

      {
        src: "/images/atractions-2.jpg",
        alt: "Resort atmosphere",
        height: "h-[500px]",
        marginTop: "mt-14",
      },

      {
        src: "/images/atractions-3.jpg",
        alt: "Relaxation at Sunshine Resort",
        height: "h-[610px]",
        marginTop: "mt-8",
      },
    ] satisfies GalleryImage[],
  },
} as const;

export function GallerySection() {
  const pathname =
    usePathname();

  const locale =
    getLocaleFromPathname(
      pathname,
    );

  const content =
    GALLERY_CONTENT[locale];

  const galleryHref =
    getPublicHref(
      "gallery",
      locale,
    );

  return (
    <section
      aria-labelledby="gallery-title"
      className="relative overflow-hidden bg-[#050505] py-28 text-[#f5f2eb] sm:py-32 md:py-40 lg:py-48"
    >
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(88vw,1380px)] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto max-w-[1380px] px-6 sm:px-8 lg:px-12">
        <div className="mb-16 flex flex-col gap-8 md:mb-20 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <FadeIn>
              <p className="text-[9px] font-medium uppercase tracking-[0.48em] text-gold sm:text-[10px] md:text-xs">
                {content.eyebrow}
              </p>
            </FadeIn>

            <FadeIn delay={0.12}>
              <h2
                id="gallery-title"
                className="heading mt-8 text-4xl font-light leading-[1.03] tracking-[-0.015em] sm:text-5xl md:text-6xl lg:text-7xl"
              >
                {content.title}
              </h2>
            </FadeIn>

            <FadeIn delay={0.24}>
              <p className="mt-8 max-w-2xl text-sm leading-8 text-white/50 sm:text-[15px] md:text-base md:leading-9">
                {content.description}
              </p>
            </FadeIn>
          </div>

          <FadeIn delay={0.3}>
            <Link
              href={galleryHref}
              className="group inline-flex items-center gap-4 self-start text-[9px] font-semibold uppercase tracking-[0.3em] text-gold transition duration-500 hover:text-white md:self-auto"
            >
              {content.cta}

              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
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
                  className={[
                    "group relative overflow-hidden bg-[#111]",
                    image.height,
                    image.marginTop ??
                      "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(max-width:1024px) 100vw, 33vw"
                    className="object-cover object-center transition-transform duration-[1800ms] ease-out group-hover:scale-[1.04]"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/5" />

                  <div className="absolute bottom-6 left-6 text-[8px] uppercase tracking-[0.34em] text-white/60">
                    {String(
                      index + 1,
                    ).padStart(
                      2,
                      "0",
                    )}
                  </div>
                </div>
              </FadeIn>
            ),
          )}
        </div>

        <FadeIn delay={0.35}>
          <div className="mt-20 flex justify-center md:hidden">
            <Link
              href={galleryHref}
              className="group inline-flex items-center gap-4 text-[9px] font-semibold uppercase tracking-[0.3em] text-gold transition duration-500 hover:text-white"
            >
              {content.cta}

              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
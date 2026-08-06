"use client";

import Image from "next/image";

import {
  MapPin,
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

const CONTACT_LOCATION_CONTENT = {
  ro: {
    eyebrow:
      "Locație",

    titleLineOne:
      "Aproape de natură.",

    titleLineTwo:
      "Departe de agitație.",

    description:
      "Înconjurat de păduri, lacuri sărate și peisaje specifice Maramureșului, Sunshine Resort oferă cadrul potrivit pentru dimineți fără grabă, seri liniștite și momente petrecute în propriul ritm.",

    addressLabel:
      "Destinație",

    address:
      "Ocna Șugatag, Maramureș, România",

    imageAlt:
      "Peisaj natural din apropierea Sunshine Resort",

    imageCaption:
      "Ocna Șugatag · Maramureș",

    mapEyebrow:
      "Cum ajungi",

    mapTitle:
      "Descoperă locația Sunshine Resort.",

    mapDescription:
      "Folosește harta pentru a explora zona și pentru a-ți planifica traseul spre Ocna Șugatag.",

    mapTitleAttribute:
      "Harta locației Sunshine Resort din Ocna Șugatag",
  },

  en: {
    eyebrow:
      "Location",

    titleLineOne:
      "Close to nature.",

    titleLineTwo:
      "Away from the noise.",

    description:
      "Surrounded by forests, salt lakes and the distinctive landscapes of Maramureș, Sunshine Resort offers the right setting for slow mornings, quiet evenings and moments experienced at your own pace.",

    addressLabel:
      "Destination",

    address:
      "Ocna Șugatag, Maramureș, Romania",

    imageAlt:
      "Natural landscape near Sunshine Resort",

    imageCaption:
      "Ocna Șugatag · Maramureș",

    mapEyebrow:
      "Getting here",

    mapTitle:
      "Discover the Sunshine Resort location.",

    mapDescription:
      "Use the map to explore the area and plan your route to Ocna Șugatag.",

    mapTitleAttribute:
      "Map showing the Sunshine Resort location in Ocna Șugatag",
  },
} as const;

export function ContactLocation() {
  const pathname =
    usePathname();

  const locale =
    getLocaleFromPathname(
      pathname,
    );

  const content =
    CONTACT_LOCATION_CONTENT[
      locale
    ];

  return (
    <section
      aria-labelledby="contact-location-title"
      className="relative overflow-hidden bg-[#050505] py-28 text-[#f5f2eb] sm:py-32 md:py-40"
    >
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(88vw,1200px)] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto max-w-[1380px] px-6 sm:px-8">
        <div className="grid items-center gap-14 md:gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 xl:gap-24">
          <div className="max-w-xl">
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
                id="contact-location-title"
                className="heading mt-8 text-4xl font-light leading-[1.04] tracking-[-0.015em] sm:text-5xl md:text-6xl lg:text-7xl"
              >
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
              <div className="mt-10 h-px w-16 bg-gold/70 md:w-20" />
            </FadeIn>

            <FadeIn
              delay={0.32}
              distance={24}
            >
              <p className="mt-10 max-w-lg text-sm leading-8 text-white/55 sm:text-[15px] md:text-base md:leading-9">
                {content.description}
              </p>
            </FadeIn>

            <FadeIn
              delay={0.4}
              distance={20}
            >
              <div className="mt-10 flex items-start gap-5">
                <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center border border-white/10 text-gold">
                  <MapPin className="h-[18px] w-[18px] stroke-[1.35]" />
                </span>

                <span>
                  <span className="block text-[9px] uppercase tracking-[0.32em] text-gold sm:text-[10px]">
                    {content.addressLabel}
                  </span>

                  <span className="mt-2 block text-[15px] leading-7 text-white/85 sm:text-base">
                    {content.address}
                  </span>
                </span>
              </div>
            </FadeIn>
          </div>

          <FadeIn
            delay={0.2}
            distance={34}
          >
            <div className="group relative min-h-[540px] overflow-hidden bg-[#111] sm:min-h-[620px] lg:min-h-[700px]">
              <Image
                src="/images/atractions-4.jpg"
                alt={content.imageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover object-center transition-transform duration-[1800ms] ease-out group-hover:scale-[1.025]"
              />

              <div className="absolute inset-0 bg-black/10" />

              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/5" />

              <div className="absolute bottom-8 left-8 flex items-center gap-4 text-[8px] uppercase tracking-[0.34em] text-white/60 sm:bottom-10 sm:left-10">
                <span className="h-px w-10 bg-gold/80" />

                <span>
                  {content.imageCaption}
                </span>
              </div>
            </div>
          </FadeIn>
        </div>

        <div className="mt-24 md:mt-28 lg:mt-32">
          <div className="mb-12 grid gap-8 lg:grid-cols-[0.55fr_0.45fr] lg:items-end">
            <FadeIn>
              <div>
                <p className="text-[9px] font-medium uppercase tracking-[0.48em] text-gold sm:text-[10px] md:text-xs">
                  {content.mapEyebrow}
                </p>

                <h3 className="heading mt-6 max-w-3xl text-4xl font-light leading-[1.04] tracking-[-0.015em] sm:text-5xl md:text-6xl">
                  {content.mapTitle}
                </h3>
              </div>
            </FadeIn>

            <FadeIn
              delay={0.16}
              distance={24}
            >
              <p className="max-w-lg text-sm leading-8 text-white/50 sm:text-[15px] md:text-base md:leading-9 lg:ml-auto lg:text-right">
                {content.mapDescription}
              </p>
            </FadeIn>
          </div>

          <FadeIn
            delay={0.24}
            distance={30}
          >
            <div className="relative overflow-hidden border border-white/10 bg-[#0b0b0b]">
              <iframe
                src="https://www.google.com/maps?q=Ocna+Sugatag+Maramures&output=embed"
                title={content.mapTitleAttribute}
                className="h-[420px] w-full grayscale-[0.25] contrast-[0.95] sm:h-[480px] lg:h-[540px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />

              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5" />
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
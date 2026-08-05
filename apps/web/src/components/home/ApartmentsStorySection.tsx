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

type ApartmentContent = {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  detail: string;
};

const APARTMENTS_CONTENT = {
  ro: {
    eyebrow: "Cazare",

    title:
      "Doar opt apartamente.",

    description:
      "Patru tipuri de apartamente, fiecare creat pentru intimitate, liniște și confort premium într-un resort dedicat exclusiv adulților.",

    explore:
      "Descoperă apartamentul",

    viewAll:
      "Vezi toate apartamentele",

    apartments: [
      {
        title:
          "Apartament Deluxe",

        description:
          "Interioare elegante, spațiu generos și materiale atent selecționate pentru o experiență de cazare confortabilă și rafinată.",

        image:
          "/images/apps-1.jpg",

        imageAlt:
          "Interiorul elegant al unui apartament Deluxe de la Sunshine Resort",

        detail:
          "2 apartamente",
      },

      {
        title:
          "Apartament Premium",

        description:
          "Texturi naturale, lumină caldă și un ambient liniștit creează un refugiu adults-only discret și sofisticat.",

        image:
          "/images/apps-2.jpg",

        imageAlt:
          "Interiorul rafinat al unui apartament Premium de la Sunshine Resort",

        detail:
          "4 apartamente",
      },
    ] satisfies ApartmentContent[],
  },

  en: {
    eyebrow: "Accommodation",

    title:
      "Only eight apartments.",

    description:
      "Four apartment types, each created for privacy, quiet moments and premium comfort in an adults-only resort.",

    explore:
      "Explore apartment",

    viewAll:
      "View all apartments",

    apartments: [
      {
        title:
          "Deluxe Apartment",

        description:
          "Elegant interiors, generous space and carefully selected materials create a refined and deeply comfortable stay.",

        image:
          "/images/apps-1.jpg",

        imageAlt:
          "The elegant interior of a Deluxe Apartment at Sunshine Resort",

        detail:
          "2 apartments",
      },

      {
        title:
          "Premium Apartment",

        description:
          "Natural textures, warm lighting and peaceful surroundings shape a discreet and sophisticated adults-only retreat.",

        image:
          "/images/apps-2.jpg",

        imageAlt:
          "The refined interior of a Premium Apartment at Sunshine Resort",

        detail:
          "4 apartments",
      },
    ] satisfies ApartmentContent[],
  },
} as const;

export function ApartmentsSection() {
  const pathname =
    usePathname();

  const locale =
    getLocaleFromPathname(
      pathname,
    );

  const content =
    APARTMENTS_CONTENT[locale];

  const roomsHref =
    getPublicHref(
      "rooms",
      locale,
    );

  return (
    <section
      aria-labelledby="apartments-title"
      className="relative overflow-hidden bg-[#050505] pb-24 pt-28 text-[#f5f2eb] sm:pb-28 sm:pt-32 md:pb-32 md:pt-40 lg:pb-36 lg:pt-48"
    >
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(88vw,1380px)] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto max-w-[1380px] px-6 sm:px-8 lg:px-12">
        <div className="mx-auto mb-20 max-w-4xl text-center md:mb-28">
          <FadeIn>
            <p className="text-[9px] font-medium uppercase tracking-[0.48em] text-gold sm:text-[10px] md:text-xs">
              {content.eyebrow}
            </p>
          </FadeIn>

          <FadeIn delay={0.12}>
            <h2
              id="apartments-title"
              className="heading mt-8 text-4xl font-light leading-[1.02] tracking-[-0.015em] sm:text-5xl md:text-6xl lg:text-7xl"
            >
              {content.title}
            </h2>
          </FadeIn>

          <FadeIn delay={0.24}>
            <p className="mx-auto mt-8 max-w-2xl text-sm leading-8 text-white/50 sm:text-[15px] md:mt-10 md:text-base md:leading-9">
              {content.description}
            </p>
          </FadeIn>
        </div>

        <div className="space-y-28 md:space-y-36 lg:space-y-44">
          {content.apartments.map(
            (
              apartment,
              index,
            ) => {
              const imageOnRight =
                index % 2 === 1;

              return (
                <article
                  key={
                    apartment.title
                  }
                  className="grid items-center gap-12 md:gap-16 lg:grid-cols-2 lg:gap-20 xl:gap-28"
                >
                  <FadeIn
                    delay={0.08}
                    className={
                      imageOnRight
                        ? "lg:order-2"
                        : undefined
                    }
                  >
                    <div className="group relative aspect-[4/5] overflow-hidden bg-[#111]">
                      <Image
                        src={
                          apartment.image
                        }
                        alt={
                          apartment.imageAlt
                        }
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover object-center transition-transform duration-[1600ms] ease-out group-hover:scale-[1.035]"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/5" />

                      <div className="absolute bottom-6 left-6 flex items-center gap-4 text-[8px] uppercase tracking-[0.34em] text-white/70 sm:bottom-8 sm:left-8">
                        <span className="h-px w-10 bg-gold/80" />

                        <span>
                          {
                            apartment.detail
                          }
                        </span>
                      </div>

                      <div className="absolute right-5 top-5 text-[9px] uppercase tracking-[0.3em] text-white/45 sm:right-7 sm:top-7">
                        {String(
                          index + 1,
                        ).padStart(
                          2,
                          "0",
                        )}
                      </div>
                    </div>
                  </FadeIn>

                  <FadeIn
                    delay={0.2}
                    className={
                      imageOnRight
                        ? "lg:order-1"
                        : undefined
                    }
                  >
                    <div
                      className={[
                        "max-w-xl",
                        imageOnRight
                          ? "lg:ml-auto"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <p className="text-[9px] uppercase tracking-[0.4em] text-gold">
                        {
                          apartment.detail
                        }
                      </p>

                      <h3 className="heading mt-6 text-4xl font-light leading-[1.04] tracking-[-0.015em] sm:text-5xl md:text-6xl">
                        {
                          apartment.title
                        }
                      </h3>

                      <div className="mt-8 h-px w-14 bg-gold/65" />

                      <p className="mt-8 max-w-lg text-sm leading-8 text-white/50 sm:text-[15px] md:text-base md:leading-9">
                        {
                          apartment.description
                        }
                      </p>

                      <Link
                        href={roomsHref}
                        className="group mt-10 inline-flex min-h-12 items-center justify-center gap-4 border border-gold px-8 py-3.5 text-[9px] font-semibold uppercase tracking-[0.28em] text-gold transition duration-500 hover:bg-gold hover:text-black sm:px-10 sm:text-[10px]"
                      >
                        {
                          content.explore
                        }

                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </FadeIn>
                </article>
              );
            },
          )}
        </div>

        <FadeIn delay={0.1}>
          <div className="mt-20 flex justify-center md:mt-24">
            <Link
              href={roomsHref}
              className="group inline-flex items-center gap-4 text-[9px] font-semibold uppercase tracking-[0.3em] text-white/55 transition duration-500 hover:text-gold sm:text-[10px]"
            >
              {content.viewAll}

              <span className="h-px w-10 bg-white/20 transition-all duration-500 group-hover:w-16 group-hover:bg-gold" />

              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
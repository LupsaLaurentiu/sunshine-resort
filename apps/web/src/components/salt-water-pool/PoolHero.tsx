"use client";

import {
  useRef,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowDown,
} from "lucide-react";

import {
  usePathname,
} from "next/navigation";

import {
  FadeIn,
} from "@/components/animations/FadeIn";

import {
  useSmoothScroll,
} from "@/components/animations/SmoothScroll";

import {
  getLocaleFromPathname,
  getPublicHref,
} from "@/lib/public-routes";

const POOL_HERO_CONTENT = {
  ro: {
    eyebrow:
      "Piscină cu apă sărată",

    titleLineOne:
      "Piscină interioară",

    titleLineTwo:
      "cu apă sărată",

    description:
      "Un spațiu wellness creat pentru relaxare profundă, unde apa caldă, mineralele naturale și liniștea completează experiența Sunshine Resort.",

    scroll:
      "Descoperă",

    logoAriaLabel:
      "Mergi la pagina principală Sunshine Resort",

    scrollAriaLabel:
      "Descoperă piscina cu apă sărată",

    imageAlt:
      "Piscina interioară cu apă sărată de la Sunshine Resort",
  },

  en: {
    eyebrow:
      "Saltwater Pool",

    titleLineOne:
      "Indoor",

    titleLineTwo:
      "saltwater pool",

    description:
      "A wellness space designed for complete relaxation, where warm water, natural minerals and tranquillity become part of the Sunshine Resort experience.",

    scroll:
      "Explore",

    logoAriaLabel:
      "Go to the Sunshine Resort homepage",

    scrollAriaLabel:
      "Explore the indoor saltwater pool",

    imageAlt:
      "The indoor saltwater pool at Sunshine Resort",
  },
} as const;

const scrollEasing = (
  progress: number,
): number =>
  1 -
  Math.pow(
    1 - progress,
    4,
  );

export function PoolHero() {
  const pathname =
    usePathname();

  const {
    lenis,
  } = useSmoothScroll();

  const heroSectionRef =
    useRef<HTMLElement | null>(
      null,
    );

  const locale =
    getLocaleFromPathname(
      pathname,
    );

  const content =
    POOL_HERO_CONTENT[
      locale
    ];

  const homeHref =
    getPublicHref(
      "home",
      locale,
    );

  function handleScrollDown() {
    const heroSection =
      heroSectionRef.current;

    if (!heroSection) {
      return;
    }

    const nextSection =
      heroSection.nextElementSibling;

    if (
      !(
        nextSection instanceof
        HTMLElement
      )
    ) {
      return;
    }

    if (lenis) {
      lenis.scrollTo(
        nextSection,
        {
          offset:
            -window.innerHeight *
            0.16,

          duration:
            1.4,

          easing:
            scrollEasing,

          immediate:
            false,

          force:
            true,
        },
      );

      return;
    }

    const nextSectionTop =
      nextSection.getBoundingClientRect()
        .top +
      window.scrollY;

    window.scrollTo({
      top:
        nextSectionTop -
        window.innerHeight *
          0.16,

      behavior:
        "smooth",
    });
  }

  return (
    <section
      ref={heroSectionRef}
      aria-labelledby="pool-hero-title"
      className="relative isolate min-h-[100svh] overflow-hidden bg-[#050505] text-white"
    >
      <Image
        src="/images/pool-salt.jpg"
        alt={content.imageAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      <div className="absolute inset-0 bg-black/35" />

      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/85" />

      <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/15" />

      <Link
        href={homeHref}
        aria-label={
          content.logoAriaLabel
        }
        className="absolute left-1/2 top-7 z-20 -translate-x-1/2 md:top-8"
      >
        <Image
          src="/logo-sunshine.png"
          alt="Sunshine Resort"
          width={190}
          height={125}
          priority
          style={{
            width:
              "180px",
            height:
              "auto",
          }}
          className="transition-opacity duration-300 hover:opacity-80"
        />
      </Link>

      <div className="relative z-10 flex min-h-[100svh] items-center justify-center px-6 pb-28 pt-36 text-center sm:px-8 md:pb-32 md:pt-40">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center">
          <FadeIn delay={0.08}>
            <p className="text-[9px] font-medium uppercase tracking-[0.52em] text-gold sm:text-[10px] md:text-xs">
              {
                content.eyebrow
              }
            </p>
          </FadeIn>

          <FadeIn
            delay={0.18}
            distance={48}
          >
            <h1
              id="pool-hero-title"
              className="heading mt-8 max-w-5xl text-5xl font-light leading-[0.94] tracking-[-0.015em] sm:text-6xl md:text-7xl lg:text-8xl xl:text-[6.5rem]"
            >
              <span className="block">
                {
                  content.titleLineOne
                }
              </span>

              <span className="mt-2 block">
                {
                  content.titleLineTwo
                }
              </span>
            </h1>
          </FadeIn>

          <FadeIn
            delay={0.3}
            distance={22}
          >
            <div className="mt-9 h-px w-16 bg-gold/80 md:w-20" />
          </FadeIn>

          <FadeIn
            delay={0.36}
            distance={24}
          >
            <p className="mx-auto mt-9 max-w-2xl text-sm leading-8 text-white/65 sm:text-[15px] md:text-base md:leading-9">
              {
                content.description
              }
            </p>
          </FadeIn>
        </div>
      </div>

      <button
        type="button"
        onClick={
          handleScrollDown
        }
        aria-label={
          content.scrollAriaLabel
        }
        className="group absolute bottom-7 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center text-white/55 transition duration-300 hover:text-gold md:bottom-9"
      >
        <span className="text-[8px] uppercase tracking-[0.4em] md:text-[9px]">
          {
            content.scroll
          }
        </span>

        <span className="mt-3 flex h-10 w-6 items-start justify-center overflow-hidden">
          <ArrowDown className="h-4 w-4 animate-[hero-scroll-arrow_1.8s_ease-in-out_infinite] stroke-[1.25]" />
        </span>
      </button>
    </section>
  );
}
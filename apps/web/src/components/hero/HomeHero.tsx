"use client";

import {
  useRef,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowDown,
  ArrowRight,
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

const HERO_CONTENT = {
  ro: {
    eyebrow: "Adults Only",
    title: "Sunshine Resort",
    subtitle:
      "Un refugiu boutique în mijlocul naturii",
    explore:
      "Descoperă resortul",
    book:
      "Rezervă sejurul",
    scroll:
      "Descoperă",
    logoAriaLabel:
      "Mergi la pagina principală Sunshine Resort",
    scrollAriaLabel:
      "Descoperă următoarea secțiune",
  },

  en: {
    eyebrow: "Adults Only",
    title: "Sunshine Resort",
    subtitle:
      "A boutique retreat surrounded by nature",
    explore:
      "Explore the resort",
    book:
      "Book your stay",
    scroll:
      "Explore",
    logoAriaLabel:
      "Go to the Sunshine Resort homepage",
    scrollAriaLabel:
      "Explore the next section",
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

export function HomeHero() {
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
    HERO_CONTENT[locale];

  const homeHref =
    getPublicHref(
      "home",
      locale,
    );

  const aboutHref =
    getPublicHref(
      "about",
      locale,
    );

  const bookingHref =
    getPublicHref(
      "book",
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
      !(nextSection instanceof HTMLElement)
    ) {
      return;
    }

    if (lenis) {
      lenis.scrollTo(
        nextSection,
        {
          /*
           * Păstrăm o parte mică din hero vizibilă,
           * în loc să lipim secțiunea următoare
           * de marginea de sus.
           */
          offset:
            -window.innerHeight *
            0.18,

          duration: 1.4,
          easing:
            scrollEasing,

          immediate: false,
          force: true,
        },
      );

      return;
    }

    /*
     * Fallback pentru intervalul foarte scurt
     * înainte ca Lenis să fie inițializat.
     */
    const sectionTop =
      nextSection.getBoundingClientRect()
        .top +
      window.scrollY;

    window.scrollTo({
      top:
        sectionTop -
        window.innerHeight *
          0.18,

      left: 0,
      behavior: "smooth",
    });
  }

  return (
    <section
      ref={heroSectionRef}
      aria-labelledby="home-hero-title"
      className="relative isolate min-h-[100svh] w-full overflow-hidden bg-[#050505]"
    >
      <Image
        src="/hero-mockup.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      <div className="absolute inset-0 bg-black/20" />

      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/20 to-black/80" />

      <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/15" />

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
            width: "180px",
            height: "auto",
          }}
          className="transition-opacity duration-300 hover:opacity-80"
        />
      </Link>

      <div className="relative z-10 flex min-h-[100svh] items-center justify-center px-6 pb-24 pt-36 text-center text-white md:px-10 md:pb-28 md:pt-40">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center">
          <FadeIn delay={0.08}>
            <p className="mb-7 text-[10px] font-medium uppercase tracking-[0.55em] text-gold sm:text-xs md:mb-8 md:text-sm">
              {content.eyebrow}
            </p>
          </FadeIn>

          <FadeIn delay={0.18}>
            <h1
              id="home-hero-title"
              className="heading max-w-6xl text-5xl font-light leading-[0.92] tracking-[0.035em] text-white sm:text-6xl md:text-7xl lg:text-8xl xl:text-[7.25rem]"
            >
              {content.title}
            </h1>
          </FadeIn>

          <FadeIn delay={0.3}>
            <p className="mt-7 max-w-2xl text-[10px] uppercase leading-7 tracking-[0.34em] text-white/75 sm:text-xs md:mt-9 md:text-sm md:tracking-[0.38em]">
              {content.subtitle}
            </p>
          </FadeIn>

          <FadeIn delay={0.42}>
            <div className="mt-10 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row md:mt-12">
              <Link
                href={aboutHref}
                className="group inline-flex min-h-12 w-full min-w-[210px] items-center justify-center gap-3 border border-white/50 bg-black/10 px-8 py-3.5 text-[10px] font-semibold uppercase tracking-[0.27em] text-white backdrop-blur-sm transition duration-500 hover:border-gold hover:bg-gold hover:text-black sm:w-auto"
              >
                {content.explore}

                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" />
              </Link>

              <Link
                href={bookingHref}
                className="group inline-flex min-h-12 w-full min-w-[210px] items-center justify-center gap-3 border border-gold bg-gold px-8 py-3.5 text-[10px] font-semibold uppercase tracking-[0.27em] text-black transition duration-500 hover:border-white hover:bg-white sm:w-auto"
              >
                {content.book}

                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" />
              </Link>
            </div>
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
        className="group absolute bottom-7 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center text-white/65 transition hover:text-gold md:bottom-9"
      >
        <span className="text-[8px] uppercase tracking-[0.4em] md:text-[9px]">
          {content.scroll}
        </span>

        <span className="mt-3 flex h-10 w-6 items-start justify-center overflow-hidden">
          <ArrowDown className="h-4 w-4 animate-[hero-scroll-arrow_1.8s_ease-in-out_infinite] stroke-[1.25]" />
        </span>
      </button>
    </section>
  );
}
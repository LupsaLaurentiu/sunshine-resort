"use client";

import Image from "next/image";
import Link from "next/link";

import { ArrowRight } from "lucide-react";
import { usePathname } from "next/navigation";

import { FadeIn } from "@/components/animations/FadeIn";

import {
  getLocaleFromPathname,
  getPublicHref,
} from "@/lib/public-routes";

const GALLERY_CTA_CONTENT = {
  ro: {
    eyebrow: "Sunshine Resort",

    titleLineOne: "Trăiește",

    titleLineTwo: "experiența.",

    description:
      "Fotografiile surprind doar o parte din atmosfera Sunshine Resort. Restul începe în momentul în care ajungi aici.",

    button: "Rezervă sejurul",

    signature:
      "Adults Only · Boutique Resort",
  },

  en: {
    eyebrow: "Sunshine Resort",

    titleLineOne: "Experience it",

    titleLineTwo: "for yourself.",

    description:
      "Photography captures only part of the atmosphere. The rest begins the moment you arrive at Sunshine Resort.",

    button: "Reserve your stay",

    signature:
      "Adults Only · Boutique Resort",
  },
} as const;

export function GalleryCTA() {
  const pathname = usePathname();

  const locale =
    getLocaleFromPathname(pathname);

  const content =
    GALLERY_CTA_CONTENT[locale];

  const bookingHref =
    getPublicHref("book", locale);

  return (
    <section className="relative isolate overflow-hidden bg-[#050505] py-40 text-[#f5f2eb] md:py-52">
      <Image
        src="/hero-mockup.jpg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-center opacity-20"
      />

      <div className="absolute inset-0 bg-black/65" />

      <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]" />

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/[0.035] blur-3xl" />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 text-center">
        <FadeIn>
          <p className="text-[9px] uppercase tracking-[0.5em] text-gold md:text-xs">
            {content.eyebrow}
          </p>
        </FadeIn>

        <FadeIn delay={0.12}>
          <h2 className="heading mt-8 text-5xl font-light leading-[0.95] tracking-[-0.02em] md:text-7xl lg:text-8xl">
            <span className="block">
              {content.titleLineOne}
            </span>

            <span className="mt-2 block">
              {content.titleLineTwo}
            </span>
          </h2>
        </FadeIn>

        <FadeIn delay={0.24}>
          <div className="mt-10 h-px w-20 bg-gold/70" />
        </FadeIn>

        <FadeIn delay={0.32}>
          <p className="mt-10 max-w-2xl text-sm leading-8 text-white/60 md:text-base md:leading-9">
            {content.description}
          </p>
        </FadeIn>

        <FadeIn delay={0.42}>
          <Link
            href={bookingHref}
            className="group mt-14 inline-flex min-h-14 items-center gap-4 border border-gold bg-gold px-12 py-4 text-[10px] font-semibold uppercase tracking-[0.32em] text-black transition duration-500 hover:border-white hover:bg-white"
          >
            {content.button}

            <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
          </Link>
        </FadeIn>

        <FadeIn delay={0.52}>
          <p className="mt-10 text-[8px] uppercase tracking-[0.38em] text-white/25 md:text-[9px]">
            {content.signature}
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
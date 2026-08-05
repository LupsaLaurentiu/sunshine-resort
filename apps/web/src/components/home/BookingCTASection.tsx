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

const CTA_CONTENT = {
  ro: {
    eyebrow: "Sunshine Resort",

    title: "Următorul tău refugiu\nîncepe aici.",

    description:
      "Rezervă direct pe site și bucură-te de o experiență adults-only într-un resort boutique creat pentru liniște, confort și relaxare.",

    button: "Rezervă acum",
  },

  en: {
    eyebrow: "Sunshine Resort",

    title: "Your next\nescape starts here.",

    description:
      "Book directly on our website and enjoy an adults-only boutique experience designed for privacy, comfort and relaxation.",

    button: "Book your stay",
  },
} as const;

export function BookingCTASection() {
  const pathname = usePathname();

  const locale =
    getLocaleFromPathname(pathname);

  const content = CTA_CONTENT[locale];

  const bookingHref = getPublicHref(
    "book",
    locale,
  );

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
          <h2 className="heading mt-8 whitespace-pre-line text-5xl font-light leading-[0.95] tracking-[-0.02em] md:text-7xl lg:text-8xl">
            {content.title}
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
      </div>
    </section>
  );
}
"use client";

import {
  Mail,
  MapPin,
  Phone,
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

import {
  ContactForm,
} from "./ContactForm";

const CONTACT_DETAILS_CONTENT = {
  ro: {
    eyebrow:
      "Detalii de contact",

    title:
      "Hai să planificăm sejurul tău.",

    description:
      "Pentru rezervări, disponibilitate sau alte întrebări, ne poți contacta direct ori ne poți scrie prin formular.",

    emailLabel:
      "Email",

    email:
      "contact@sunshineresort.ro",

    phoneLabel:
      "Telefon",

    phone:
      "+40 700 000 000",

    phoneHref:
      "+40700000000",

    locationLabel:
      "Locație",

    location:
      "Ocna Șugatag, Maramureș, România",

    responseNote:
      "Răspundem solicitărilor în cel mai scurt timp posibil.",
  },

  en: {
    eyebrow:
      "Contact details",

    title:
      "Let us plan your stay.",

    description:
      "For reservations, availability or any other questions, contact us directly or send us a message using the form.",

    emailLabel:
      "Email",

    email:
      "contact@sunshineresort.ro",

    phoneLabel:
      "Phone",

    phone:
      "+40 700 000 000",

    phoneHref:
      "+40700000000",

    locationLabel:
      "Location",

    location:
      "Ocna Șugatag, Maramureș, Romania",

    responseNote:
      "We respond to enquiries as soon as possible.",
  },
} as const;

export function ContactDetails() {
  const pathname =
    usePathname();

  const locale =
    getLocaleFromPathname(
      pathname,
    );

  const content =
    CONTACT_DETAILS_CONTENT[
      locale
    ];

  return (
    <section
      aria-labelledby="contact-details-title"
      className="relative overflow-hidden bg-[#0b0b0b] px-6 py-28 text-[#f5f2eb] sm:px-8 sm:py-32 md:py-36 lg:py-40"
    >
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(88vw,1200px)] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto grid max-w-[1300px] gap-16 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14 xl:gap-20">
        <div className="max-w-xl">
          <FadeIn>
            <p className="text-[9px] font-medium uppercase tracking-[0.48em] text-gold sm:text-[10px] md:text-xs">
              {content.eyebrow}
            </p>
          </FadeIn>

          <FadeIn
            delay={0.12}
            distance={42}
          >
            <h2
              id="contact-details-title"
              className="heading mt-8 max-w-lg text-4xl font-light leading-[1.04] tracking-[-0.015em] sm:text-5xl md:text-[3.75rem] lg:text-[4.25rem]"
            >
              {content.title}
            </h2>
          </FadeIn>

          <FadeIn
            delay={0.24}
            distance={20}
          >
            <div className="mt-9 h-px w-16 bg-gold/70 md:w-20" />
          </FadeIn>

          <FadeIn
            delay={0.3}
            distance={22}
          >
            <p className="mt-9 max-w-lg text-sm leading-8 text-white/55 sm:text-[15px] md:text-base md:leading-9">
              {content.description}
            </p>
          </FadeIn>

          <div className="mt-11 space-y-7">
            <FadeIn
              delay={0.36}
              distance={18}
            >
              <a
                href={`mailto:${content.email}`}
                className="group flex items-start gap-5"
              >
                <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center border border-white/10 text-gold transition duration-300 group-hover:border-gold/60 group-hover:bg-gold/[0.04]">
                  <Mail className="h-[18px] w-[18px] stroke-[1.35]" />
                </span>

                <span>
                  <span className="block text-[9px] uppercase tracking-[0.32em] text-gold sm:text-[10px]">
                    {content.emailLabel}
                  </span>

                  <span className="mt-2 block text-[15px] text-white/85 transition duration-300 group-hover:text-white sm:text-base">
                    {content.email}
                  </span>
                </span>
              </a>
            </FadeIn>

            <FadeIn
              delay={0.42}
              distance={18}
            >
              <a
                href={`tel:${content.phoneHref}`}
                className="group flex items-start gap-5"
              >
                <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center border border-white/10 text-gold transition duration-300 group-hover:border-gold/60 group-hover:bg-gold/[0.04]">
                  <Phone className="h-[18px] w-[18px] stroke-[1.35]" />
                </span>

                <span>
                  <span className="block text-[9px] uppercase tracking-[0.32em] text-gold sm:text-[10px]">
                    {content.phoneLabel}
                  </span>

                  <span className="mt-2 block text-[15px] text-white/85 transition duration-300 group-hover:text-white sm:text-base">
                    {content.phone}
                  </span>
                </span>
              </a>
            </FadeIn>

            <FadeIn
              delay={0.48}
              distance={18}
            >
              <div className="flex items-start gap-5">
                <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center border border-white/10 text-gold">
                  <MapPin className="h-[18px] w-[18px] stroke-[1.35]" />
                </span>

                <span>
                  <span className="block text-[9px] uppercase tracking-[0.32em] text-gold sm:text-[10px]">
                    {content.locationLabel}
                  </span>

                  <span className="mt-2 block text-[15px] leading-7 text-white/85 sm:text-base">
                    {content.location}
                  </span>
                </span>
              </div>
            </FadeIn>
          </div>

          <FadeIn
            delay={0.54}
            distance={16}
          >
            <p className="mt-10 max-w-md text-[11px] leading-7 text-white/35">
              {content.responseNote}
            </p>
          </FadeIn>
        </div>

        <FadeIn
          delay={0.2}
          distance={30}
          className="lg:pt-1"
        >
          <ContactForm />
        </FadeIn>
      </div>
    </section>
  );
}
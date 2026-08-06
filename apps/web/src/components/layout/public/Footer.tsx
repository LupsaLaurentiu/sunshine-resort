"use client";

import Image from "next/image";
import Link from "next/link";

import {
  usePathname,
} from "next/navigation";

import {
  getLocaleFromPathname,
} from "@/lib/public-routes";

const FOOTER_CONTENT = {
  ro: {
    description:
      "Resort boutique adults-only, creat pentru relaxare, romantism și confort premium în mijlocul naturii.",

    resortTitle:
      "Resort",

    resortLinks: [
      {
        label:
          "Camere",

        href:
          "/ro/rooms",
      },

      {
        label:
          "Facilități",

        href:
          "/ro/facilities",
      },

      {
        label:
          "Piscină cu apă sărată",

        href:
          "/ro/salt-water-pool",
      },

      {
        label:
          "Galerie",

        href:
          "/ro/gallery",
      },
    ],

    infoTitle:
      "Informații",

    infoLinks: [
      {
        label:
          "Despre noi",

        href:
          "/ro/about",
      },

      {
        label:
          "Atracții turistice",

        href:
          "/ro/attractions",
      },

      {
        label:
          "Contact",

        href:
          "/ro/contact",
      },

      {
        label:
          "Rezervă acum",

        href:
          "/ro/book",
      },
    ],

    legalTitle:
      "Legal",

    legalLinks: [
      {
        label:
          "GDPR",

        href:
          "/ro/gdpr",
      },

      {
        label:
          "Termeni și condiții",

        href:
          "/ro/terms",
      },
    ],

    adultsOnly:
      "Adults Only",

    logoAriaLabel:
      "Mergi la pagina principală Sunshine Resort",
  },

  en: {
    description:
      "An adults-only boutique resort created for relaxation, romance and premium comfort surrounded by nature.",

    resortTitle:
      "Resort",

    resortLinks: [
      {
        label:
          "Apartments",

        href:
          "/en/rooms",
      },

      {
        label:
          "Facilities",

        href:
          "/en/facilities",
      },

      {
        label:
          "Saltwater pool",

        href:
          "/en/salt-water-pool",
      },

      {
        label:
          "Gallery",

        href:
          "/en/gallery",
      },
    ],

    infoTitle:
      "Information",

    infoLinks: [
      {
        label:
          "About us",

        href:
          "/en/about",
      },

      {
        label:
          "Local attractions",

        href:
          "/en/attractions",
      },

      {
        label:
          "Contact",

        href:
          "/en/contact",
      },

      {
        label:
          "Book now",

        href:
          "/en/book",
      },
    ],

    legalTitle:
      "Legal",

    legalLinks: [
      {
        label:
          "Privacy policy",

        href:
          "/en/gdpr",
      },

      {
        label:
          "Terms and conditions",

        href:
          "/en/terms",
      },
    ],

    adultsOnly:
      "Adults Only",

    logoAriaLabel:
      "Go to the Sunshine Resort homepage",
  },
} as const;

export function Footer() {
  const pathname =
    usePathname();

  const locale =
    getLocaleFromPathname(
      pathname,
    );

  const content =
    FOOTER_CONTENT[
      locale
    ];

  const homeHref =
    `/${locale}`;

  const currentYear =
    new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-[#050505] px-6 py-16 text-[#f5f0e8] sm:px-8 md:py-20">
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(90vw,1280px)] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-2 lg:grid-cols-[1.35fr_0.85fr_0.85fr_0.85fr] lg:gap-10">
        <div>
          <Link
            href={homeHref}
            aria-label={
              content.logoAriaLabel
            }
            className="inline-block"
          >
            <Image
              src="/logo-sunshine.png"
              alt="Sunshine Resort"
              width={220}
              height={120}
              className="mb-6 h-auto w-[180px] brightness-0 invert transition-opacity duration-300 hover:opacity-80"
            />
          </Link>

          <p className="max-w-sm text-sm leading-7 text-white/50 sm:text-[15px]">
            {content.description}
          </p>
        </div>

        <FooterColumn
          title={
            content.resortTitle
          }
          links={
            content.resortLinks
          }
        />

        <FooterColumn
          title={
            content.infoTitle
          }
          links={
            content.infoLinks
          }
        />

        <FooterColumn
          title={
            content.legalTitle
          }
          links={
            content.legalLinks
          }
        />
      </div>

      <div className="mx-auto mt-14 flex max-w-7xl flex-col gap-4 border-t border-white/10 pt-6 text-[9px] uppercase tracking-[0.25em] text-white/35 sm:flex-row sm:items-center sm:justify-between sm:text-[10px]">
        <span>
          © {currentYear} Sunshine Resort
        </span>

        <span>
          {content.adultsOnly}
        </span>
      </div>
    </footer>
  );
}

type FooterColumnProps = {
  title: string;

  links: readonly {
    label: string;
    href: string;
  }[];
};

function FooterColumn({
  title,
  links,
}: FooterColumnProps) {
  return (
    <div>
      <h3 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
        {title}
      </h3>

      <ul className="space-y-3">
        {links.map(
          (
            link,
          ) => (
            <li
              key={
                link.href
              }
            >
              <Link
                href={
                  link.href
                }
                className="text-sm text-white/50 transition duration-300 hover:text-gold"
              >
                {
                  link.label
                }
              </Link>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}
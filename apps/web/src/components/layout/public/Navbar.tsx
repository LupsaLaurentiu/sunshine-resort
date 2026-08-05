"use client";

import {
  useState,
} from "react";

import Link from "next/link";
import {
  Menu,
} from "lucide-react";
import {
  usePathname,
} from "next/navigation";

import {
  getEquivalentLocaleHref,
  getLocaleFromPathname,
  getPublicHref,
} from "@/lib/public-routes";

import {
  MobileMenu,
} from "./MobileMenu";

export function Navbar() {
  const pathname =
    usePathname();

  const [
    isMenuOpen,
    setIsMenuOpen,
  ] = useState(false);

  const locale =
    getLocaleFromPathname(
      pathname,
    );

  const roHref =
    getEquivalentLocaleHref(
      pathname,
      "ro",
    );

  const enHref =
    getEquivalentLocaleHref(
      pathname,
      "en",
    );

  const bookingHref =
    getPublicHref(
      "book",
      locale,
    );

  return (
    <>
      <header className="fixed left-0 top-0 z-[300] w-full px-8 py-7 text-white">
        <div className="relative flex items-center justify-between">
          <button
            type="button"
            onClick={() =>
              setIsMenuOpen(true)
            }
            aria-label={
              locale === "ro"
                ? "Deschide meniul"
                : "Open menu"
            }
            className="relative z-[301] flex h-10 w-10 items-center justify-center"
          >
            <Menu className="h-8 w-8 stroke-[1.4]" />
          </button>

          <div className="flex items-center gap-6 text-xs uppercase tracking-[0.3em]">
            <div className="flex items-center gap-2">
              <Link
                href={roHref}
                scroll={false}
                aria-current={
                  locale === "ro"
                    ? "page"
                    : undefined
                }
                className={
                  locale === "ro"
                    ? "text-gold"
                    : "text-white/70 transition hover:text-gold"
                }
              >
                RO
              </Link>

              <span className="text-white/40">
                /
              </span>

              <Link
                href={enHref}
                scroll={false}
                aria-current={
                  locale === "en"
                    ? "page"
                    : undefined
                }
                className={
                  locale === "en"
                    ? "text-gold"
                    : "text-white/70 transition hover:text-gold"
                }
              >
                EN
              </Link>
            </div>

            <span className="h-5 w-px bg-white/40" />

            <Link
              href={bookingHref}
              className="text-gold transition hover:text-white"
            >
              {locale === "ro"
                ? "Rezervă"
                : "Book"}
            </Link>
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() =>
          setIsMenuOpen(false)
        }
      />
    </>
  );
}
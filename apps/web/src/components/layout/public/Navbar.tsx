"use client";
import {
  useState,
  useEffect,
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
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const locale = getLocaleFromPathname(pathname);
  const roHref = getEquivalentLocaleHref(pathname, "ro");
  const enHref = getEquivalentLocaleHref(pathname, "en");
  const bookingHref = getPublicHref("book", locale);

  return (
    <>
      {/* Hamburger — element separat, mereu vizibil pe mobil/tabletă, indiferent de scroll */}
      <button
        type="button"
        onClick={() => setIsMenuOpen(true)}
        aria-label={locale === "ro" ? "Deschide meniul" : "Open menu"}
        className="fixed left-5 top-4 z-[301] flex h-10 w-10 items-center justify-center text-white lg:hidden"
      >
        <Menu className="h-8 w-8 stroke-[1.4]" />
      </button>

      <header
        className={`
          fixed left-0 top-0 z-[300] w-full
          border-b border-white/[0.06]
          bg-black/55
          px-5 py-4
          text-white
          backdrop-blur-xl
          backdrop-saturate-150
          transition-all duration-300
          lg:border-b-0
          lg:bg-transparent
          lg:px-8
          lg:py-7
          lg:backdrop-blur-none
          lg:backdrop-saturate-100
          lg:translate-y-0 lg:opacity-100
          ${isScrolled ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}
        `}
      >
        <div className="relative flex items-center justify-between">
          {/* Hamburger duplicat, dar vizibil DOAR pe desktop, ca parte firească din header */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            aria-label={locale === "ro" ? "Deschide meniul" : "Open menu"}
            className="relative z-[301] hidden h-10 w-10 items-center justify-center lg:flex"
          >
            <Menu className="h-8 w-8 stroke-[1.4]" />
          </button>

          {/* spacer, ca să păstreze layout-ul RO/EN + Rezervă aliniat, pe mobil unde hamburgerul e separat */}
          <div className="h-10 w-10 lg:hidden" />

          <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.28em] sm:gap-5 sm:text-xs md:gap-6 md:tracking-[0.3em]">
            <div className="flex items-center gap-2">
              <Link
                href={roHref}
                scroll={false}
                aria-current={locale === "ro" ? "page" : undefined}
                className={
                  locale === "ro"
                    ? "text-gold"
                    : "text-white/70 transition hover:text-gold"
                }
              >
                RO
              </Link>
              <span className="text-white/40">/</span>
              <Link
                href={enHref}
                scroll={false}
                aria-current={locale === "en" ? "page" : undefined}
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
              {locale === "ro" ? "Rezervă" : "Book"}
            </Link>
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
    </>
  );
}
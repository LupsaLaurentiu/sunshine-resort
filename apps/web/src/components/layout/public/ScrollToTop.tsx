"use client";

import {
  useEffect,
  useRef,
} from "react";

import {
  usePathname,
} from "next/navigation";

import {
  useSmoothScroll,
} from "@/components/animations/SmoothScroll";

function normalizePath(
  pathname: string,
): string {
  const segments =
    pathname
      .split("/")
      .filter(Boolean);

  const locale =
    segments[0];

  if (
    locale === "ro" ||
    locale === "en"
  ) {
    segments.shift();
  }

  return `/${segments.join("/")}`;
}

export function ScrollToTop() {
  const pathname =
    usePathname();

  const {
    lenis,
  } = useSmoothScroll();

  const previousPathnameRef =
    useRef(pathname);

  useEffect(() => {
    if (!lenis) {
      return;
    }

    const previousPathname =
      previousPathnameRef.current;

    if (
      previousPathname ===
      pathname
    ) {
      return;
    }

    const previousPage =
      normalizePath(
        previousPathname,
      );

    const currentPage =
      normalizePath(
        pathname,
      );

    previousPathnameRef.current =
      pathname;

    /*
     * Dacă s-a schimbat doar limba:
     *
     * /ro/about -> /en/about
     *
     * păstrăm poziția actuală.
     */
    if (
      previousPage ===
      currentPage
    ) {
      return;
    }

    let firstFrameId = 0;
    let secondFrameId = 0;

    /*
     * Așteptăm montarea și calcularea layoutului
     * noii pagini înainte să pornim animația.
     */
    firstFrameId =
      window.requestAnimationFrame(
        () => {
          secondFrameId =
            window.requestAnimationFrame(
              () => {
                lenis.resize();

                lenis.scrollTo(
                  0,
                  {
                    duration: 1.15,
                    immediate:
                      false,
                    force: true,

                    easing: (
                      progress,
                    ) =>
                      Math.min(
                        1,
                        1.001 -
                          Math.pow(
                            2,
                            -10 *
                              progress,
                          ),
                      ),
                  },
                );
              },
            );
        },
      );

    return () => {
      window.cancelAnimationFrame(
        firstFrameId,
      );

      window.cancelAnimationFrame(
        secondFrameId,
      );
    };
  }, [
    lenis,
    pathname,
  ]);

  return null;
}
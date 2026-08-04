"use client";

import Lenis from "lenis";
import { useEffect } from "react";

export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      wheelMultiplier: 0.9,
    });

    let rafId: number;

    function raf(time: number) {
      lenis.raf(time);

      rafId =
        requestAnimationFrame(raf);
    }

    rafId =
      requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(
        rafId,
      );

      lenis.destroy();
    };
  }, []);

  return null;
}
"use client";

import {
  ArrowDown,
} from "lucide-react";

import {
  useSmoothScroll,
} from "@/components/animations/SmoothScroll";

type RoomDetailsScrollButtonProps = {
  label: string;
  ariaLabel: string;
  targetId: string;
};

const scrollEasing = (
  progress: number,
): number =>
  1 -
  Math.pow(
    1 - progress,
    4,
  );

export function RoomDetailsScrollButton({
  label,
  ariaLabel,
  targetId,
}: RoomDetailsScrollButtonProps) {
  const {
    lenis,
  } = useSmoothScroll();

  function handleScroll() {
    const target =
      document.getElementById(
        targetId,
      );

    if (!target) {
      return;
    }

    if (lenis) {
      lenis.scrollTo(
        target,
        {
          offset:
            -window.innerHeight *
            0.12,

          duration: 1.4,

          easing:
            scrollEasing,

          immediate: false,

          force: true,
        },
      );

      return;
    }

    const targetTop =
      target
        .getBoundingClientRect()
        .top +
      window.scrollY;

    window.scrollTo({
      top:
        targetTop -
        window.innerHeight *
          0.12,

      left: 0,

      behavior: "smooth",
    });
  }

  return (
    <button
      type="button"
      onClick={handleScroll}
      aria-label={ariaLabel}
      className="group flex flex-col items-center text-white/55 transition duration-300 hover:text-gold"
    >
      <span className="text-[8px] uppercase tracking-[0.4em] md:text-[9px]">
        {label}
      </span>

      <span className="mt-3 flex h-10 w-6 items-start justify-center overflow-hidden">
        <ArrowDown className="h-4 w-4 animate-[hero-scroll-arrow_1.8s_ease-in-out_infinite] stroke-[1.25]" />
      </span>
    </button>
  );
}
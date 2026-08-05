"use client";

import {
  useEffect,
  useRef,
} from "react";

import Image from "next/image";

type ParallaxImageProps = {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  speed?: number;
  overscan?: number;
  className?: string;
  imageClassName?: string;
};

function clamp(
  value: number,
  minimum: number,
  maximum: number,
): number {
  return Math.min(
    Math.max(
      value,
      minimum,
    ),
    maximum,
  );
}

export function ParallaxImage({
  src,
  alt,
  priority = false,
  sizes = "100vw",
  speed = 0.22,
  overscan = 18,
  className,
  imageClassName,
}: ParallaxImageProps) {
  const containerRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const imageRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const frameRef =
    useRef<number | null>(
      null,
    );

  const currentOffsetRef =
    useRef(0);

  const targetOffsetRef =
    useRef(0);

  useEffect(() => {
    let cancelled = false;

    function setup() {
      const container =
        containerRef.current;

      const image =
        imageRef.current;

      // Refs pot să nu fie încă atașate la primul tick
      // (ex: React StrictMode / hidratare). Reîncercăm pe
      // următorul frame în loc să renunțăm definitiv.
      if (
        !container ||
        !image
      ) {
        if (!cancelled) {
          frameRef.current =
            window.requestAnimationFrame(
              setup,
            );
        }

        return;
      }

      const reducedMotionQuery =
        window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        );

      // Nu blocăm complet mișcarea pentru reduced-motion,
      // doar o reducem drastic, ca să nu pară "rupt" dacă
      // flag-ul e activat accidental (ex: emularea din
      // Chrome DevTools -> tab Rendering).
      function getEffectiveSpeed() {
        return reducedMotionQuery.matches
          ? speed * 0.15
          : speed;
      }

      function updateTarget() {
        if (!container) {
          return;
        }

        const rect =
          container.getBoundingClientRect();

        const viewportHeight =
          window.innerHeight;

        const containerCenter =
          rect.top +
          rect.height / 2;

        const viewportCenter =
          viewportHeight / 2;

        const distanceFromCenter =
          containerCenter -
          viewportCenter;

        const maximumTravel =
          rect.height *
          (overscan / 100);

        const rawOffset =
          -distanceFromCenter *
          getEffectiveSpeed();

        targetOffsetRef.current =
          clamp(
            rawOffset,
            -maximumTravel,
            maximumTravel,
          );
      }

      function animate() {
        if (!image) {
          return;
        }

        updateTarget();

        currentOffsetRef.current +=
          (
            targetOffsetRef.current -
            currentOffsetRef.current
          ) *
          0.085;

        image.style.transform =
          `translate3d(0, ${currentOffsetRef.current}px, 0)`;

        frameRef.current =
          window.requestAnimationFrame(
            animate,
          );
      }

      // Setăm o poziție inițială corectă imediat, ca să nu
      // pornim mereu de la 0 și să pară că "nu se mișcă"
      // până la primul scroll.
      updateTarget();

      currentOffsetRef.current =
        targetOffsetRef.current;

      if (image) {
        image.style.transform =
          `translate3d(0, ${currentOffsetRef.current}px, 0)`;
      }

      frameRef.current =
        window.requestAnimationFrame(
          animate,
        );

      // Backup pe scroll/resize, în plus față de bucla
      // rAF, ca plasă de siguranță dacă rAF e întrerupt
      // de browser (ex: tab în fundal, throttling agresiv).
      window.addEventListener(
        "scroll",
        updateTarget,
        { passive: true },
      );

      window.addEventListener(
        "resize",
        updateTarget,
      );

      return () => {
        window.removeEventListener(
          "scroll",
          updateTarget,
        );

        window.removeEventListener(
          "resize",
          updateTarget,
        );
      };
    }

    const cleanupPromise =
      setup();

    return () => {
      cancelled = true;

      if (
        frameRef.current !==
        null
      ) {
        window.cancelAnimationFrame(
          frameRef.current,
        );
      }

      if (
        typeof cleanupPromise ===
        "function"
      ) {
        cleanupPromise();
      }
    };
  }, [
    overscan,
    speed,
  ]);

  return (
    <div
      ref={containerRef}
      className={[
        "absolute inset-0 overflow-hidden",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        ref={imageRef}
        className="absolute inset-x-0 will-change-transform"
        style={{
          top:
            `-${overscan}%`,

          bottom:
            `-${overscan}%`,

          transform:
            "translate3d(0, 0, 0)",
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className={[
            "object-cover object-center",
            imageClassName,
          ]
            .filter(Boolean)
            .join(" ")}
        />
      </div>
    </div>
  );
}
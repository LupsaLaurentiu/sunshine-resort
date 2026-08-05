"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import Lenis from "lenis";

type SmoothScrollContextValue = {
  lenis: Lenis | null;
};

const SmoothScrollContext =
  createContext<SmoothScrollContextValue>({
    lenis: null,
  });

type SmoothScrollProps = {
  children: ReactNode;
};

export function SmoothScroll({
  children,
}: SmoothScrollProps) {
  const [lenis, setLenis] =
    useState<Lenis | null>(null);

  useEffect(() => {
    const instance = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      wheelMultiplier: 0.9,
    });

    let animationFrameId = 0;

    function raf(time: number) {
      instance.raf(time);

      animationFrameId =
        window.requestAnimationFrame(
          raf,
        );
    }

    animationFrameId =
      window.requestAnimationFrame(
        raf,
      );

    setLenis(instance);

    return () => {
      window.cancelAnimationFrame(
        animationFrameId,
      );

      instance.destroy();
      setLenis(null);
    };
  }, []);

  const value =
    useMemo<SmoothScrollContextValue>(
      () => ({
        lenis,
      }),
      [lenis],
    );

  return (
    <SmoothScrollContext.Provider
      value={value}
    >
      {children}
    </SmoothScrollContext.Provider>
  );
}

export function useSmoothScroll(): SmoothScrollContextValue {
  return useContext(
    SmoothScrollContext,
  );
}
"use client";

import type {
  ReactNode,
} from "react";

import {
  MotionConfig,
  motion,
} from "framer-motion";

type FadeInProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  distance?: number;
};

const easing = [
  0.22,
  1,
  0.36,
  1,
] as const;

export function FadeIn({
  children,
  delay = 0,
  className,
  distance = 36,
}: FadeInProps) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={{
          opacity: 0,
          y: distance,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{
          once: true,
          margin: "-80px",
        }}
        transition={{
          duration: 0.9,
          delay,
          ease: easing,
        }}
        className={className}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}
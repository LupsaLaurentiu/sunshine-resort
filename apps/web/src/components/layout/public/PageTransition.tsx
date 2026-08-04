"use client";

import type { ReactNode } from "react";
import { MotionConfig, motion } from "framer-motion";

type PageTransitionProps = {
  children: ReactNode;
};

export function PageTransition({
  children,
}: PageTransitionProps) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: 0.35,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}
"use client";

import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

type Direction = "down" | "left" | "right" | "up";

const offsets: Record<Direction, { x: number; y: number }> = {
  down: { x: 0, y: -32 },
  left: { x: 38, y: 0 },
  right: { x: -38, y: 0 },
  up: { x: 0, y: 38 },
};

export function Reveal({
  children,
  className,
  delay = 0,
  direction = "up",
  once = true,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: Direction;
  once?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const offset = reducedMotion ? { x: 0, y: 0 } : offsets[direction];

  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, ...offset }}
      transition={{
        delay,
        duration: reducedMotion ? 0 : 0.62,
        ease: [0.22, 1, 0.36, 1],
      }}
      viewport={{ amount: 0.16, once }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
    >
      {children}
    </motion.div>
  );
}

export function PageMotion({ children }: { children: React.ReactNode }) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: reducedMotion ? 0 : 10 }}
      transition={{
        duration: reducedMotion ? 0 : 0.38,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

export function FloatingAccent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      animate={
        reducedMotion
          ? undefined
          : {
              y: [0, -7, 0],
            }
      }
      className={className}
      transition={{
        duration: 3.8,
        ease: "easeInOut",
        repeat: Infinity,
      }}
    >
      {children}
    </motion.div>
  );
}

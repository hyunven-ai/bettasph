"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  fullWidth?: boolean;
  className?: string;
}

export function FadeIn({ children, delay = 0, direction = "up", fullWidth = false, className = "" }: FadeInProps) {
  // Custom elegant easing curve — cast as const so TS infers the tuple type
  const customEase = [0.16, 1, 0.3, 1] as const;

  const variants = {
    hidden: {
      opacity: 0,
      y: direction === "up" ? 32 : direction === "down" ? -32 : 0,
      x: direction === "left" ? 32 : direction === "right" ? -32 : 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, ease: customEase, delay }}
      variants={variants}
      className={`${fullWidth ? "w-full" : ""} ${className}`.trim()}
    >
      {children}
    </motion.div>
  );
}

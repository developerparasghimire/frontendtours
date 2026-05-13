"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

interface ZoomSectionProps {
  children: ReactNode;
  className?: string;
  /** Starting scale — element zooms from this to 1 (default: 0.92) */
  from?: number;
  /** End scale — element ends at this value (default: 1) */
  to?: number;
  /** Also fade in as it zooms? (default: true) */
  fade?: boolean;
}

export default function ZoomSection({
  children,
  className = "",
  from = 0.92,
  to = 1,
  fade = true,
}: ZoomSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.4], [from, to]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [fade ? 0.4 : 1, 1]);

  return (
    <motion.div ref={ref} style={{ scale, opacity }} className={className}>
      {children}
    </motion.div>
  );
}

"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/* ── Lightweight scroll-reveal using IntersectionObserver (no framer-motion) ── */

type Variant = "fade-up" | "fade-down" | "fade-left" | "fade-right" | "scale-up" | "zoom-in";

interface Props {
  children: ReactNode;
  variant?: Variant;
  delay?: number;
  className?: string;
  once?: boolean;
  amount?: number;
}

/* Map each variant to its hidden (off-screen) Tailwind classes */
const HIDDEN: Record<Variant, string> = {
  "fade-up":    "opacity-0 translate-y-8",
  "fade-down":  "opacity-0 -translate-y-8",
  "fade-left":  "opacity-0 -translate-x-10",
  "fade-right": "opacity-0 translate-x-10",
  "scale-up":   "opacity-0 scale-90",
  "zoom-in":    "opacity-0 scale-75",
};

export default function MotionWrapper({
  children,
  variant = "fade-up",
  delay = 0,
  className = "",
  once = true,
  amount = 0.12,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.unobserve(el);
        }
      },
      { threshold: amount }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [once, amount]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out will-change-transform ${
        visible
          ? "opacity-100 translate-y-0 translate-x-0 scale-100"
          : HIDDEN[variant]
      } ${className}`}
      style={{ transitionDelay: `${delay * 1000}ms` }}
    >
      {children}
    </div>
  );
}

/* ── Stagger container ── */
export function StaggerContainer({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  once?: boolean;
}) {
  return <div className={className}>{children}</div>;
}

export function StaggerItem({
  children,
  className = "",
  index = 0,
}: {
  children: ReactNode;
  className?: string;
  index?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.08 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out will-change-transform ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      } ${className}`}
      style={{ transitionDelay: `${index * 0.09}s` }}
    >
      {children}
    </div>
  );
}

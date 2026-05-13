"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { sectionImages } from "@/lib/sectionImages";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  accentColor?: string;
  backgroundImage?: string;
  imagePosition?: string;
  children?: React.ReactNode;
  compact?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" as const },
  },
};

const floatVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.2, ease: "easeOut" as const },
  },
};

export default function PageHero({
  title,
  subtitle,
  description,
  accentColor = "brand-red",
  backgroundImage,
  imagePosition = "center",
  children,
  compact = false,
}: PageHeroProps) {
  const colorMap: Record<
    string,
    {
      gradient: string;
      glow1: string;
      glow2: string;
      glow3: string;
      subtitleBorder: string;
      subtitleText: string;
      bar: string;
      decor: string;
      decorBorder: string;
      ring: string;
    }
  > = {
    "brand-red": {
      gradient: "from-[#0f1923] via-[#1a1215] to-[#0d1a24]",
      glow1: "bg-brand-red/20",
      glow2: "bg-brand-orange/14",
      glow3: "bg-brand-red/8",
      subtitleBorder: "border-brand-red/30",
      subtitleText: "text-brand-red",
      bar: "from-brand-red via-brand-orange to-brand-red",
      decor: "bg-brand-red/[0.07]",
      decorBorder: "border-brand-red/[0.12]",
      ring: "border-brand-red/10",
    },
    "brand-blue": {
      gradient: "from-[#0b1820] via-[#0f2230] to-[#0a1820]",
      glow1: "bg-brand-blue/22",
      glow2: "bg-brand-green/12",
      glow3: "bg-brand-blue/8",
      subtitleBorder: "border-brand-blue/30",
      subtitleText: "text-brand-blue",
      bar: "from-brand-blue via-brand-green to-brand-blue",
      decor: "bg-brand-blue/[0.07]",
      decorBorder: "border-brand-blue/[0.12]",
      ring: "border-brand-blue/10",
    },
    "brand-green": {
      gradient: "from-[#0b1a16] via-[#0f211a] to-[#0d1a24]",
      glow1: "bg-brand-green/22",
      glow2: "bg-brand-blue/12",
      glow3: "bg-brand-green/8",
      subtitleBorder: "border-brand-green/30",
      subtitleText: "text-brand-green",
      bar: "from-brand-green via-brand-blue to-brand-green",
      decor: "bg-brand-green/[0.07]",
      decorBorder: "border-brand-green/[0.12]",
      ring: "border-brand-green/10",
    },
    "brand-orange": {
      gradient: "from-[#1a1610] via-[#1c1308] to-[#0d1a24]",
      glow1: "bg-brand-orange/22",
      glow2: "bg-brand-red/12",
      glow3: "bg-brand-orange/8",
      subtitleBorder: "border-brand-orange/30",
      subtitleText: "text-brand-orange",
      bar: "from-brand-orange via-brand-red to-brand-orange",
      decor: "bg-brand-orange/[0.07]",
      decorBorder: "border-brand-orange/[0.12]",
      ring: "border-brand-orange/10",
    },
  };

  const colors = colorMap[accentColor] || colorMap["brand-red"];
  const defaultBackgrounds: Record<string, string> = {
    "brand-red": sectionImages.homeAbout,
    "brand-blue": sectionImages.contactCta,
    "brand-green": sectionImages.blogCta,
    "brand-orange": sectionImages.homeAboutInset,
  };
  const heroBackground = backgroundImage || defaultBackgrounds[accentColor] || sectionImages.homeAbout;

  return (
    <section
      className={`relative w-full flex items-center overflow-hidden ${
        compact
          ? "min-h-[280px] sm:min-h-[340px]"
          : "min-h-[360px] sm:min-h-[440px]"
      }`}
    >
      {/* ── Deep gradient base ── */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient}`} />

      {/* ── Background image ── */}
      <div className="absolute inset-0">
        <Image
          src={heroBackground}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: imagePosition }}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/70 via-brand-navy/60 to-brand-navy/70" />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/56 via-transparent to-brand-navy/22" />

      {/* ── Subtle grid pattern ── */}
      <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />

      {/* ── Ambient glow orbs ── */}
      <div
        className={`absolute -top-[15%] right-[8%] w-[420px] h-[420px] rounded-full ${colors.glow1} blur-[140px] pointer-events-none`}
      />
      <div
        className={`absolute -bottom-[18%] left-[4%] w-[360px] h-[360px] rounded-full ${colors.glow2} blur-[120px] pointer-events-none`}
      />
      <div
        className={`absolute top-[40%] left-[45%] w-[260px] h-[260px] rounded-full ${colors.glow3} blur-[100px] pointer-events-none`}
      />

      {/* ── Floating geometric shapes (desktop) ── */}
      <motion.div
        variants={floatVariants}
        initial="hidden"
        animate="visible"
        className={`absolute top-[14%] right-[10%] hidden lg:block w-20 h-20 rounded-2xl rotate-12 ${colors.decor} border ${colors.decorBorder} backdrop-blur-sm`}
      />
      <motion.div
        variants={floatVariants}
        initial="hidden"
        animate="visible"
        className={`absolute bottom-[16%] left-[7%] hidden lg:block w-14 h-14 rounded-full ${colors.decor} border ${colors.decorBorder} backdrop-blur-sm`}
      />
      <motion.div
        variants={floatVariants}
        initial="hidden"
        animate="visible"
        className={`absolute top-[55%] right-[22%] hidden md:block w-8 h-8 rounded-md rotate-45 ${colors.decor} border ${colors.decorBorder}`}
      />
      {/* Concentric ring */}
      <div
        className={`absolute top-[25%] left-[18%] hidden xl:block w-40 h-40 rounded-full border ${colors.ring} pointer-events-none`}
      />

      {/* ── Diagonal accent line ── */}
      <div className="absolute top-0 right-[30%] w-px h-[200%] bg-gradient-to-b from-transparent via-white/[0.04] to-transparent -rotate-[30deg] origin-top pointer-events-none" />

      {/* ── Bottom accent bar ── */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r ${colors.bar}`}
      />

      {/* ── Content ── */}
      <motion.div
        className="relative z-10 w-full max-w-4xl mx-auto px-5 sm:px-8 py-24 sm:py-28 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {subtitle && (
          <motion.p
            variants={itemVariants}
            className={`mb-5 inline-block rounded-full border ${colors.subtitleBorder} bg-white/[0.05] backdrop-blur-sm px-5 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.28em] sm:text-xs ${colors.subtitleText}`}
          >
            {subtitle}
          </motion.p>
        )}
        <motion.h1
          variants={itemVariants}
          className="text-[1.75rem] font-extrabold leading-[1.1] tracking-[-0.04em] text-white sm:text-4xl md:text-5xl lg:text-[3.4rem]"
        >
          {title}
        </motion.h1>
        {description && (
          <motion.p
            variants={itemVariants}
            className="mx-auto mt-5 max-w-2xl text-[0.94rem] leading-relaxed text-white/78 sm:mt-6 sm:text-lg"
          >
            {description}
          </motion.p>
        )}
        {children && (
          <motion.div variants={itemVariants} className="mt-8">
            {children}
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}

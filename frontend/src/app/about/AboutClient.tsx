"use client";

import Image from "next/image";
import Link from "next/link";
import MotionWrapper, { StaggerContainer, StaggerItem } from "@/components/shared/MotionWrapper";
import { shouldUseUnoptimizedImage } from "@/lib/images";
import { sectionImages } from "@/lib/sectionImages";
import PageHero from "@/components/sections/PageHero";
import { useTranslation } from "@/context/TranslationContext";
import type { APIAboutStat, APIValue, APIMilestone, APILeader, SiteConfig } from "@/lib/api";

interface Props {
  stats: APIAboutStat[];
  valuesData: APIValue[];
  milestonesData: APIMilestone[];
  guides: APILeader[];
  teamMembers: APILeader[];
  siteConfig: SiteConfig | null;
}

export default function AboutClient({ stats, valuesData, milestonesData, guides, teamMembers, siteConfig }: Props) {
  const { t } = useTranslation();

  const trekFeatures = [
    { emoji: "🗺️", title: t("about.feature1_title"), desc: t("about.feature1_desc") },
    { emoji: "🏕️", title: t("about.feature2_title"), desc: t("about.feature2_desc") },
    { emoji: "🩺", title: t("about.feature3_title"), desc: t("about.feature3_desc") },
    { emoji: "📸", title: t("about.feature4_title"), desc: t("about.feature4_desc") },
  ];

  return (
    <div className="flex flex-col overflow-x-hidden">

      {/* ═══════════════════════ HERO ═══════════════════════ */}
      <PageHero
        title={t("about.hero_title")}
        subtitle={t("about.hero_subtitle")}
        description={t("about.hero_desc")}
        accentColor="brand-red"
        backgroundImage={sectionImages.homeAbout}
      />

      {/* ─── Stats Strip ─── */}
      {stats.length > 0 && (
        <div className="relative overflow-hidden bg-brand-navy">
          <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:40px_40px]" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-red/10 via-transparent to-brand-orange/10 pointer-events-none" />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="grid grid-cols-2 sm:grid-cols-4">
              {stats.map((s, i) => (
                <div key={s.label} className={`py-8 px-6 text-center relative ${i < stats.length - 1 ? "after:absolute after:right-0 after:top-4 after:bottom-4 after:w-px after:bg-white/10" : ""}`}>
                  <p className="text-4xl sm:text-5xl font-black text-white tracking-tight">{s.value}</p>
                  <p className="text-brand-orange/80 text-[0.65rem] sm:text-xs mt-2 font-bold uppercase tracking-[0.22em]">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-red/40 to-transparent" />
        </div>
      )}

      {/* ═══════════════════════ MISSION ═══════════════════════ */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-24 items-center">

            {/* Image side */}
            <MotionWrapper>
              <div className="relative">
                <div className="absolute -top-6 -left-6 w-48 h-48 rounded-full border-2 border-brand-red/10 pointer-events-none" />
                <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full border border-brand-orange/10 pointer-events-none" />

                <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-[0_40px_100px_-30px_rgba(15,23,42,0.28)]">
                  <Image
                    src={sectionImages.aboutWhoWeAre}
                    alt="Trekking in Nepal"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 90vw, 45vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 inset-x-0 p-7">
                    <p className="text-white/50 text-xs font-bold uppercase tracking-[0.2em] mb-1">{t("about.years_exp")}</p>
                    <p className="text-white text-xl font-extrabold leading-tight">Thamel, Kathmandu<br />Nepal</p>
                  </div>
                </div>

                <div className="absolute -top-4 -right-4 sm:-right-8 bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(15,23,42,0.22)] px-5 py-4 flex items-center gap-3.5 border border-slate-100">
                  <div className="w-11 h-11 rounded-xl bg-brand-red flex items-center justify-center shadow-lg shadow-brand-red/30 shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-brand-navy font-black text-lg leading-none">25+</p>
                    <p className="text-slate-400 text-xs font-medium mt-0.5">{t("about.years_excellence")}</p>
                  </div>
                </div>
              </div>
            </MotionWrapper>

            {/* Text side */}
            <MotionWrapper>
              <p className="inline-flex items-center gap-2 text-brand-red text-[0.68rem] font-black tracking-[0.28em] uppercase mb-4">
                <span className="w-5 h-px bg-brand-red inline-block" />
                {siteConfig?.about_eyebrow || "Who We Are"}
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-navy leading-[1.05] tracking-[-0.04em] mb-7">
                <span className="relative inline-block">
                  {siteConfig?.about_title || "We Make Every Trek Meaningful"}
                  <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-brand-red to-brand-orange rounded-full" />
                </span>
              </h2>
              <p className="text-slate-500 leading-relaxed mb-5 text-base sm:text-lg">
                {siteConfig?.about_paragraph_1 || "Get Tours was founded in 2018 with a simple mission: make Nepal's incredible mountain trails accessible to everyone, while uplifting the communities that call those mountains home."}
              </p>
              <p className="text-slate-500 leading-relaxed mb-10 text-base sm:text-lg">
                {siteConfig?.about_paragraph_2 || "We believe trekking should be more than reaching a summit — it should be transformative. Every trail we chart connects you with real mountain people, ancient culture, and raw adventure."}
              </p>

              {stats.length > 0 && (
                <div className={`grid gap-3 ${stats.length >= 4 ? "grid-cols-2" : `grid-cols-${Math.min(stats.length, 3)}`}`}>
                  {stats.slice(0, 4).map((s, idx) => {
                    const palette = [
                      { color: "text-brand-red", bg: "bg-brand-red/6" },
                      { color: "text-brand-orange", bg: "bg-brand-orange/6" },
                      { color: "text-brand-blue", bg: "bg-brand-blue/6" },
                      { color: "text-brand-green", bg: "bg-brand-green/6" },
                    ];
                    const c = palette[idx % palette.length];
                    return (
                      <div key={s.label} className={`${c.bg} rounded-2xl p-5 border border-white`}>
                        <p className={`text-2xl font-black ${c.color} leading-none`}>{s.value}</p>
                        <p className="text-slate-500 text-xs font-medium mt-1.5">{s.label}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </MotionWrapper>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ TREK FEATURES ═══════════════════════ */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <MotionWrapper className="text-center mb-14">
            <p className="inline-flex items-center gap-2 text-brand-red text-[0.68rem] font-black tracking-[0.28em] uppercase mb-4">
              <span className="w-5 h-px bg-brand-red inline-block" />
              {t("about.trek_eyebrow")}
              <span className="w-5 h-px bg-brand-red inline-block" />
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-brand-navy tracking-[-0.04em]">
              {t("about.trek_heading")}
            </h2>
          </MotionWrapper>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" staggerDelay={0.08}>
            {trekFeatures.map((f, i) => {
              const accents = ["brand-red", "brand-orange", "brand-blue", "brand-green"];
              const c = accents[i % accents.length];
              return (
                <StaggerItem key={f.title}>
                  <div className="group relative bg-white rounded-[1.75rem] p-7 border border-slate-100 hover:border-slate-200 shadow-[0_8px_30px_-10px_rgba(15,23,42,0.08)] hover:shadow-[0_20px_50px_-14px_rgba(15,23,42,0.15)] transition-all duration-500 h-full hover:-translate-y-2 overflow-hidden">
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-${c} rounded-t-[1.75rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                    <div className={`w-14 h-14 rounded-2xl bg-${c}/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                      <span className="text-2xl">{f.emoji}</span>
                    </div>
                    <h3 className="text-base font-bold text-brand-navy mb-2.5">{f.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══════════════════════ VALUES ═══════════════════════ */}
      {valuesData.length > 0 && (
        <section className="relative py-20 sm:py-28 overflow-hidden dark-section">
          <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />
          <div className="absolute -top-40 right-0 w-[500px] h-[500px] bg-brand-red/8 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-40 left-0 w-[400px] h-[400px] bg-brand-blue/8 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <MotionWrapper className="text-center mb-14">
              <p className="inline-flex items-center gap-2 text-brand-red text-[0.68rem] font-black tracking-[0.28em] uppercase mb-4">
                <span className="w-5 h-px bg-brand-red inline-block" />
                {t("about.values_eyebrow")}
                <span className="w-5 h-px bg-brand-red inline-block" />
              </p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-[-0.04em]">
                {t("about.values_heading")}
              </h2>
            </MotionWrapper>

            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" staggerDelay={0.09}>
              {valuesData.map((v) => (
                <StaggerItem key={v.title || v.id}>
                  <div className="group dark-panel rounded-[1.75rem] p-8 hover:bg-white/[0.07] transition-all duration-400 h-full hover:-translate-y-1">
                    <div className="w-14 h-14 mb-6 bg-brand-red/15 rounded-2xl flex items-center justify-center group-hover:bg-brand-red/25 transition-colors duration-300 border border-brand-red/20">
                      {v.icon_svg_path ? (
                        <svg className="w-7 h-7 text-brand-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={v.icon_svg_path} />
                        </svg>
                      ) : (
                        <svg className="w-7 h-7 text-brand-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3">{v.title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed">{v.description}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      )}

      {/* ═══════════════════════ TIMELINE ═══════════════════════ */}
      {milestonesData.length > 0 && (
        <section className="py-20 sm:py-28 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <MotionWrapper className="text-center mb-16">
              <p className="inline-flex items-center gap-2 text-brand-red text-[0.68rem] font-black tracking-[0.28em] uppercase mb-4">
                <span className="w-5 h-px bg-brand-red inline-block" />
                {t("about.timeline_eyebrow")}
                <span className="w-5 h-px bg-brand-red inline-block" />
              </p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-brand-navy tracking-[-0.04em]">
                {t("about.timeline_heading")}
              </h2>
            </MotionWrapper>

            <div className="relative">
              <div className="absolute left-[1.125rem] sm:left-1/2 top-2 bottom-2 w-px bg-gradient-to-b from-brand-red/50 via-brand-red/20 to-transparent -translate-x-1/2" />
              <div className="space-y-10">
                {milestonesData.map((m, i) => (
                  <MotionWrapper key={m.year}>
                    <div className={`relative flex items-start gap-8 ${i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"}`}>
                      <div className="absolute left-[1.125rem] sm:left-1/2 w-5 h-5 bg-brand-red rounded-full -translate-x-1/2 ring-4 ring-white z-10 shadow-[0_0_12px_rgba(214,28,29,0.4)] mt-1" />
                      <div className={`ml-11 sm:ml-0 sm:w-[46%] bg-white rounded-2xl border border-slate-100 p-6 shadow-[0_8px_30px_-10px_rgba(15,23,42,0.1)] hover:shadow-[0_16px_40px_-12px_rgba(15,23,42,0.14)] transition-shadow duration-300 ${i % 2 === 0 ? "sm:mr-auto" : "sm:ml-auto"}`}>
                        <span className="inline-block bg-brand-red text-white font-black text-xs px-3 py-1 rounded-full mb-3 shadow-sm shadow-brand-red/30">{m.year}</span>
                        <p className="text-slate-600 text-sm leading-relaxed">{m.text}</p>
                      </div>
                      <div className="hidden sm:block sm:w-[46%]" />
                    </div>
                  </MotionWrapper>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════ GUIDES ═══════════════════════ */}
      {guides.length > 0 && (
        <section className="relative py-20 sm:py-28 bg-white overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-red/[0.03] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-brand-blue/[0.03] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <MotionWrapper className="text-center mb-14">
              <p className="inline-flex items-center gap-2 text-brand-red text-[0.68rem] font-black tracking-[0.28em] uppercase mb-4">
                <span className="w-5 h-px bg-brand-red inline-block" />
                {t("about.guides_eyebrow")}
                <span className="w-5 h-px bg-brand-red inline-block" />
              </p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-brand-navy tracking-[-0.04em]">
                {t("about.guides_heading")}
              </h2>
              <p className="text-slate-400 mt-4 max-w-xl mx-auto text-sm sm:text-base">
                {t("about.guides_desc")}
              </p>
            </MotionWrapper>

            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.08}>
              {guides.map((t_) => (
                <StaggerItem key={t_.name || t_.id}>
                  <div className="group relative bg-white rounded-[2rem] overflow-hidden shadow-[0_8px_32px_-8px_rgba(15,23,42,0.1)] hover:shadow-[0_24px_60px_-16px_rgba(15,23,42,0.2)] transition-all duration-500 border border-slate-100 hover:-translate-y-2">
                    <div className="relative h-72 overflow-hidden">
                      <Image
                        src={t_.image || "/img/landscape_background_small.jpg"}
                        alt={t_.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        unoptimized={shouldUseUnoptimizedImage(t_.image)}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out bg-brand-navy/96 px-6 py-5">
                        <p className="text-white/65 text-xs leading-relaxed">{t_.bio || "Expert guide with years of Himalayan experience."}</p>
                      </div>
                      <div className="absolute bottom-0 inset-x-0 px-5 pb-4 group-hover:opacity-0 transition-opacity duration-200">
                        <h3 className="text-white font-bold text-base leading-tight">{t_.name}</h3>
                        <p className="text-brand-orange text-xs font-semibold mt-0.5">{t_.role}</p>
                      </div>
                    </div>
                    <div className="px-5 py-4 flex items-center justify-between bg-white">
                      <div>
                        <h3 className="font-bold text-brand-navy text-sm leading-tight">{t_.name}</h3>
                        <p className="text-slate-400 text-xs mt-0.5">{t_.role}</p>
                      </div>
                      <div className="w-9 h-9 rounded-full bg-brand-red/8 flex items-center justify-center group-hover:bg-brand-red transition-all duration-300 shrink-0">
                        <svg className="w-4 h-4 text-brand-red group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      )}

      {/* ═══════════════════════ TEAM ═══════════════════════ */}
      {teamMembers.length > 0 && (
        <section className="relative py-20 sm:py-28 overflow-hidden bg-slate-50">
          <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-brand-orange/[0.04] rounded-full -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[360px] h-[360px] bg-brand-blue/[0.04] rounded-full translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <MotionWrapper className="text-center mb-14">
              <p className="inline-flex items-center gap-2 text-brand-orange text-[0.68rem] font-black tracking-[0.28em] uppercase mb-4">
                <span className="w-5 h-px bg-brand-orange inline-block" />
                {t("about.team_eyebrow")}
                <span className="w-5 h-px bg-brand-orange inline-block" />
              </p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-brand-navy tracking-[-0.04em]">
                {t("about.team_heading")}
              </h2>
              <p className="text-slate-500 mt-4 max-w-xl mx-auto text-sm sm:text-base">
                {t("about.team_desc")}
              </p>
            </MotionWrapper>

            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.08}>
              {teamMembers.map((t_) => (
                <StaggerItem key={t_.name || t_.id}>
                  <div className="group relative bg-white rounded-[2rem] overflow-hidden shadow-[0_8px_32px_-8px_rgba(15,23,42,0.1)] hover:shadow-[0_24px_60px_-16px_rgba(15,23,42,0.2)] transition-all duration-500 border border-slate-100 hover:-translate-y-2">
                    <div className="relative h-72 overflow-hidden">
                      <Image
                        src={t_.image || "/img/landscape_background_small.jpg"}
                        alt={t_.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        unoptimized={shouldUseUnoptimizedImage(t_.image)}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out bg-brand-navy/96 px-6 py-5">
                        <p className="text-white/65 text-xs leading-relaxed">{t_.bio || "Member of our office team."}</p>
                      </div>
                      <div className="absolute bottom-0 inset-x-0 px-5 pb-4 group-hover:opacity-0 transition-opacity duration-200">
                        <h3 className="text-white font-bold text-base leading-tight">{t_.name}</h3>
                        <p className="text-brand-orange text-xs font-semibold mt-0.5">{t_.role}</p>
                      </div>
                    </div>
                    <div className="px-5 py-4 flex items-center justify-between bg-white">
                      <div>
                        <h3 className="font-bold text-brand-navy text-sm leading-tight">{t_.name}</h3>
                        <p className="text-slate-400 text-xs mt-0.5">{t_.role}</p>
                      </div>
                      <div className="w-9 h-9 rounded-full bg-brand-orange/10 flex items-center justify-center group-hover:bg-brand-orange transition-all duration-300 shrink-0">
                        <svg className="w-4 h-4 text-brand-orange group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-5.13a4 4 0 11-8 0 4 4 0 018 0zm6 4a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      )}

      {/* ═══════════════════════ CTA ═══════════════════════ */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <Image
          src={sectionImages.aboutAdventure}
          alt="Himalayan trek background"
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority={false}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/80 via-[#0d1520]/85 to-brand-navy/90" />
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute top-[30%] left-[15%] w-[400px] h-[400px] rounded-full bg-brand-red/15 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[20%] right-[15%] w-[350px] h-[350px] rounded-full bg-brand-orange/10 blur-[110px] pointer-events-none" />

        <MotionWrapper className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6">
          <p className="inline-flex items-center gap-2 text-brand-red text-[0.68rem] font-black tracking-[0.28em] uppercase mb-5">
            <span className="w-5 h-px bg-brand-red inline-block" />
            {t("about.cta_eyebrow")}
            <span className="w-5 h-px bg-brand-red inline-block" />
          </p>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white mb-5 leading-[1.05] tracking-[-0.04em]">
            {t("about.cta_heading")}
          </h2>
          <p className="text-white/50 text-base sm:text-lg mb-12 max-w-xl mx-auto leading-relaxed">
            {t("about.cta_desc")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/tours"
              className="group inline-flex items-center justify-center gap-2.5 bg-brand-red text-white font-bold px-9 py-4 rounded-2xl hover:bg-[#c01100] transition-all duration-300 hover:shadow-[0_0_40px_rgba(214,28,29,0.35)] text-sm sm:text-base"
            >
              {t("about.cta_explore")}
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/contact"
              className="group inline-flex items-center justify-center gap-2.5 font-bold px-9 py-4 rounded-2xl border border-white/12 text-white/65 hover:border-white/25 hover:bg-white/6 hover:text-white backdrop-blur-sm transition-all duration-300 text-sm sm:text-base"
            >
              {t("about.cta_contact")}
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </MotionWrapper>
      </section>
    </div>
  );
}

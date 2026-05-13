export default function BlogImagePlaceholder({ title, compact = false }: { title: string; compact?: boolean }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1b1f2a] via-[#171f2f] to-[#2a1717] px-4 text-center">
      <div>
        <div className={`${compact ? "h-9 w-9" : "h-14 w-14"} mx-auto flex items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/70 backdrop-blur-sm`}>
          <svg className={compact ? "h-4 w-4" : "h-7 w-7"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-5.5A2.75 2.75 0 0016.75 6h-9.5A2.75 2.75 0 004.5 8.75v6.5A2.75 2.75 0 007.25 18h6m2.25-1.5l1.5 1.5 2.5-3M8 10h8M8 13h4" />
          </svg>
        </div>
        {compact ? (
          <span className="sr-only">No image uploaded for {title}</span>
        ) : (
          <>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.3em] text-white/55">
              No image uploaded
            </p>
            <p className="mt-2 text-sm font-semibold text-white/80">{title}</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function TourImagePlaceholder({ title }: { title: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#17211c] via-[#1b2a24] to-[#111827] px-6 text-center">
      <div>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/70 backdrop-blur-sm">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5V8.25A2.25 2.25 0 015.25 6h13.5A2.25 2.25 0 0121 8.25v8.25m-18 0A2.25 2.25 0 005.25 18.75h13.5A2.25 2.25 0 0021 16.5m-18 0l4.72-4.72a1.5 1.5 0 012.12 0l2.41 2.41m8.75 2.31l-3.22-3.22a1.5 1.5 0 00-2.12 0l-3.41 3.41M14.25 9.75h.01" />
          </svg>
        </div>
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.3em] text-white/55">
          No image uploaded
        </p>
        <p className="mt-2 text-sm font-semibold text-white/80">{title}</p>
      </div>
    </div>
  );
}

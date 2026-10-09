import { site } from "../site";

export function LogoMarquee() {
  const items = [...site.logos, ...site.logos];

  return (
    <section aria-label="Teams using Trellis" className="border-y border-ink-800 bg-ink-900/40 py-7">
      <p className="mb-6 text-center font-mono text-[0.75rem] tracking-[0.2em] text-white/30 uppercase">
        Shipping on Trellis in production
      </p>
      <div className="marquee-mask overflow-hidden">
        <div className="flex w-max animate-marquee items-center gap-14 px-6">
          {items.map((name, i) => (
            <span
              key={`${name}-${i}`}
              aria-hidden={i >= site.logos.length}
              className="text-lg font-semibold tracking-tight whitespace-nowrap text-white/30 transition-colors hover:text-white/60 sm:text-xl"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

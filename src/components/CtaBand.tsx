import { site } from "../site";
import { IconArrow, Mark } from "./Icons";
import { Reveal } from "./Reveal";

export function CtaBand() {
  return (
    <section className="relative overflow-hidden border-t border-ink-800 py-20 sm:py-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="bg-grid-fade absolute inset-0 opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950/40 via-ink-950/70 to-ink-950" />
      </div>

      <Reveal className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
        <div className="mx-auto flex h-11 w-11 items-center justify-center">
          <Mark className="h-11 w-11" />
        </div>
        <h2 className="mt-6 text-3xl font-semibold tracking-[-0.03em] text-white text-balance-tight sm:text-[2.4rem] sm:leading-[1.1]">
          {site.cta.title}
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-[1.02rem] leading-relaxed text-white/55">{site.cta.body}</p>

        <div className="mt-8 flex justify-center">
          <div className="flex w-full max-w-md items-center gap-2 rounded-xl border border-ink-700 bg-ink-900/80 px-4 py-3 font-mono text-[0.75rem] text-white/60 backdrop-blur sm:text-[0.8rem]">
            <span className="text-acid-400">$</span>
            <span className="truncate">{site.repo.clone}</span>
            <span className="ml-auto text-white/25">↩ copy</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href={site.cta.primary.href}
            className="group acid-glow inline-flex items-center justify-center gap-2 rounded-xl bg-acid-400 px-6 py-3.5 text-sm font-semibold text-ink-950 transition-colors hover:bg-acid-300"
          >
            {site.cta.primary.label}
            <IconArrow className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </a>
          <a
            href={site.cta.secondary.href}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-ink-700 bg-ink-900/60 px-6 py-3.5 text-sm font-medium text-white/80 transition-colors hover:border-ink-600 hover:text-white"
          >
            {site.cta.secondary.label}
          </a>
        </div>
      </Reveal>
    </section>
  );
}

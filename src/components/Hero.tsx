import { site } from "../site";
import { IconArrow, IconStar } from "./Icons";
import { Reveal } from "./Reveal";
import { Terminal } from "./Terminal";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-24">
      {/* backdrop */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-grid absolute inset-x-0 top-0 h-[46rem]" />
        <div className="absolute top-[-14rem] left-1/2 h-[36rem] w-[64rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(79,107,255,0.20),transparent)] blur-2xl" />
        <div className="absolute top-[6rem] right-[-10rem] h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(closest-side,rgba(198,242,78,0.13),transparent)] blur-2xl" />
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-14 px-5 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-12">
        <div>
          <Reveal>
            <a
              href="#waitlist"
              className="group inline-flex items-center gap-2 rounded-full border border-ink-700 bg-ink-900/70 py-1.5 pr-3.5 pl-2 text-xs text-white/70 backdrop-blur transition-colors hover:border-acid-400/40 hover:text-white"
            >
              <span className="rounded-full bg-acid-400/15 px-2 py-0.5 font-mono text-[0.75rem] font-semibold tracking-wider text-acid-400 uppercase">
                new
              </span>
              {site.badge}
              <IconArrow className="h-3.5 w-3.5 text-white/40 transition-transform group-hover:translate-x-0.5" />
            </a>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-7 text-[2.6rem] leading-[1.03] font-semibold tracking-[-0.035em] text-white text-balance-tight sm:text-6xl lg:text-[4.15rem]">
              {site.headline[0]}
              <br />
              <span className="bg-gradient-to-r from-acid-300 via-acid-400 to-flux-400 bg-clip-text text-transparent">
                {site.headline[1]}
              </span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-6 max-w-xl text-[1.02rem] leading-relaxed text-white/60 sm:text-lg">{site.subhead}</p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={site.primaryCta.href}
                className="group acid-glow inline-flex items-center justify-center gap-2 rounded-xl bg-acid-400 px-6 py-3.5 text-sm font-semibold text-ink-950 transition-colors hover:bg-acid-300"
              >
                {site.primaryCta.label}
                <IconArrow className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </a>
              <a
                href={site.secondaryCta.href}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-ink-700 bg-ink-900/60 px-6 py-3.5 text-sm font-medium text-white/80 backdrop-blur transition-colors hover:border-ink-600 hover:text-white"
              >
                <IconStar className="h-4 w-4 text-acid-400" />
                {site.secondaryCta.label}
              </a>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <p className="mt-5 font-mono text-[0.75rem] tracking-wide text-white/35">
              Apache-2.0 · self-host in one command · no seat minimums
            </p>
          </Reveal>
        </div>

        <Reveal delay={200}>
          <Terminal />
        </Reveal>
      </div>

      <Reveal delay={120} className="mx-auto mt-16 max-w-6xl px-5 sm:mt-20 sm:px-8">
        <div className="hairline" />
        <dl className="grid grid-cols-2 gap-y-8 py-8 sm:grid-cols-4">
          {site.stats.map((s) => (
            <div key={s.label} className="text-center sm:text-left">
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <span className="block font-mono text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  {s.value}
                </span>
                <span className="mt-1 block text-xs tracking-wide text-white/45 uppercase">{s.label}</span>
              </dd>
            </div>
          ))}
        </dl>
        <div className="hairline" />
      </Reveal>
    </section>
  );
}

import { site } from "../site";
import { IconArrow, IconStar } from "./Icons";
import { Reveal } from "./Reveal";

export function OpenSource() {
  const { oss } = site;

  return (
    <section id="open-source" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-ink-700 bg-ink-900/50 p-8 sm:p-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(79,107,255,0.14),transparent_58%)]"
          />

          <div className="relative grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:items-center">
            <div>
              <Reveal>
                <p className="font-mono text-[0.75rem] tracking-[0.22em] text-acid-400 uppercase">{oss.eyebrow}</p>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-white text-balance-tight sm:text-[2.4rem] sm:leading-[1.12]">
                  {oss.title}
                </h2>
                <p className="mt-5 text-[1.02rem] leading-relaxed text-white/55">{oss.body}</p>
              </Reveal>

              <Reveal delay={100}>
                <ul className="mt-8 space-y-3">
                  {oss.points.map((p) => (
                    <li key={p} className="flex gap-3 text-sm leading-relaxed text-white/60">
                      <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-acid-400" />
                      {p}
                    </li>
                  ))}
                </ul>
              </Reveal>

              <Reveal delay={180}>
                <div className="mt-9 flex flex-wrap gap-3">
                  {oss.links.map((l, i) => (
                    <a
                      key={l.label}
                      href={l.href}
                      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                        i === 0
                          ? "bg-white text-ink-950 hover:bg-white/90"
                          : "border border-ink-700 bg-ink-850/60 text-white/75 hover:border-ink-600 hover:text-white"
                      }`}
                    >
                      {i === 0 ? <IconStar className="h-4 w-4" /> : null}
                      {l.label}
                      <span className="font-mono text-[0.75rem] opacity-50">{l.meta}</span>
                    </a>
                  ))}
                </div>
              </Reveal>
            </div>

            <Reveal delay={140}>
              <ReadmeCard />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function ReadmeCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink-700 bg-ink-950/80 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)]">
      <div className="flex items-center gap-2 border-b border-ink-800 px-4 py-3">
        <span className="font-mono text-[0.75rem] text-white/45">trellis-labs/trellis</span>
        <span className="ml-auto rounded-full border border-ink-700 px-2 py-0.5 font-mono text-[0.75rem] text-acid-400">
          Apache-2.0
        </span>
      </div>
      <div className="space-y-3 p-5 font-mono text-[0.8rem] leading-relaxed">
        <p className="text-white/40"># clone and run it locally</p>
        <p className="text-acid-400">$ git clone https://github.com/trellis-labs/trellis</p>
        <p className="text-acid-400">$ cd trellis && docker compose up</p>
        <p className="mt-4 text-white/40">services</p>
        <div className="space-y-1.5">
          {[
            ["api", ":8787", "healthy"],
            ["worker", "2 replicas", "healthy"],
            ["postgres", "pgvector", "healthy"],
            ["dashboard", ":3000", "healthy"],
          ].map(([name, meta, state]) => (
            <div key={name} className="flex items-center gap-3 rounded-lg border border-ink-800 bg-ink-900/60 px-3 py-2">
              <span className="text-white/80">{name}</span>
              <span className="text-white/30">{meta}</span>
              <span className="ml-auto flex items-center gap-1.5 text-acid-400">
                <span className="h-1.5 w-1.5 rounded-full bg-acid-400" />
                {state}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 pt-2 text-white/45">
          <IconArrow className="h-3.5 w-3.5 text-acid-400" />
          same runtime the hosted tier runs
        </div>
      </div>
    </div>
  );
}

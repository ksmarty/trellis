import { site } from "../site";
import { IconCheck } from "./Icons";
import { Reveal } from "./Reveal";

export function Platform() {
  const { comparison } = site.platform;

  return (
    <section id="platform" className="relative border-t border-ink-800 bg-ink-900/30 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <Reveal>
            <p className="font-mono text-[0.75rem] tracking-[0.22em] text-acid-400 uppercase">
              {site.platform.eyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-white text-balance-tight sm:text-[2.6rem] sm:leading-[1.1]">
              {site.platform.title}
            </h2>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-white/55">{site.platform.body}</p>

            <div className="mt-9 flex flex-col gap-4">
              {[
                { k: "Self-hosted", v: "You own upgrades, scaling, on-call" },
                { k: "Trellis Cloud", v: "We handle it; you ship features" },
                { k: "Migration", v: "Same config, same API, either way" },
              ].map((row) => (
                <div key={row.k} className="flex items-start gap-3.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-acid-400/15 text-acid-400">
                    <IconCheck className="h-3 w-3" />
                  </span>
                  <p className="text-sm leading-relaxed">
                    <span className="font-medium text-white">{row.k}</span>
                    <span className="text-white/45"> — {row.v}</span>
                  </p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={140}>
            <div className="overflow-hidden rounded-2xl border border-ink-700 bg-ink-900/70 backdrop-blur">
              <div className="grid grid-cols-[1.1fr_1fr_1fr] border-b border-ink-700 bg-ink-850/60 px-5 py-3.5 text-[0.75rem] tracking-[0.14em] text-white/40 uppercase">
                {comparison.columns.map((c, i) => (
                  <span key={i} className={i === 0 ? "" : "text-center"}>
                    {c}
                  </span>
                ))}
              </div>

              <div className="divide-y divide-ink-800">
                {comparison.rows.map((row) => (
                  <div
                    key={row[0]}
                    className="grid grid-cols-[1.1fr_1fr_1fr] items-center gap-2 px-5 py-3.5 text-[0.82rem] transition-colors hover:bg-ink-850/40"
                  >
                    <span className="text-white/70">{row[0]}</span>
                    <span className="text-center text-white/45">{row[1]}</span>
                    <span className="text-center font-medium text-acid-400">{row[2]}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-ink-700 bg-ink-850/40 px-5 py-4">
                <p className="font-mono text-[0.75rem] text-white/40">
                  Both columns run the same tagged release of the open-source runtime.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

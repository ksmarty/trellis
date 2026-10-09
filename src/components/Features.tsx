import { site } from "../site";
import { featureIcons, type FeatureIconName } from "../lib/iconMap";
import { Reveal } from "./Reveal";

export function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <p className="font-mono text-[0.75rem] tracking-[0.22em] text-acid-400 uppercase">The platform</p>
          <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.03em] text-white text-balance-tight sm:text-[2.6rem] sm:leading-[1.1]">
            Everything between your prompt and production.
          </h2>
          <p className="mt-5 max-w-2xl text-[1.02rem] leading-relaxed text-white/55">
            Most teams glue together six services to get one agent to production. Trellis collapses that stack into
            a single runtime you can read, fork, and run yourself.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-ink-800 bg-ink-800 sm:grid-cols-2 lg:grid-cols-3">
          {site.features.map((f, i) => {
            const Icon = featureIcons[f.icon as FeatureIconName];
            return (
              <Reveal key={f.title} delay={i * 70}>
                <article className="group card h-full rounded-none border-0 p-7">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-ink-700 bg-ink-850 text-acid-400 transition-colors group-hover:border-acid-400/40">
                    <Icon />
                  </div>
                  <h3 className="mt-5 text-[1.05rem] font-semibold tracking-tight text-white">{f.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-white/55">{f.body}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

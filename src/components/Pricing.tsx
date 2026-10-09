import { site } from "../site";
import { IconArrow, IconCheck } from "./Icons";
import { Reveal } from "./Reveal";

export function Pricing() {
  return (
    <section id="pricing" className="relative border-y border-ink-800 bg-ink-900/30 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="text-center">
          <p className="font-mono text-[0.75rem] tracking-[0.22em] text-acid-400 uppercase">{site.pricing.eyebrow}</p>
          <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.03em] text-white text-balance-tight sm:text-[2.6rem] sm:leading-[1.1]">
            {site.pricing.title}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-[1.02rem] leading-relaxed text-white/55">{site.pricing.body}</p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {site.pricing.tiers.map((tier, i) => (
            <Reveal key={tier.name} delay={i * 90}>
              <article
                className={`relative flex h-full flex-col rounded-2xl border p-7 ${
                  tier.featured
                    ? "acid-glow border-acid-400/40 bg-gradient-to-b from-ink-850 to-ink-900"
                    : "card bg-ink-900/60"
                }`}
              >
                {tier.featured && (
                  <span className="absolute -top-3 left-7 rounded-full bg-acid-400 px-3 py-1 font-mono text-[0.75rem] font-semibold tracking-wider text-ink-950 uppercase">
                    Most popular
                  </span>
                )}

                <h3 className="text-sm font-semibold tracking-wide text-white uppercase">{tier.name}</h3>
                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="font-mono text-4xl font-semibold tracking-tight text-white">{tier.price}</span>
                  <span className="text-sm text-white/40">{tier.period}</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-white/55">{tier.blurb}</p>

                <ul className="mt-6 flex-1 space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex gap-3 text-sm text-white/65">
                      <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-acid-400" />
                      {f}
                    </li>
                  ))}
                </ul>

                {"note" in tier && tier.note && (
                  <p className="mt-6 font-mono text-[0.75rem] text-acid-400">{tier.note}</p>
                )}

                <a
                  href={tier.cta.href}
                  className={`group mt-6 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors ${
                    tier.featured
                      ? "bg-acid-400 text-ink-950 hover:bg-acid-300"
                      : "border border-ink-700 bg-ink-850/60 text-white/85 hover:border-ink-600 hover:text-white"
                  }`}
                >
                  {tier.cta.label}
                  <IconArrow className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </a>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <p className="mt-10 text-center text-xs leading-relaxed text-white/35">
            Usage billed at cost + 15% during beta. Budget caps and hard spend limits are included on every plan.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

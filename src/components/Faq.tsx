import { useState } from "react";
import { site } from "../site";
import { Reveal } from "./Reveal";

/** Accordion answer: grid-rows trick animates height without measuring. */
function FaqItem({
  q,
  a,
  index,
  open,
  onToggle,
}: {
  q: string;
  a: string;
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={`faq-panel-${index}`}
          className="flex w-full items-start gap-4 py-5 text-left"
        >
          <span className="flex-1 text-[0.98rem] font-medium text-white/90">{q}</span>
          <span
            aria-hidden="true"
            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-acid-400 transition-colors duration-300 ${
              open ? "border-acid-400/50 bg-acid-400/10" : "border-ink-700"
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
              <path d="M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path
                d="M12 5v14"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                className={`origin-center transition-transform duration-300 ${open ? "scale-y-0" : "scale-y-100"}`}
              />
            </svg>
          </span>
        </button>
      </h3>
      <div
        id={`faq-panel-${index}`}
        aria-hidden={!open}
        className={`grid transition-all duration-300 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="pr-10 pb-5 text-sm leading-relaxed text-white/55">{a}</p>
        </div>
      </div>
    </div>
  );
}

export function Faq() {
  const [open, setOpen] = useState<number>(0);

  return (
    <section id="faq" className="relative border-t border-ink-800 py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
        <Reveal>
          <p className="font-mono text-[0.75rem] tracking-[0.22em] text-acid-400 uppercase">FAQ</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-white text-balance-tight sm:text-4xl">
            Questions we get on every call.
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-white/50">
            Anything else?{" "}
            <a
              href="#waitlist"
              className="text-acid-400 underline decoration-acid-400/30 underline-offset-4 hover:decoration-acid-400"
            >
              Ask us directly
            </a>{" "}
            — a founder answers.
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div className="divide-y divide-ink-800 border-y border-ink-800">
            {site.faq.map((item, i) => (
              <FaqItem
                key={item.q}
                q={item.q}
                a={item.a}
                index={i}
                open={open === i}
                onToggle={() => setOpen(open === i ? -1 : i)}
              />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

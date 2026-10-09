import { useState, type FormEvent } from "react";
import { site } from "../site";
import { IconArrow, IconCheck } from "./Icons";
import { Reveal } from "./Reveal";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function Waitlist() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "error" | "done">("idle");
  const [message, setMessage] = useState("");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = email.trim();

    if (!EMAIL_RE.test(value)) {
      setState("error");
      setMessage("That doesn't look like a work email — check for a typo.");
      return;
    }

    // Static landing page: no backend yet. Store locally so the intent survives a reload,
    // and swap this for a POST to your waitlist endpoint (or Vercel form handler).
    try {
      const existing = JSON.parse(window.localStorage.getItem("trellis.waitlist") ?? "[]") as string[];
      if (!existing.includes(value)) existing.push(value);
      window.localStorage.setItem("trellis.waitlist", JSON.stringify(existing));
    } catch {
      /* private mode / storage disabled — still show success */
    }

    setState("done");
    setMessage(site.waitlist.success);
    setEmail("");
  }

  return (
    <section id="waitlist" className="relative overflow-hidden py-24 sm:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-grid-fade absolute inset-0" />
        <div className="absolute bottom-[-16rem] left-1/2 h-[32rem] w-[52rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(79,107,255,0.18),transparent)] blur-2xl" />
      </div>

      <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
        <Reveal>
          <h2 className="text-3xl font-semibold tracking-[-0.03em] text-white text-balance-tight sm:text-[2.6rem] sm:leading-[1.1]">
            {site.waitlist.title}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[1.02rem] leading-relaxed text-white/55">{site.waitlist.body}</p>
        </Reveal>

        <Reveal delay={120}>
          <form onSubmit={onSubmit} noValidate className="mx-auto mt-9 flex max-w-lg flex-col gap-3 sm:flex-row">
            <label htmlFor="waitlist-email" className="sr-only">
              Work email
            </label>
            <input
              id="waitlist-email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder={site.waitlist.placeholder}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (state === "error") setState("idle");
              }}
              aria-invalid={state === "error"}
              aria-describedby="waitlist-status"
              className={`h-12 flex-1 rounded-xl border bg-ink-900/80 px-4 text-sm text-white placeholder:text-white/30 focus:outline-none ${
                state === "error"
                  ? "border-red-400/60"
                  : "border-ink-700 focus:border-acid-400/60"
              }`}
            />
            <button
              type="submit"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-acid-400 px-6 text-sm font-semibold text-ink-950 transition-colors hover:bg-acid-300"
            >
              {site.waitlist.submit}
              <IconArrow className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </form>

          <p
            id="waitlist-status"
            role="status"
            aria-live="polite"
            className={`mx-auto mt-4 flex min-h-5 items-center justify-center gap-2 text-sm ${
              state === "error" ? "text-red-300" : state === "done" ? "text-acid-400" : "text-white/35"
            }`}
          >
            {state === "done" && <IconCheck className="h-4 w-4" />}
            {state === "idle" ? site.waitlist.micro : message}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

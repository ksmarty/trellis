import { site } from "../site";
import { Mark } from "./Icons";

export function Footer() {
  return (
    <footer className="border-t border-ink-800 bg-ink-950">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <Mark className="h-7 w-7" />
              <span className="text-[0.95rem] font-semibold tracking-tight text-white">{site.name}</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/45">{site.footer.tagline}</p>

            <div className="mt-5 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-acid-400" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-acid-400" />
              </span>
              <span className="font-mono text-[0.75rem] text-white/40">All systems operational</span>
            </div>
          </div>

          {site.footer.columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="font-mono text-[0.75rem] tracking-[0.18em] text-white/35 uppercase">{col.title}</h3>
              <ul className="mt-4 space-y-1">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="inline-block py-1 text-sm text-white/55 transition-colors hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-ink-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/35">{site.footer.legal}</p>
          <p className="font-mono text-[0.75rem] text-white/25">
            Built with the open-source runtime it advertises.
          </p>
        </div>
      </div>
    </footer>
  );
}

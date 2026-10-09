import { site } from "../site";
import { useActiveSection, useScrolled } from "../lib/hooks";
import { IconArrow, IconStar, Mark } from "./Icons";

export function Nav() {
  const scrolled = useScrolled(16);
  const ids = site.nav.map((n) => n.href.replace("#", ""));
  const active = useActiveSection(ids);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-ink-700/80 bg-ink-950/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5 sm:h-[4.5rem] sm:px-8">
        <a href="#top" className="group flex items-center gap-2.5" aria-label={`${site.name} home`}>
          <Mark className="h-7 w-7 transition-transform duration-300 group-hover:rotate-6" />
          <span className="text-[0.95rem] font-semibold tracking-tight text-white">{site.name}</span>
          <span className="hidden rounded-full border border-ink-600 px-2 py-0.5 font-mono text-[0.75rem] tracking-wider text-acid-400 uppercase sm:inline">
            beta
          </span>
        </a>

        <nav aria-label="Sections" className="ml-auto hidden items-center gap-1 lg:flex">
          {site.nav.map((item) => {
            const isActive = active === item.href.replace("#", "");
            return (
              <a
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive ? "text-white" : "text-white/60 hover:text-white"
                }`}
              >
                {item.label}
                <span
                  className={`mt-1 block h-px origin-left bg-acid-400 transition-transform duration-300 ${
                    isActive ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </a>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <a
            href={site.secondaryCta.href}
            className="hidden items-center gap-1.5 rounded-lg border border-ink-700 px-3.5 py-2 text-sm text-white/75 transition-colors hover:border-ink-600 hover:text-white sm:flex"
          >
            <IconStar className="h-3.5 w-3.5 text-acid-400" />
            17.4k
          </a>
          <a
            href={site.primaryCta.href}
            className="group flex items-center gap-1.5 rounded-lg bg-acid-400 px-3.5 py-2 text-sm font-semibold text-ink-950 transition-colors hover:bg-acid-300"
          >
            {site.primaryCta.label}
            <IconArrow className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </header>
  );
}

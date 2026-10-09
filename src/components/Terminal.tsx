import { useEffect, useState } from "react";
import { site } from "../site";

/** Types out the deploy log line by line, loop-free: it plays once and stops. */
export function Terminal() {
  const lines = site.terminal.lines;
  const [shown, setShown] = useState(0);
  const [chars, setChars] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setShown(lines.length);
      setDone(true);
      return;
    }

    const current = lines[shown];
    if (!current) {
      setDone(true);
      return;
    }

    if (chars < current.text.length) {
      const t = window.setTimeout(() => setChars((c) => c + 2), current.kind === "cmd" ? 26 : 9);
      return () => window.clearTimeout(t);
    }

    const t = window.setTimeout(
      () => {
        setShown((s) => s + 1);
        setChars(0);
      },
      current.kind === "cmd" ? 320 : 170,
    );
    return () => window.clearTimeout(t);
  }, [shown, chars, lines]);

  return (
    <div className="overflow-hidden rounded-xl border border-ink-700 bg-ink-900/90 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.95)] backdrop-blur">
      <div className="flex items-center gap-2 border-b border-ink-700/80 bg-ink-850/80 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/80" />
        <span className="ml-2 font-mono text-[0.75rem] tracking-wide text-white/45">{site.terminal.title}</span>
        <span className="ml-auto flex items-center gap-1.5 font-mono text-[0.75rem] text-acid-400/80">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-acid-400" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-acid-400" />
          </span>
          live
        </span>
      </div>

      <div className="min-h-[19rem] space-y-1.5 p-4 font-mono text-[0.8rem] leading-relaxed sm:text-[0.8rem]">
        {lines.slice(0, shown).map((line, i) => (
          <TerminalLine key={i} kind={line.kind} text={line.text} />
        ))}
        {!done && lines[shown] && (
          <TerminalLine kind={lines[shown].kind} text={lines[shown].text.slice(0, chars)} caret />
        )}
        {done && <div className="pt-1 text-white/30">$ trellis status --watch</div>}
      </div>
    </div>
  );
}

function TerminalLine({
  kind,
  text,
  caret = false,
}: {
  kind: "cmd" | "ok" | "dim";
  text: string;
  caret?: boolean;
}) {
  const color =
    kind === "cmd" ? "text-white/90" : kind === "ok" ? "text-acid-400" : "text-white/40";

  return (
    <div className={`flex gap-2 ${color}`}>
      {kind === "cmd" && <span className="shrink-0 text-acid-400/70">$</span>}
      <span className="break-all">
        {text}
        {caret && <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 animate-blink bg-acid-400" />}
      </span>
    </div>
  );
}

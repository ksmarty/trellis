import { CtaBand } from "./components/CtaBand";
import { Faq } from "./components/Faq";
import { Features } from "./components/Features";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { LogoMarquee } from "./components/LogoMarquee";
import { Nav } from "./components/Nav";
import { OpenSource } from "./components/OpenSource";
import { Platform } from "./components/Platform";
import { Pricing } from "./components/Pricing";
import { Waitlist } from "./components/Waitlist";
import { site } from "./site";

export default function App() {
  return (
    <div className="min-h-screen bg-ink-950 antialiased">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-acid-400 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink-950"
      >
        Skip to content
      </a>

      <Nav />

      <main id="main" tabIndex={-1}>
        <Hero />
        <LogoMarquee />
        <Features />
        <Platform />
        <OpenSource />
        <Pricing />
        <Waitlist />
        <Faq />
        <CtaBand />
      </main>

      <Footer />

      <span className="sr-only">{site.tagline}</span>
    </div>
  );
}

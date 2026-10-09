# Trellis — landing page

Single-page marketing site for an open-source AI developer runtime positioned as an
early-stage hosted platform. Static build, deployed on Vercel.

## Stack

Vite 6 · React 18 · TypeScript (strict) · Tailwind CSS v4 · zero runtime dependencies.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production bundle into dist/
npm run preview  # serve the built bundle
npm run lint
```

## Editing content

**All copy, links, pricing tiers, features, stats and FAQ entries live in
`src/site.ts`.** Rebrand by editing that one file — the components read from it and
nothing is hard-coded in JSX. Set your own repo URL in `site.oss.links` before
deploying.

## Sections

Nav (sticky, scroll-spy) · Hero + animated terminal · logo marquee · stats ·
features grid · self-hosted vs cloud comparison · open-source section with a
mock repo card · beta pricing · waitlist form · FAQ accordion · CTA band · footer.

## Deploy to Vercel

`vercel.json` is committed, so the defaults are picked up automatically:

1. Push this directory to a Git repo (or run `vercel` from the CLI in this folder).
2. In Vercel: **New Project → Import**. Framework preset is detected as **Vite**.
3. Build command `npm run build`, output directory `dist`. No environment
   variables are needed.
4. Deploy. Then add your domain under **Settings → Domains**.

## Waitlist form

The form is client-side only: it validates the email, writes it to
`localStorage.trellis.waitlist`, and shows a success state. To collect real
signups, replace the body of `onSubmit` in `src/components/Waitlist.tsx` with a
`fetch` POST to your endpoint — or use a Vercel serverless function at
`api/waitlist.ts` (this project would then need `outputDirectory: "dist"` plus an
`api/` directory; Vercel picks those up automatically).

## Notes

- No `crypto.randomUUID()` anywhere — ids use counters/indices, so the page also
  works inside insecure (http) iframes.
- Animations respect `prefers-reduced-motion`.
- Accessibility: skip link, labelled landmarks, `aria-expanded` accordion,
  `aria-live` form status, visible focus rings.

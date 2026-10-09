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

## Checks

`npm test` renders the whole page server-side and asserts that every section is
present. The rest drive a real headless Chromium against the running dev server
(start `npm run dev` first, or point them at a URL):

```bash
npm test                                        # SSR render + content assertions
npm run check:browser                           # 23 checks: load, interaction, no console errors
npm run check:a11y                              # 21 checks: landmarks, headings, focus, reduced motion
npm run check:layout                            # shared gutter, no overlap, rhythm
npm run audit:contrast                          # contrast, tiny text, overlap, at three widths
npm run shot -- out.png <url> 1440 1            # full-page screenshot (PNG, no deps)
node scripts/png-view.mjs out.png 120 60        # ASCII view of a screenshot
```

`check:browser`, `check:a11y`, `check:layout` and `audit:contrast` accept a URL as
the first argument, so they work against the preview URL or a deployed domain.

## Editing content

**All copy, links, pricing tiers, features, stats and FAQ entries live in
`src/site.ts`.** Rebrand by editing that one file — the components read from it and
nothing is hard-coded in JSX.

The repository is defined once, at the top of that file:

```ts
const REPO_URL = "https://github.com/ksmarty/trellis";  // this repo
const REPO_STARS = "17.4k";                             // demo figure
```

`site.repo` derives every other link from `REPO_URL` (README, issues, source tree,
clone command), so pointing the site at a different repo is a one-line change.

## What matches the repo, and what is still fiction

Every outbound link on the page resolves to a real target: `github.com/ksmarty/trellis`
is the repo this site lives in, and the `/tree/main/src`, `/issues` and `#readme`
paths all resolve. `npm run check:browser` fails the build if a dead `href="#"`
reappears or if a repo link is dropped.

Still invented for the demo, and **not** true of this repo — replace before
publishing anything you want taken literally:

- traction figures: GitHub stars (17.4k), contributors (620+), downloads (4.1M),
  uptime (99.95%)
- named customers in the logo marquee
- the runtime itself: `@trellis/cli`, `trellis deploy`, `*.trellis.run` domains,
  `docker compose` services, and the hosted-cloud control plane
- the Apache-2.0 licence claim — there is no `LICENSE` file in this repo yet.

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
  works inside insecure (http) iframes. `scripts/smoke.tsx` asserts this.
- Animations respect `prefers-reduced-motion` (verified in `check:a11y`).
- Accessibility: skip link, labelled landmarks, `aria-expanded` accordion,
  `aria-live` form status, visible focus rings.
- The screenshots in `.review/` are local scratch output and are git-ignored.
- Placeholder numbers (stars, contributors, uptime, customer logos) are invented
  for the demo — see "What matches the repo, and what is still fiction" above.

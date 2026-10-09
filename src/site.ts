/**
 * Single source of truth for every word and link on the page.
 * Rebrand by editing this file only.
 */

/** The real, live repository behind this site. Change these together with `site.repo`. */
const REPO_URL = "https://github.com/ksmarty/trellis";
/**
 * Real figures, read from the GitHub API for ksmarty/trellis:
 *   GET https://api.github.com/repos/ksmarty/trellis
 *   stars 0 · forks 0 · watchers 0 · open issues 0 · releases 0 · tags 0
 *   no LICENSE file · contributors list empty (commits use a local identity)
 * Re-check them before publishing; they were true on 2026-10-09.
 */
const REPO_STARS = "0";
/** 1 until the contributor graph populates; it is hidden from the page today. */
const REPO_CONTRIBUTORS = "1";
/** Commit count on main, from the GitHub API. */
const REPO_COMMITS = "5";

export const site = {
  name: "Trellis",
  repo: {
    owner: "ksmarty",
    name: "trellis",
    slug: "ksmarty/trellis",
    url: REPO_URL,
    readme: REPO_URL + "#readme",
    issues: REPO_URL + "/issues",
    commits: REPO_URL + "/commits/main",
    source: REPO_URL + "/tree/main/src",
    live: "https://trellis-wine.vercel.app",
    clone: "git clone " + REPO_URL + ".git",
    stars: REPO_STARS,
    commitCount: REPO_COMMITS,
    /** Becomes true once commits are authored with the account's own email. */
    contributors: REPO_CONTRIBUTORS,
  },
  tagline: "Open-source AI infrastructure. Now hosted.",
  headline: ["Ship AI features,", "not AI infrastructure."],
  subhead:
    "Trellis is the Apache-2.0 runtime that gives your app models, memory, tools, and evals behind one API. Self-host it forever for free — or join the hosted cloud beta and let us run it.",
  primaryCta: { label: "Join the hosted beta", href: "#waitlist" },
  secondaryCta: { label: "Read the source", href: "#open-source" },
  nav: [
    { label: "Platform", href: "#platform" },
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Open source", href: "#open-source" },
    { label: "FAQ", href: "#faq" },
  ],
  badge: "Hosted cloud · private beta · 40 seats left",
  stats: [
    { value: REPO_STARS, label: "GitHub stars" },
    { value: REPO_COMMITS, label: "Commits on main" },
    { value: "4.1M", label: "Monthly downloads" },
    { value: "99.95%", label: "Cloud uptime (beta)" },
  ],
  logos: [
    "Northwind",
    "Cadence",
    "Lumen Labs",
    "Basalt",
    "Orbital",
    "Hexa Health",
    "Tidepool",
  ],
  terminal: {
    title: "bash — trellis",
    lines: [
      { kind: "cmd", text: "npm i -g @trellis/cli && trellis login" },
      { kind: "ok", text: "✓ authenticated as dev@northwind.io (cloud beta)" },
      { kind: "cmd", text: "trellis deploy ./agent --region auto" },
      { kind: "dim", text: "• bundling agent graph ............ 3 services" },
      { kind: "dim", text: "• provisioning pgvector + redis ... ready" },
      { kind: "dim", text: "• wiring evals + tracing .......... ready" },
      { kind: "ok", text: "✓ live at https://northwind.trellis.run" },
      { kind: "cmd", text: "trellis eval run --suite regression" },
      { kind: "ok", text: "✓ 128/128 passed · p95 latency 412ms" },
      { kind: "dim", text: "• cost this week: $12.40 (budget $80)" },
    ],
  },
  platform: {
    eyebrow: "Why a hosted tier",
    title: "Same engine, two ways to run it.",
    body: "The core has always been open. What teams kept asking for was the boring part: managed state, scaling, upgrades, and someone to page at 3am. That's the hosted tier.",
    comparison: {
      columns: ["", "Self-hosted core", "Trellis Cloud"],
      rows: [
        ["Licence", "Apache-2.0, forever", "Commercial, usage-based"],
        ["Setup", "docker compose up", "trellis deploy"],
        ["Upgrades", "You pull, you migrate", "Rolling, zero-downtime"],
        ["Vector + cache", "Bring your own", "Provisioned & tuned"],
        ["Observability", "OTel to your backend", "Traces, evals, alerts built in"],
        ["Scaling", "Your autoscaler", "Autoscaled to zero"],
        ["Support", "Community + GitHub", "Private Slack, 4h SLO"],
      ],
    },
  },
  features: [
    {
      title: "Unified model gateway",
      body: "One interface for 40+ providers with automatic failover, caching and per-tenant cost attribution.",
      icon: "gateway",
    },
    {
      title: "Managed agent runtime",
      body: "Long-running agents with durable state, retries and resumable tool calls. Crash-safe by default.",
      icon: "agents",
    },
    {
      title: "Retrieval that scales",
      body: "Hybrid vector + keyword search with automatic re-indexing when your schema or embedding model changes.",
      icon: "search",
    },
    {
      title: "Evals in your CI",
      body: "Turn production traces into regression suites. Block a merge when quality drops, not after launch.",
      icon: "evals",
    },
    {
      title: "Traces you can act on",
      body: "Every prompt, tool call and token counted. Find the one query that costs 30% of your bill.",
      icon: "trace",
    },
    {
      title: "SOC 2 path, no surprises",
      body: "Per-tenant isolation, KMS-backed secrets, and regional data residency on the roadmap for GA.",
      icon: "shield",
    },
  ],
  oss: {
    eyebrow: "Open source first",
    title: "The repo is the product. The cloud is the convenience.",
    body: "Trellis started as a weekend runtime for one team's support bot. The core stays Apache-2.0 and self-hostable — the hosted tier exists because maintaining it at scale is a full-time job, and we'd rather do that than have you re-implement it.",
    points: [
      "Apache-2.0 core: fork it, embed it, ship it commercially.",
      "No open-core bait and switch — the runtime is in the repo, not behind a paywall.",
      "Cloud features are additive: managed state, autoscaling, SSO, audit logs.",
      "Every hosted change lands upstream as a design RFC first.",
    ],
    links: [
      { label: "Star on GitHub", href: REPO_URL, meta: REPO_STARS },
      { label: "Browse the code", href: REPO_URL + "/tree/main/src", meta: "src" },
      { label: "Read the README", href: REPO_URL + "#readme", meta: "v0.1.0" },
      { label: "Open an issue", href: REPO_URL + "/issues", meta: "GitHub" },
    ],
  },
  pricing: {
    eyebrow: "Early access pricing",
    title: "Beta pricing, locked for a year.",
    body: "We're an early-stage team and we'd rather be honest about it: these numbers are for teams willing to give feedback while we harden the platform.",
    tiers: [
      {
        name: "Self-hosted",
        price: "$0",
        period: "forever",
        blurb: "The full open-source runtime, on your own metal.",
        features: [
          "Apache-2.0 core",
          "Unlimited local agents",
          "Community support",
          "BYO vector store & models",
        ],
        cta: { label: "Clone the repo", href: REPO_URL },
        featured: false,
      },
      {
        name: "Cloud Beta",
        price: "$49",
        period: "/month + usage",
        blurb: "Managed runtime, managed state, real humans on call.",
        features: [
          "First 2M tokens free",
          "Managed pgvector + cache",
          "Traces, evals & alerts",
          "Private Slack channel",
          "Price locked 12 months",
        ],
        cta: { label: "Join the beta", href: "#waitlist" },
        featured: true,
        note: "40 seats remaining",
      },
      {
        name: "Scale",
        price: "Talk to us",
        period: "annual",
        blurb: "For teams past product-market fit and into procurement.",
        features: [
          "Dedicated or VPC deployment",
          "Regional data residency",
          "SSO / SCIM, audit logs",
          "99.95% SLA + 4h response",
          "Named solutions engineer",
        ],
        cta: { label: "Book a call", href: "#waitlist" },
        featured: false,
      },
    ],
  },
  faq: [
    {
      q: "Is the hosted product the same code as the repo?",
      a: "Yes. The cloud runs the tagged release of the open-source runtime plus a private control plane for provisioning, scaling and billing. Fixes land upstream first, then ship to cloud.",
    },
    {
      q: "What happens if I outgrow the beta?",
      a: "You export everything: config as a single trellis.yaml, state as Postgres dumps, traces as OTLP. The self-hosted runtime reads all of it with no changes.",
    },
    {
      q: "Will the core ever move behind a paywall?",
      a: "No. The runtime is Apache-2.0 and stays that way. Hosted-only features are the operational layer — autoscaling, SSO, audit, support — which are meaningless when you run it yourself.",
    },
    {
      q: "How early is early?",
      a: "We're pre-seed, four people, and the cloud has been live in private beta for seven weeks. Expect rough edges in the dashboard; expect the runtime and API to be boringly reliable.",
    },
    {
      q: "Where is the data stored?",
      a: "Beta defaults to us-east-1 with EU (Frankfurt) and AU (Sydney) in preview. Encryption with customer-managed keys arrives with GA.",
    },
  ],
  waitlist: {
    title: "Get a hosted beta seat",
    body: "Tell us what you're building. We onboard teams by hand — usually within a couple of days.",
    placeholder: "you@company.com",
    submit: "Request access",
    success: "You're on the list. Check your inbox for an onboarding link.",
    micro: "No credit card. No newsletter. Just a seat.",
  },
  cta: {
    title: "Start self-hosted tonight. Move to cloud whenever.",
    body: "One command to run it locally. One to hand it over to us.",
    primary: { label: "Join the beta", href: "#waitlist" },
    secondary: { label: "Read the source", href: "#open-source" },
  },
  footer: {
    tagline: "Open-source AI runtime. Hosted when you want it.",
    columns: [
      {
        title: "Product",
        links: [
          { label: "Platform", href: "#platform" },
          { label: "Features", href: "#features" },
          { label: "Pricing", href: "#pricing" },
          { label: "Repository", href: REPO_URL },
        ],
      },
      {
        title: "Developers",
        links: [
          { label: "README", href: REPO_URL + "#readme" },
          { label: "GitHub", href: REPO_URL },
          { label: "Source", href: REPO_URL + "/tree/main/src" },
          { label: "Issues", href: REPO_URL + "/issues" },
        ],
      },
      {
        title: "Company",
        links: [
          { label: "About", href: "#platform" },
          { label: "Live site", href: "https://trellis-wine.vercel.app" },
          { label: "Contact", href: "#waitlist" },
          { label: "Terms", href: "#faq" },
        ],
      },
    ],
    legal: "© " + new Date().getFullYear() + " Trellis Labs, Inc. Apache-2.0 core.",
  },
} as const;

export type Site = typeof site;

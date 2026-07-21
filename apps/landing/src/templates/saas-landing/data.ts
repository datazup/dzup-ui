/**
 * Sample content for the SaaS Landing template (docs/templates.md §6.3).
 * Co-located so the template is self-contained (§7). The hero screenshot is an
 * inline SVG data-URI so the template ships with zero external image assets and
 * re-themes via `currentColor`-free, token-agnostic neutral tones.
 */
import type { Component } from 'vue'
import { BarChart3, ShieldCheck, Workflow, Zap } from 'lucide-vue-next'

export interface Feature {
  icon: Component
  title: string
  body: string
}

export const FEATURES: Feature[] = [
  {
    icon: Zap,
    title: 'Ships in minutes',
    body: 'Connect a source and your first dashboard is live before your coffee cools. No pipelines to babysit.',
  },
  {
    icon: BarChart3,
    title: 'Metrics that explain themselves',
    body: 'Every chart carries context — comparisons, anomalies and plain-language summaries built in.',
  },
  {
    icon: Workflow,
    title: 'Automate the busywork',
    body: 'Trigger alerts, digests and webhooks from any threshold. Your team hears about it before the customer does.',
  },
  {
    icon: ShieldCheck,
    title: 'Enterprise-grade by default',
    body: 'SOC 2 Type II, SSO/SAML, row-level permissions and a 99.99% uptime SLA on every plan.',
  },
]

export interface Testimonial {
  quote: string
  name: string
  role: string
  initials: string
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'We cut our weekly reporting from two days to twenty minutes. Northwind is the first analytics tool the whole company actually opens.',
    name: 'Mara Petrović',
    role: 'VP Operations, Lumen Labs',
    initials: 'MP',
  },
  {
    quote:
      'The automated digests alone replaced a full-time analyst role. Onboarding the team took a single afternoon.',
    name: 'Liam Novak',
    role: 'Head of Growth, Crest',
    initials: 'LN',
  },
  {
    quote:
      'Clean, fast and genuinely self-serve. Our PMs ship decisions on live data instead of waiting on a queue.',
    name: 'Sofia Adeyemi',
    role: 'Director of Product, Vant',
    initials: 'SA',
  },
]

export interface Faq {
  value: string
  q: string
  a: string
}

export const FAQS: Faq[] = [
  {
    value: 'trial',
    q: 'Is there a free trial?',
    a: 'Yes — every plan starts with a 14-day trial of the full feature set. No credit card required, and you keep your dashboards if you downgrade to the free tier.',
  },
  {
    value: 'sources',
    q: 'Which data sources do you support?',
    a: 'Postgres, MySQL, BigQuery, Snowflake, Stripe, Segment and 40+ more out of the box, plus a typed HTTP API for anything custom.',
  },
  {
    value: 'security',
    q: 'How do you handle security and compliance?',
    a: 'We are SOC 2 Type II certified, encrypt data at rest and in transit, and offer SSO/SAML, audit logs and row-level access controls on every plan.',
  },
  {
    value: 'migrate',
    q: 'Can you help us migrate?',
    a: 'Our team will port your existing dashboards and metric definitions for free during onboarding, typically within a week.',
  },
]

/** Customer logo wordmarks (text marks keep the template asset-free). */
export const LOGOS: string[] = ['Lumen', 'Crest', 'Vant', 'Northpeak', 'Orbit', 'Helio']

export const NAV_LINKS: { label: string, href: string }[] = [
  { label: 'Features', href: '#features' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
]

/**
 * The palette used to paint the hero product-screenshot mockup. Values are
 * resolved from live `--dz-*` tokens at runtime (see `buildHeroShot` callers) so
 * the source file carries NO raw hex (§7) and the mockup re-themes with the page.
 */
export interface HeroPalette {
  surface: string
  bar: string
  panel: string
  panelAlt: string
  line: string
  accent: string
  ink: string
}

/**
 * Build a product-screenshot mockup (a faux app window with a sidebar, KPI cards
 * and a bar chart) as an inline SVG data-URI from a resolved token palette. Used
 * as the hero <DzImage> source — keeps the template asset-free and theme-aware.
 */
export function buildHeroShot(p: HeroPalette): string {
  const bars = [60, 90, 120, 84, 140, 110, 164, 140, 190]
  const barRects = bars
    .map((h, i) => `<rect x="${250 + i * 56}" y="${440 - h}" width="38" height="${h}" rx="4"/>`)
    .join('')
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" role="img" aria-label="Product dashboard screenshot">
  <rect width="800" height="500" rx="16" fill="${p.surface}"/>
  <rect x="0" y="0" width="800" height="44" rx="16" fill="${p.panelAlt}"/>
  <rect x="0" y="44" width="190" height="456" fill="${p.ink}"/>
  <rect x="24" y="72" width="120" height="12" rx="6" fill="${p.line}"/>
  <rect x="24" y="120" width="142" height="30" rx="8" fill="${p.accent}"/>
  <rect x="24" y="162" width="142" height="30" rx="8" fill="${p.line}" opacity="0.35"/>
  <rect x="24" y="204" width="142" height="30" rx="8" fill="${p.line}" opacity="0.35"/>
  <rect x="24" y="246" width="142" height="30" rx="8" fill="${p.line}" opacity="0.35"/>
  <rect x="222" y="76" width="160" height="84" rx="12" fill="${p.panel}" stroke="${p.line}"/>
  <rect x="398" y="76" width="160" height="84" rx="12" fill="${p.panel}" stroke="${p.line}"/>
  <rect x="574" y="76" width="200" height="84" rx="12" fill="${p.panel}" stroke="${p.line}"/>
  <rect x="242" y="98" width="60" height="10" rx="5" fill="${p.line}"/>
  <rect x="242" y="122" width="92" height="16" rx="6" fill="${p.accent}"/>
  <rect x="418" y="98" width="60" height="10" rx="5" fill="${p.line}"/>
  <rect x="418" y="122" width="92" height="16" rx="6" fill="${p.accent}"/>
  <rect x="222" y="186" width="552" height="278" rx="12" fill="${p.panel}" stroke="${p.line}"/>
  <rect x="246" y="210" width="120" height="12" rx="6" fill="${p.line}"/>
  <g fill="${p.bar}">${barRects}</g>
</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

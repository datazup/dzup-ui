/**
 * Sample content for the Feature / Product template (docs/templates.md §6.2).
 * Co-located so the template is self-contained (§7): the alternating feature
 * rows, the DzTabs explorer content, the before/after comparison copy, and the
 * spec badges. Every mock screenshot is painted from resolved `--dz-*` tokens
 * (see `buildShot`) so the page ships with zero image assets and re-themes with
 * the page — no raw colour lives in this file.
 */
import type { Component } from 'vue'
import { Boxes, GitBranch, Sparkles, Workflow, Zap } from 'lucide-vue-next'

/** Resolved token palette the SVG mocks are painted from. */
export interface ShotPalette {
  surface: string
  panel: string
  panelAlt: string
  line: string
  accent: string
  accentSoft: string
  ink: string
}

/** The mock compositions the painter can render. */
export type ShotVariant = 'analyze' | 'collaborate' | 'automate' | 'before' | 'after'

function chrome(p: ShotPalette): string {
  return `
  <rect width="800" height="500" rx="16" fill="${p.surface}"/>
  <rect x="0" y="0" width="800" height="40" fill="${p.panelAlt}"/>
  <circle cx="26" cy="20" r="5" fill="${p.line}"/>
  <circle cx="46" cy="20" r="5" fill="${p.line}"/>
  <circle cx="66" cy="20" r="5" fill="${p.line}"/>
  <rect x="300" y="13" width="200" height="14" rx="7" fill="${p.panel}"/>`
}

/**
 * Build one mock "product screenshot" as an inline SVG data-URI from a resolved
 * token palette. Keeps the template asset-free and theme-aware. `variant`
 * selects the composition so feature rows, tabs and the before/after slider each
 * read distinctly.
 */
export function buildShot(p: ShotPalette, variant: ShotVariant): string {
  let body = ''

  if (variant === 'analyze') {
    const bars = [54, 92, 70, 124, 96, 150, 120, 176]
    const rects = bars
      .map((h, i) => `<rect x="${300 + i * 56}" y="${430 - h}" width="36" height="${h}" rx="4" fill="${p.accent}"/>`)
      .join('')
    body = `
      <rect x="24" y="64" width="240" height="86" rx="12" fill="${p.panel}" stroke="${p.line}"/>
      <rect x="280" y="64" width="240" height="86" rx="12" fill="${p.panel}" stroke="${p.line}"/>
      <rect x="536" y="64" width="240" height="86" rx="12" fill="${p.panel}" stroke="${p.line}"/>
      <rect x="44" y="86" width="70" height="10" rx="5" fill="${p.line}"/>
      <rect x="44" y="108" width="120" height="20" rx="6" fill="${p.accent}"/>
      <rect x="300" y="86" width="70" height="10" rx="5" fill="${p.line}"/>
      <rect x="300" y="108" width="120" height="20" rx="6" fill="${p.accentSoft}"/>
      <rect x="24" y="172" width="752" height="296" rx="12" fill="${p.panel}" stroke="${p.line}"/>
      <rect x="48" y="196" width="160" height="12" rx="6" fill="${p.line}"/>
      <polyline points="300,400 356,360 412,380 468,300 524,330 580,250 636,280 700,210" fill="none" stroke="${p.accentSoft}" stroke-width="3"/>
      <g>${rects}</g>`
  }
  else if (variant === 'collaborate') {
    const lane = (x: number, n: number) => {
      let cards = ''
      for (let i = 0; i < n; i++) {
        cards += `<rect x="${x + 12}" y="${108 + i * 80}" width="208" height="68" rx="10" fill="${p.panel}" stroke="${p.line}"/>
        <rect x="${x + 28}" y="${124 + i * 80}" width="120" height="10" rx="5" fill="${p.line}"/>
        <rect x="${x + 28}" y="${144 + i * 80}" width="60" height="12" rx="6" fill="${p.accentSoft}"/>
        <circle cx="${x + 200}" cy="${150 + i * 80}" r="10" fill="${p.accent}"/>`
      }
      return `<rect x="${x}" y="72" width="232" height="404" rx="12" fill="${p.panelAlt}"/>
      <rect x="${x + 12}" y="84" width="100" height="10" rx="5" fill="${p.line}"/>${cards}`
    }
    body = `${lane(24, 3)}${lane(284, 2)}${lane(544, 3)}`
  }
  else if (variant === 'automate') {
    const node = (x: number, y: number, fill: string) =>
      `<rect x="${x}" y="${y}" width="150" height="64" rx="12" fill="${fill}" stroke="${p.line}"/>
       <rect x="${x + 18}" y="${y + 18}" width="80" height="10" rx="5" fill="${p.line}"/>
       <rect x="${x + 18}" y="${y + 36}" width="50" height="10" rx="5" fill="${p.accentSoft}"/>`
    body = `
      <path d="M174 156 H260" stroke="${p.accent}" stroke-width="3" fill="none"/>
      <path d="M410 156 H496 V288 H560" stroke="${p.accent}" stroke-width="3" fill="none"/>
      <path d="M410 188 V356 H560" stroke="${p.line}" stroke-width="3" fill="none"/>
      ${node(24, 124, p.accent)}
      ${node(260, 124, p.panel)}
      ${node(560, 256, p.panel)}
      ${node(560, 324, p.panel)}
      <circle cx="640" cy="120" r="40" fill="${p.accentSoft}"/>
      <rect x="24" y="420" width="752" height="56" rx="12" fill="${p.panel}" stroke="${p.line}"/>`
  }
  else if (variant === 'before') {
    // Cluttered, low-contrast "before" — dense uneven blocks, muted accent.
    let blocks = ''
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 4; c++) {
        blocks += `<rect x="${28 + c * 192}" y="${64 + r * 84}" width="172" height="68" rx="6" fill="${p.panelAlt}" stroke="${p.line}"/>
        <rect x="${40 + c * 192}" y="${78 + r * 84}" width="${60 + ((r + c) % 3) * 30}" height="9" rx="4" fill="${p.line}"/>
        <rect x="${40 + c * 192}" y="${96 + r * 84}" width="${90 + ((r + c) % 2) * 40}" height="9" rx="4" fill="${p.line}"/>`
      }
    }
    body = blocks
  }
  else {
    // Clean, confident "after" — generous spacing, clear hierarchy, accent.
    body = `
      <rect x="40" y="64" width="220" height="404" rx="12" fill="${p.panelAlt}"/>
      <rect x="60" y="88" width="120" height="12" rx="6" fill="${p.accent}"/>
      <rect x="60" y="124" width="160" height="10" rx="5" fill="${p.line}"/>
      <rect x="60" y="148" width="140" height="10" rx="5" fill="${p.line}"/>
      <rect x="60" y="172" width="150" height="10" rx="5" fill="${p.line}"/>
      <rect x="296" y="64" width="464" height="120" rx="12" fill="${p.panel}" stroke="${p.line}"/>
      <rect x="320" y="92" width="180" height="16" rx="8" fill="${p.accent}"/>
      <rect x="320" y="124" width="280" height="10" rx="5" fill="${p.line}"/>
      <rect x="320" y="144" width="240" height="10" rx="5" fill="${p.line}"/>
      <rect x="296" y="204" width="224" height="264" rx="12" fill="${p.panel}" stroke="${p.line}"/>
      <rect x="536" y="204" width="224" height="264" rx="12" fill="${p.panel}" stroke="${p.line}"/>
      <circle cx="408" cy="300" r="56" fill="none" stroke="${p.accentSoft}" stroke-width="16"/>
      <circle cx="408" cy="300" r="56" fill="none" stroke="${p.accent}" stroke-width="16" stroke-dasharray="220 999" transform="rotate(-90 408 300)"/>`
  }

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" role="img" aria-label="Product interface mockup">
  ${chrome(p)}
  ${body}
</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

/** An alternating deep-dive feature row. */
export interface FeatureRow {
  id: string
  eyebrow: string
  icon: Component
  title: string
  body: string
  /** Spec chips rendered under the copy as DzBadges. */
  specs: string[]
  shot: ShotVariant
}

export const FEATURE_ROWS: FeatureRow[] = [
  {
    id: 'analyze',
    eyebrow: 'Analytics',
    icon: Zap,
    title: 'See the whole picture, in real time',
    body: 'Live dashboards stream every metric the moment it changes — no refresh, no overnight batch. Drill from a company-wide KPI down to a single event in two clicks, and pin the views your team checks every morning.',
    specs: ['Sub-second refresh', '40+ sources', 'Saved views'],
    shot: 'analyze',
  },
  {
    id: 'collaborate',
    eyebrow: 'Collaboration',
    icon: GitBranch,
    title: 'Plan and ship without leaving the board',
    body: 'A shared workspace where comments, assignments and status all live next to the work itself. Mentions notify the right people, and every change is tracked so nothing slips between hand-offs.',
    specs: ['Real-time presence', 'Threaded comments', 'Role-based access'],
    shot: 'collaborate',
  },
  {
    id: 'automate',
    eyebrow: 'Automation',
    icon: Workflow,
    title: 'Automate the busywork end to end',
    body: 'Build flows from any trigger — a threshold crossing, a new record, a schedule — and branch them across alerts, webhooks and updates. Set it once and let the platform handle the repetitive 80%.',
    specs: ['Visual builder', 'Conditional branches', 'Typed webhooks'],
    shot: 'automate',
  },
]

/** A tab in the feature explorer. */
export interface FeatureTab {
  value: string
  label: string
  title: string
  body: string
  shot: ShotVariant
}

export const FEATURE_TABS: FeatureTab[] = [
  {
    value: 'dashboards',
    label: 'Dashboards',
    title: 'Dashboards that explain themselves',
    body: 'Every chart carries its own context — comparisons, anomalies and a plain-language summary — so the answer is on the screen, not three queries away.',
    shot: 'analyze',
  },
  {
    value: 'boards',
    label: 'Boards',
    title: 'Boards built for momentum',
    body: 'Drag work across lanes, batch-update with a keystroke, and keep priority badges and assignees visible at a glance. The board is the source of truth.',
    shot: 'collaborate',
  },
  {
    value: 'flows',
    label: 'Flows',
    title: 'Flows you can read like a sentence',
    body: 'A canvas that maps trigger to action to outcome. Branch, delay and fan out — and watch each run light up the path it took in real time.',
    shot: 'automate',
  },
]

/** Headline spec chips for the hero. */
export const HERO_SPECS: string[] = ['SOC 2 Type II', '99.99% uptime', 'EU + US regions']

/** Closing "by the numbers" stats. */
export interface Stat {
  value: string
  label: string
}

export const STATS: Stat[] = [
  { value: '12k+', label: 'Teams onboarded' },
  { value: '4.9/5', label: 'Average rating' },
  { value: '60%', label: 'Less reporting time' },
  { value: '40+', label: 'Native integrations' },
]

export const BRAND_ICON = Boxes
export const COMPARE_ICON = Sparkles

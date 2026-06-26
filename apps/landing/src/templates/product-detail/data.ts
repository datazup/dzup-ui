/**
 * Sample content for the Product Detail template (docs/templates.md §6.4).
 * Co-located so the template is self-contained (§7).
 *
 * The product photography is painted as inline-SVG data-URIs from a palette
 * resolved from live `--dz-*` tokens (see `buildShot` callers), so the file
 * carries NO raw hex, ships zero image assets and re-themes with the page — the
 * studio shot even re-tints when the shopper picks a different colourway.
 */
import type { Component } from 'vue'
import { BatteryCharging, Bluetooth, Feather, ShieldCheck, Sparkles, Waves } from 'lucide-vue-next'

// ---------------------------------------------------------------------------
// Studio product shots (asset-free, token-themed)
// ---------------------------------------------------------------------------

/** Resolved token palette used to paint a headphone studio shot. */
export interface ShotPalette {
  /** Canvas / studio backdrop. */
  surface: string
  /** Cushion + shell body fill. */
  panel: string
  /** Secondary shell fill (inner ring). */
  panelAlt: string
  /** Hairline strokes. */
  line: string
  /** The colourway accent — re-tints with the shopper's selection. */
  accent: string
  /** Ink for the headband + pedestal shadow. */
  ink: string
}

/** Which framing to paint. */
export type ShotView = 'front' | 'side' | 'detail'

/**
 * Paint an over-ear-headphone studio shot as an inline SVG data-URI. `view`
 * selects the framing (front / side profile / cushion macro). The shot is
 * deliberately built from clean geometric primitives so it reads as a premium
 * catalogue render in both themes without shipping a single asset.
 */
export function buildShot(p: ShotPalette, view: ShotView): string {
  const glow = `
    <defs>
      <radialGradient id="g" cx="50%" cy="38%" r="62%">
        <stop offset="0%" stop-color="${p.accent}" stop-opacity="0.20"/>
        <stop offset="100%" stop-color="${p.accent}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="800" height="600" rx="28" fill="${p.surface}"/>
    <rect width="800" height="600" rx="28" fill="url(#g)"/>`

  const pedestal = `<ellipse cx="400" cy="528" rx="208" ry="26" fill="${p.ink}" opacity="0.08"/>`

  let body = ''
  if (view === 'front') {
    body = `
      ${pedestal}
      <path d="M220 348 C 220 150 580 150 580 348" fill="none" stroke="${p.ink}"
            stroke-width="30" stroke-linecap="round"/>
      <rect x="168" y="330" width="104" height="176" rx="46" fill="${p.panel}" stroke="${p.line}" stroke-width="2"/>
      <rect x="528" y="330" width="104" height="176" rx="46" fill="${p.panel}" stroke="${p.line}" stroke-width="2"/>
      <ellipse cx="220" cy="418" rx="30" ry="44" fill="${p.panelAlt}"/>
      <ellipse cx="580" cy="418" rx="30" ry="44" fill="${p.panelAlt}"/>
      <circle cx="220" cy="418" r="17" fill="${p.accent}"/>
      <circle cx="580" cy="418" r="17" fill="${p.accent}"/>`
  } else if (view === 'side') {
    body = `
      ${pedestal}
      <path d="M392 150 C 612 168 632 430 452 484" fill="none" stroke="${p.ink}"
            stroke-width="28" stroke-linecap="round"/>
      <ellipse cx="356" cy="332" rx="158" ry="174" fill="${p.panel}" stroke="${p.line}" stroke-width="2"/>
      <ellipse cx="356" cy="332" rx="98" ry="112" fill="${p.panelAlt}"/>
      <ellipse cx="356" cy="332" rx="54" ry="64" fill="${p.accent}"/>
      <circle cx="356" cy="332" r="16" fill="${p.surface}" opacity="0.7"/>`
  } else {
    body = `
      <rect x="118" y="78" width="564" height="444" rx="64" fill="${p.panel}" stroke="${p.line}" stroke-width="2"/>
      <ellipse cx="400" cy="300" rx="214" ry="208" fill="${p.panelAlt}"/>
      <ellipse cx="400" cy="300" rx="150" ry="150" fill="${p.accent}" opacity="0.16"/>
      <ellipse cx="400" cy="300" rx="150" ry="150" fill="none" stroke="${p.accent}" stroke-width="10"/>
      <circle cx="400" cy="300" r="64" fill="${p.accent}"/>
      <circle cx="400" cy="300" r="64" fill="${p.ink}" opacity="0.08"/>`
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" role="img"
       aria-label="Lumen One headphones studio photo">${glow}${body}</svg>`
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg)
}

// ---------------------------------------------------------------------------
// Product
// ---------------------------------------------------------------------------

/** A selectable colourway. `token` drives both the swatch and the shot accent. */
export interface Colorway {
  name: string
  /** `--dz-*` custom property whose resolved value tints the swatch + shot. */
  token: string
}

/**
 * Colourways are mapped to semantic tokens (not raw hex) so the swatches and
 * the re-tinted studio shot stay theme-correct and ADR-04 compliant.
 */
export const COLORWAYS: Colorway[] = [
  { name: 'Cobalt', token: '--dz-primary' },
  { name: 'Graphite', token: '--dz-foreground' },
  { name: 'Clay', token: '--dz-warning' },
  { name: 'Forest', token: '--dz-success' },
]

/** Gallery framings, in display order. */
export const GALLERY_VIEWS: { id: ShotView; label: string }[] = [
  { id: 'front', label: 'Front' },
  { id: 'side', label: 'Profile' },
  { id: 'detail', label: 'Cushion' },
]

export const PRODUCT = {
  brand: 'Lumen Audio',
  name: 'Lumen One',
  tagline: 'Adaptive over-ear headphones',
  price: 329,
  compareAt: 389,
  rating: 4.8,
  reviewCount: 1284,
  sku: 'LMN-ONE-01',
  blurb:
    'Reference-grade 40 mm drivers, adaptive noise cancelling that reads the room, and a 60-hour battery in a 248 g aluminium frame. Tuned in studio, built for the commute.',
  highlights: [
    'Adaptive ANC',
    '60 h battery',
    'Spatial audio',
    'Multipoint pairing',
  ],
}

// ---------------------------------------------------------------------------
// Specifications
// ---------------------------------------------------------------------------

export interface Spec {
  icon: Component
  label: string
  value: string
}

export const SPECS: Spec[] = [
  { icon: Waves, label: 'Drivers', value: '40 mm beryllium-coated dynamic' },
  { icon: Bluetooth, label: 'Connectivity', value: 'Bluetooth 5.4 · USB-C · 3.5 mm' },
  { icon: BatteryCharging, label: 'Battery', value: '60 h (ANC off) · 38 h (ANC on)' },
  { icon: Feather, label: 'Weight', value: '248 g aluminium frame' },
  { icon: Sparkles, label: 'Audio', value: 'Hi-Res certified · spatial audio' },
  { icon: ShieldCheck, label: 'Warranty', value: '2-year limited + 30-day returns' },
]

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

export interface Review {
  name: string
  initials: string
  rating: number
  date: string
  title: string
  body: string
}

export const REVIEWS: Review[] = [
  {
    name: 'Devon Walsh',
    initials: 'DW',
    rating: 5,
    date: 'May 2026',
    title: 'The ANC is genuinely uncanny',
    body: 'Wore these on a six-hour flight and forgot they were on. The adaptive mode dials itself down when you talk to a flight attendant — no fumbling for buttons.',
  },
  {
    name: 'Priya Anand',
    initials: 'PA',
    rating: 5,
    date: 'April 2026',
    title: 'Studio-flat tuning, finally',
    body: 'I mix on these now. The mids are honest and the soundstage is wide without being scooped. Battery genuinely lasts the work week.',
  },
  {
    name: 'Marco Reyes',
    initials: 'MR',
    rating: 4,
    date: 'April 2026',
    title: 'Superb — wish the case were slimmer',
    body: 'Sound and comfort are five-star. The only nit is the carrying case is a touch bulky for a jacket pocket. Everything else is best in class.',
  },
]

/** Star buckets for the rating breakdown bars (5★ → 1★). */
export const RATING_BREAKDOWN: { stars: number; pct: number }[] = [
  { stars: 5, pct: 82 },
  { stars: 4, pct: 12 },
  { stars: 3, pct: 4 },
  { stars: 2, pct: 1 },
  { stars: 1, pct: 1 },
]

// ---------------------------------------------------------------------------
// Shipping / returns accordion
// ---------------------------------------------------------------------------

export interface InfoPanel {
  value: string
  q: string
  a: string
}

export const INFO_PANELS: InfoPanel[] = [
  {
    value: 'shipping',
    q: 'Shipping',
    a: 'Free carbon-neutral shipping on every order. Dispatched within 24 hours; most regions arrive in 2–4 business days with live tracking.',
  },
  {
    value: 'returns',
    q: 'Returns & warranty',
    a: '30-day no-questions returns and a 2-year limited warranty. Keep the box for the easiest swap, but a return label is one tap away in your account.',
  },
  {
    value: 'box',
    q: "What's in the box",
    a: 'Lumen One headphones, hardshell travel case, USB-C charge cable, 3.5 mm audio cable and a quick-start guide. No single-use plastics.',
  },
]

// ---------------------------------------------------------------------------
// Related products ("Pairs well with")
// ---------------------------------------------------------------------------

export interface RelatedProduct {
  id: string
  name: string
  tagline: string
  price: number
  accentToken: string
  view: ShotView
}

export const RELATED: RelatedProduct[] = [
  { id: 'air', name: 'Lumen Air', tagline: 'Open-ear earbuds', price: 179, accentToken: '--dz-success', view: 'detail' },
  { id: 'studio', name: 'Lumen Studio', tagline: 'Reference monitors', price: 449, accentToken: '--dz-warning', view: 'side' },
  { id: 'go', name: 'Lumen Go', tagline: 'Compact on-ear', price: 149, accentToken: '--dz-primary', view: 'front' },
]

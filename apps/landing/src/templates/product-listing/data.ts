/**
 * Sample content for the Product Listing template (docs/templates.md §6.4).
 * Co-located so the template is self-contained (§7).
 *
 * Like its sibling Product Detail, each card's photography is painted as an
 * inline-SVG data-URI from a palette resolved from live `--dz-*` tokens, so the
 * catalogue ships zero image assets, carries no raw hex and re-themes with the
 * page — every product tile is tinted by its own colourway token.
 */

// ---------------------------------------------------------------------------
// Studio product shot (asset-free, token-themed)
// ---------------------------------------------------------------------------

/** Resolved token palette used to paint a catalogue tile. */
export interface ShotPalette {
  surface: string
  panel: string
  panelAlt: string
  line: string
  accent: string
  ink: string
}

/**
 * Paint a front-facing over-ear-headphone tile as an inline SVG data-URI. The
 * `accent` is the product's colourway token, so each card is tinted to match
 * its swatch — clean geometric primitives keep it a crisp catalogue render in
 * both themes with no shipped assets.
 */
export function buildShot(p: ShotPalette): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 480" role="img" aria-label="Headphones">
  <defs>
    <radialGradient id="g" cx="50%" cy="36%" r="64%">
      <stop offset="0%" stop-color="${p.accent}" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="${p.accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="600" height="480" fill="${p.surface}"/>
  <rect width="600" height="480" fill="url(#g)"/>
  <ellipse cx="300" cy="416" rx="150" ry="20" fill="${p.ink}" opacity="0.08"/>
  <path d="M168 286 C 168 132 432 132 432 286" fill="none" stroke="${p.ink}" stroke-width="24" stroke-linecap="round"/>
  <rect x="128" y="270" width="84" height="142" rx="38" fill="${p.panel}" stroke="${p.line}" stroke-width="2"/>
  <rect x="388" y="270" width="84" height="142" rx="38" fill="${p.panel}" stroke="${p.line}" stroke-width="2"/>
  <ellipse cx="170" cy="340" rx="24" ry="36" fill="${p.panelAlt}"/>
  <ellipse cx="430" cy="340" rx="24" ry="36" fill="${p.panelAlt}"/>
  <circle cx="170" cy="340" r="13" fill="${p.accent}"/>
  <circle cx="430" cy="340" r="13" fill="${p.accent}"/>
</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

/** A colour facet — `token` tints both the swatch and the product tile. */
export interface ColourFacet {
  value: string
  label: string
  token: string
}

export const COLOURS: ColourFacet[] = [
  { value: 'cobalt', label: 'Cobalt', token: '--dz-primary' },
  { value: 'graphite', label: 'Graphite', token: '--dz-foreground' },
  { value: 'clay', label: 'Clay', token: '--dz-warning' },
  { value: 'forest', label: 'Forest', token: '--dz-success' },
  { value: 'rose', label: 'Rose', token: '--dz-danger' },
]

/** Feature facets used by the checkbox filter. */
export const FEATURES: { value: string, label: string }[] = [
  { value: 'anc', label: 'Noise cancelling' },
  { value: 'wireless', label: 'Wireless' },
  { value: 'hires', label: 'Hi-Res audio' },
  { value: 'spatial', label: 'Spatial audio' },
]

/** Sort options for the DzSelect. */
export const SORTS: { value: string, label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
  { value: 'newest', label: 'Newest' },
]

export const PRICE_MIN = 80
export const PRICE_MAX = 480

// ---------------------------------------------------------------------------
// Catalogue
// ---------------------------------------------------------------------------

export type ProductBadge = 'new' | 'sale' | 'bestseller'

export interface Product {
  id: string
  name: string
  /** Form-factor caption under the name. */
  kind: string
  colour: string
  price: number
  compareAt?: number
  rating: number
  reviewCount: number
  features: string[]
  badge?: ProductBadge
  /** Display order for the default "featured" sort (lower = first). */
  rank: number
}

export const PRODUCTS: Product[] = [
  { id: 'one-cobalt', name: 'Lumen One', kind: 'Over-ear · adaptive ANC', colour: 'cobalt', price: 329, compareAt: 389, rating: 4.8, reviewCount: 1284, features: ['anc', 'wireless', 'hires', 'spatial'], badge: 'bestseller', rank: 1 },
  { id: 'studio-graphite', name: 'Lumen Studio', kind: 'Reference monitors', colour: 'graphite', price: 449, rating: 4.9, reviewCount: 412, features: ['wireless', 'hires'], badge: 'new', rank: 2 },
  { id: 'go-clay', name: 'Lumen Go', kind: 'Compact on-ear', colour: 'clay', price: 149, compareAt: 179, rating: 4.5, reviewCount: 906, features: ['wireless'], badge: 'sale', rank: 3 },
  { id: 'air-forest', name: 'Lumen Air', kind: 'Open-ear · all-day', colour: 'forest', price: 179, rating: 4.4, reviewCount: 538, features: ['wireless', 'spatial'], rank: 4 },
  { id: 'one-rose', name: 'Lumen One', kind: 'Over-ear · adaptive ANC', colour: 'rose', price: 329, rating: 4.8, reviewCount: 1284, features: ['anc', 'wireless', 'hires', 'spatial'], rank: 5 },
  { id: 'mini-graphite', name: 'Lumen Mini', kind: 'Travel on-ear', colour: 'graphite', price: 119, compareAt: 139, rating: 4.2, reviewCount: 274, features: ['wireless'], badge: 'sale', rank: 6 },
  { id: 'pro-cobalt', name: 'Lumen One Pro', kind: 'Over-ear · studio ANC', colour: 'cobalt', price: 419, rating: 4.9, reviewCount: 318, features: ['anc', 'wireless', 'hires', 'spatial'], badge: 'new', rank: 7 },
  { id: 'go-forest', name: 'Lumen Go', kind: 'Compact on-ear', colour: 'forest', price: 149, rating: 4.5, reviewCount: 906, features: ['wireless'], rank: 8 },
  { id: 'lite-clay', name: 'Lumen Lite', kind: 'Entry on-ear', colour: 'clay', price: 89, rating: 4.0, reviewCount: 612, features: ['wireless'], rank: 9 },
  { id: 'studio-rose', name: 'Lumen Studio', kind: 'Reference monitors', colour: 'rose', price: 449, rating: 4.9, reviewCount: 412, features: ['wireless', 'hires'], rank: 10 },
  { id: 'air-graphite', name: 'Lumen Air', kind: 'Open-ear · all-day', colour: 'graphite', price: 179, compareAt: 199, rating: 4.4, reviewCount: 538, features: ['wireless', 'spatial'], badge: 'sale', rank: 11 },
  { id: 'one-forest', name: 'Lumen One', kind: 'Over-ear · adaptive ANC', colour: 'forest', price: 329, rating: 4.8, reviewCount: 1284, features: ['anc', 'wireless', 'hires', 'spatial'], rank: 12 },
]

/** Resolve a colour value to its token custom-property name. */
export function colourToken(value: string): string {
  return COLOURS.find(c => c.value === value)?.token ?? '--dz-primary'
}

/** Resolve a colour value to its display label. */
export function colourLabel(value: string): string {
  return COLOURS.find(c => c.value === value)?.label ?? value
}

export const BADGE_LABEL: Record<ProductBadge, string> = {
  new: 'New',
  sale: 'Sale',
  bestseller: 'Best seller',
}

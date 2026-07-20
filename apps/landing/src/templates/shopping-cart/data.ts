/**
 * Sample content for the Shopping Cart template (docs/templates.md §6.5).
 * Co-located so the template is self-contained (§7).
 *
 * The cart belongs to the same specialty grocer as the Checkout template
 * ("Verdant Market"), so the journey browse → cart → checkout reads as one
 * store. Each line carries a `hue` offset only — its thumbnail is an inline SVG
 * data-URI painted from resolved `--dz-*` tokens at runtime (see `buildThumb`),
 * so the template ships NO image assets, carries no raw hex, and the thumbnails
 * re-theme with the page in light + dark.
 */

// ---------------------------------------------------------------------------
// Cart line items
// ---------------------------------------------------------------------------

/** One editable line in the cart. `qty` is mutated live by the DzNumberInput. */
export interface CartLine {
  id: string
  name: string
  /** Variant / pack caption under the name. */
  variant: string
  price: number
  qty: number
  /** Upper bound for the quantity stepper (what the store has on hand). */
  max: number
  /** Optional low-stock nudge shown under the controls. */
  note?: string
  /** Hue offset (degrees) so each thumbnail reads as a distinct tile. */
  hue: number
}

export const CART_LINES: CartLine[] = [
  {
    id: 'beans',
    name: 'Single-origin beans',
    variant: 'Ethiopia Yirgacheffe · 1 kg',
    price: 24,
    qty: 2,
    max: 9,
    hue: 0,
  },
  {
    id: 'sourdough',
    name: 'Stone-baked sourdough',
    variant: 'Country loaf · pack of 2',
    price: 9,
    qty: 1,
    max: 6,
    hue: 60,
  },
  {
    id: 'marmalade',
    name: 'Seville marmalade',
    variant: 'Small-batch · 340 g',
    price: 11,
    qty: 1,
    max: 4,
    note: 'Only 3 jars left',
    hue: 150,
  },
  {
    id: 'oil',
    name: 'Cold-pressed olive oil',
    variant: 'Estate reserve · 500 ml',
    price: 18,
    qty: 1,
    max: 8,
    hue: 210,
  },
]

// ---------------------------------------------------------------------------
// Cross-sell ("You might also like")
// ---------------------------------------------------------------------------

/** A suggested product the shopper can add to the cart in one click. */
export interface SuggestedProduct {
  id: string
  name: string
  variant: string
  price: number
  hue: number
}

export const SUGGESTED: SuggestedProduct[] = [
  { id: 'honey', name: 'Wildflower honey', variant: 'Raw · 250 g', price: 8, hue: 50 },
  { id: 'tea', name: 'First-flush green tea', variant: 'Loose leaf · 100 g', price: 14, hue: 160 },
  { id: 'chocolate', name: 'Dark chocolate bar', variant: '72% · 90 g', price: 6, hue: 20 },
]

// ---------------------------------------------------------------------------
// Pricing rules (shared with the Checkout sibling for a coherent flow)
// ---------------------------------------------------------------------------

/** Orders at or above this subtotal earn free standard shipping. */
export const FREE_SHIPPING_THRESHOLD = 60
/** Standard shipping fee charged below the free threshold. */
export const STANDARD_SHIPPING = 5.9
/** Sales tax applied to the discounted subtotal. */
export const TAX_RATE = 0.08
/** The one promo code the demo honours, and the fraction it takes off. */
export const PROMO_CODE = 'VERDANT10'
export const PROMO_RATE = 0.1

// ---------------------------------------------------------------------------
// Token-painted thumbnails (keeps the template asset-free and theme-aware)
// ---------------------------------------------------------------------------

/** Palette resolved from live `--dz-*` tokens; passed to the thumbnail painter. */
export interface ThumbPalette {
  bg: string
  panel: string
  primary: string
  line: string
}

/**
 * Build a square product thumbnail — a soft, layered tile rotated by `hue` so
 * each product reads as distinct — as an inline SVG data-URI. The `hue` rotates
 * the token-derived primary so tiles stay on-theme yet visually varied.
 */
export function buildThumb(p: ThumbPalette, hue: number): string {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" role="img" aria-label="Product thumbnail">
  <defs>
    <filter id="t" color-interpolation-filters="sRGB">
      <feColorMatrix type="hueRotate" values="${hue}"/>
    </filter>
  </defs>
  <rect width="160" height="160" fill="${p.bg}"/>
  <g filter="url(#t)">
    <circle cx="118" cy="44" r="58" fill="${p.primary}" opacity="0.20"/>
    <rect x="34" y="58" width="92" height="68" rx="14" fill="${p.panel}" stroke="${p.line}"/>
    <rect x="48" y="74" width="50" height="12" rx="6" fill="${p.primary}"/>
    <rect x="48" y="94" width="64" height="8" rx="4" fill="${p.line}"/>
    <circle cx="112" cy="104" r="14" fill="${p.primary}" opacity="0.75"/>
  </g>
</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

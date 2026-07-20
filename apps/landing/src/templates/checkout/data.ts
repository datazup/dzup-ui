/**
 * Sample content for the Checkout template (docs/templates.md §6.4).
 * Co-located so the template is self-contained (§7).
 *
 * Unlike the headphone storefront siblings, this template is a specialty-grocer
 * brand ("Verdant Market"), so the cart lines are everyday pantry goods. Each
 * line carries a Lucide glyph and a semantic `--dz-*` tint token for its
 * thumbnail tile — no shipped image assets, no raw hex, theme-correct in both
 * light and dark.
 */
import type { DzSelectItem } from '@dzup-ui/core'
import type { Component } from 'vue'
import { Citrus, Coffee, Croissant } from 'lucide-vue-next'

// ---------------------------------------------------------------------------
// Cart line items
// ---------------------------------------------------------------------------

/** One line in the order summary. `qty` is mutated live by the DzNumberInput. */
export interface CheckoutLine {
  id: string
  name: string
  /** Variant / pack caption under the name. */
  variant: string
  price: number
  qty: number
  /** Lucide glyph painted on the thumbnail tile. */
  icon: Component
  /** `--dz-*` token that tints the line's thumbnail tile. */
  tint: string
}

export const LINE_ITEMS: CheckoutLine[] = [
  {
    id: 'beans',
    name: 'Single-origin beans',
    variant: 'Ethiopia Yirgacheffe · 1 kg',
    price: 24,
    qty: 2,
    icon: Coffee,
    tint: '--dz-primary',
  },
  {
    id: 'sourdough',
    name: 'Stone-baked sourdough',
    variant: 'Country loaf · pack of 2',
    price: 9,
    qty: 1,
    icon: Croissant,
    tint: '--dz-warning',
  },
  {
    id: 'marmalade',
    name: 'Seville marmalade',
    variant: 'Small-batch · 340 g',
    price: 11,
    qty: 1,
    icon: Citrus,
    tint: '--dz-info',
  },
]

// ---------------------------------------------------------------------------
// Delivery methods (DzRadioGroup)
// ---------------------------------------------------------------------------

export interface DeliveryMethod {
  value: string
  label: string
  detail: string
  /** Flat fee added to the order; standard is waived over the free threshold. */
  price: number
}

export const DELIVERY_METHODS: DeliveryMethod[] = [
  { value: 'standard', label: 'Standard', detail: 'Arrives Thu–Fri · chilled box', price: 0 },
  { value: 'express', label: 'Express', detail: 'Next-day before noon', price: 12 },
  { value: 'pickup', label: 'Store pickup', detail: 'Ready in 2 hours · Borough Market', price: 0 },
]

// ---------------------------------------------------------------------------
// Country select
// ---------------------------------------------------------------------------

export const COUNTRIES: DzSelectItem[] = [
  { label: 'United Kingdom', value: 'gb' },
  { label: 'Ireland', value: 'ie' },
  { label: 'France', value: 'fr' },
  { label: 'Germany', value: 'de' },
  { label: 'Netherlands', value: 'nl' },
]

// ---------------------------------------------------------------------------
// Pricing rules
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

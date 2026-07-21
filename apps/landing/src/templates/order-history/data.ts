/**
 * Sample content for the Order History template (docs/templates.md §6.5).
 * Co-located so the template is self-contained (§7).
 *
 * A believable account order history for the same specialty grocer as the
 * Checkout / Shopping Cart siblings ("Verdant Market"), so the whole commerce
 * flow reads as one store. Each order carries an index signature so it satisfies
 * `DzDataView`'s `T extends Record<string, unknown>` (the `#item` slot infers
 * the row type) and a precomputed numeric `sortKey` so recency / total sorting
 * needs no clock read at module load — keeping the data pure and copy-pasteable.
 */

// ---------------------------------------------------------------------------
// Order status
// ---------------------------------------------------------------------------

import type { CanonicalTone } from '@dzup-ui/contracts'

/** Lifecycle states a past order can be in. */
export type OrderStatus = 'delivered' | 'shipped' | 'processing' | 'cancelled'

/** Display label + semantic badge tone for each status. */
export const STATUS_META: Record<OrderStatus, { label: string, tone: CanonicalTone }> = {
  delivered: { label: 'Delivered', tone: 'success' },
  shipped: { label: 'Shipped', tone: 'info' },
  processing: { label: 'Processing', tone: 'warning' },
  cancelled: { label: 'Cancelled', tone: 'danger' },
}

/** Filter chips for the status facet (the leading 'all' shows everything). */
export const STATUS_FILTERS: { value: OrderStatus | 'all', label: string }[] = [
  { value: 'all', label: 'All orders' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'processing', label: 'Processing' },
  { value: 'cancelled', label: 'Cancelled' },
]

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

/** One product within an order (rendered as a DzList row). */
export interface OrderItem {
  name: string
  qty: number
  /** Hue offset (degrees) so each item tile reads as a distinct colour. */
  hue: number
}

/** A past order shown as a card in the DzDataView. */
export interface Order {
  /** Human order reference, e.g. 'VM-20461'. */
  id: string
  /** Display date the order was placed. */
  date: string
  /** Numeric recency key (higher = more recent) for sorting — no clock read. */
  sortKey: number
  status: OrderStatus
  items: OrderItem[]
  /** Order total in dollars. */
  total: number
  /** Index signature so `Order` satisfies DzDataView's `Record<string, unknown>`. */
  [key: string]: unknown
}

export const ORDERS: Order[] = [
  {
    id: 'VM-20489',
    date: 'Jun 22, 2026',
    sortKey: 20260622,
    status: 'processing',
    total: 64.72,
    items: [
      { name: 'Single-origin beans', qty: 2, hue: 0 },
      { name: 'Cold-pressed olive oil', qty: 1, hue: 210 },
    ],
  },
  {
    id: 'VM-20461',
    date: 'Jun 18, 2026',
    sortKey: 20260618,
    status: 'shipped',
    total: 41.18,
    items: [
      { name: 'Stone-baked sourdough', qty: 2, hue: 60 },
      { name: 'Seville marmalade', qty: 1, hue: 150 },
      { name: 'Wildflower honey', qty: 1, hue: 50 },
    ],
  },
  {
    id: 'VM-20402',
    date: 'Jun 9, 2026',
    sortKey: 20260609,
    status: 'delivered',
    total: 88.4,
    items: [
      { name: 'First-flush green tea', qty: 2, hue: 160 },
      { name: 'Single-origin beans', qty: 2, hue: 0 },
      { name: 'Dark chocolate bar', qty: 3, hue: 20 },
    ],
  },
  {
    id: 'VM-20356',
    date: 'May 28, 2026',
    sortKey: 20260528,
    status: 'delivered',
    total: 33.9,
    items: [
      { name: 'Cold-pressed olive oil', qty: 1, hue: 210 },
      { name: 'Seville marmalade', qty: 1, hue: 150 },
    ],
  },
  {
    id: 'VM-20311',
    date: 'May 14, 2026',
    sortKey: 20260514,
    status: 'cancelled',
    total: 27.0,
    items: [{ name: 'Single-origin beans', qty: 1, hue: 0 }],
  },
  {
    id: 'VM-20268',
    date: 'Apr 30, 2026',
    sortKey: 20260430,
    status: 'delivered',
    total: 112.25,
    items: [
      { name: 'Estate olive oil gift box', qty: 1, hue: 200 },
      { name: 'First-flush green tea', qty: 1, hue: 160 },
      { name: 'Wildflower honey', qty: 2, hue: 50 },
      { name: 'Dark chocolate bar', qty: 2, hue: 20 },
    ],
  },
  {
    id: 'VM-20217',
    date: 'Apr 12, 2026',
    sortKey: 20260412,
    status: 'delivered',
    total: 19.5,
    items: [{ name: 'Stone-baked sourdough', qty: 1, hue: 60 }],
  },
]

/** Account summary shown in the header strip. */
export const ACCOUNT = {
  name: 'Maya Okafor',
  email: 'maya.okafor@example.com',
  memberSince: '2024',
}

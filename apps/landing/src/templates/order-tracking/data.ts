/**
 * Sample content for the Order Tracking template (docs/templates.md §6.4).
 * Co-located so the template is self-contained (§7).
 *
 * The brand here ("Atlas Supply") is a home-goods store, distinct from the
 * headphone storefront and the grocer checkout. Line glyphs are Lucide icons on
 * semantic `--dz-*` tinted tiles — no shipped assets, no raw hex, theme-correct
 * in light + dark.
 */
import type { Component } from 'vue'
import { Armchair, Lamp, Package } from 'lucide-vue-next'

// ---------------------------------------------------------------------------
// Delivery progress (DzStepper)
// ---------------------------------------------------------------------------

/** Coarse shipment stages shown in the horizontal progress tracker. */
export const DELIVERY_STAGES: { title: string, description: string }[] = [
  { title: 'Ordered', description: 'Jun 22' },
  { title: 'Packed', description: 'Jun 22' },
  { title: 'Shipped', description: 'Jun 23' },
  { title: 'Out for delivery', description: 'Jun 25' },
  { title: 'Delivered', description: 'Est. Jun 25' },
]

/** Index of the stage currently in progress (0-based). */
export const ACTIVE_STAGE = 3

// ---------------------------------------------------------------------------
// Ordered items
// ---------------------------------------------------------------------------

export interface OrderLine {
  id: string
  name: string
  variant: string
  price: number
  qty: number
  icon: Component
  /** `--dz-*` token that tints the line's thumbnail tile. */
  tint: string
}

export const ORDER_LINES: OrderLine[] = [
  {
    id: 'chair',
    name: 'Lindholm lounge chair',
    variant: 'Oak frame · oat bouclé',
    price: 540,
    qty: 1,
    icon: Armchair,
    tint: '--dz-primary',
  },
  {
    id: 'lamp',
    name: 'Arc floor lamp',
    variant: 'Brushed brass · dimmable',
    price: 189,
    qty: 1,
    icon: Lamp,
    tint: '--dz-warning',
  },
  {
    id: 'throw',
    name: 'Merino throw blanket',
    variant: 'Heather grey · 130 × 180 cm',
    price: 96,
    qty: 2,
    icon: Package,
    tint: '--dz-info',
  },
]

// ---------------------------------------------------------------------------
// Order facts (DzDescriptions)
// ---------------------------------------------------------------------------

export interface OrderFact {
  label: string
  value: string
}

export const ORDER_FACTS: OrderFact[] = [
  { label: 'Order number', value: '#ATL-20461' },
  { label: 'Order date', value: 'June 22, 2026' },
  { label: 'Payment', value: 'Visa ending 4242' },
  { label: 'Carrier', value: 'Atlas Express' },
  { label: 'Tracking number', value: 'AX-7741-203-LDN' },
  { label: 'Delivery window', value: '9:00 AM – 1:00 PM' },
]

export const SHIPPING_ADDRESS = [
  'Maya Okafor',
  '14 Calthorpe Street',
  'London, WC1X 0HG',
  'United Kingdom',
]

// ---------------------------------------------------------------------------
// Tracking history (DzTimeline)
// ---------------------------------------------------------------------------

/** `tone` maps to the DzTimelineItem marker colour. */
export interface TrackingEvent {
  title: string
  detail: string
  when: string
  tone: 'primary' | 'success' | 'neutral'
}

export const TRACKING_EVENTS: TrackingEvent[] = [
  {
    title: 'Out for delivery',
    detail: 'On the van from the London hub — arriving today.',
    when: 'Today, 7:42 AM',
    tone: 'primary',
  },
  {
    title: 'Arrived at local hub',
    detail: 'Atlas Express — London (Bermondsey).',
    when: 'Today, 5:10 AM',
    tone: 'success',
  },
  {
    title: 'In transit',
    detail: 'Departed the Midlands sorting centre.',
    when: 'Jun 24, 9:28 PM',
    tone: 'success',
  },
  {
    title: 'Shipment picked up',
    detail: 'Carrier collected the parcel from our warehouse.',
    when: 'Jun 23, 2:05 PM',
    tone: 'success',
  },
  {
    title: 'Order confirmed',
    detail: 'Payment received and order sent to the warehouse.',
    when: 'Jun 22, 6:31 PM',
    tone: 'neutral',
  },
]

/**
 * Sample data for the Billing & Plans template. Co-located so the template is
 * self-contained and copy-pasteable (docs/templates.md §7). Plausible SaaS
 * billing content — never lorem ipsum (§7 "realistic content").
 */
import type { CanonicalTone } from '@dzup-ui/contracts'

/** A pricing plan card. */
export interface Plan {
  id: string
  name: string
  /** Monthly price in whole dollars (yearly is derived at a discount). */
  monthly: number
  blurb: string
  features: string[]
  current?: boolean
  popular?: boolean
}

export const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    monthly: 0,
    blurb: 'For individuals trying things out.',
    features: ['1 workspace', 'Up to 3 projects', 'Community support'],
  },
  {
    id: 'team',
    name: 'Team',
    monthly: 24,
    blurb: 'For growing teams that ship together.',
    features: ['Unlimited projects', 'Up to 20 seats', 'Priority support', 'Advanced analytics'],
    current: true,
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthly: 79,
    blurb: 'For organizations with scale and controls.',
    features: ['SSO & SAML', 'Audit logs', 'Dedicated support', 'Custom SLA'],
  },
]

/** Per-seat usage breakdown for the DzMeterGroup. */
export const USAGE_SEGMENTS: { label: string; value: number; tone: CanonicalTone }[] = [
  { label: 'Active members', value: 14, tone: 'primary' },
  { label: 'Pending invites', value: 3, tone: 'warning' },
  { label: 'Available', value: 3, tone: 'neutral' },
]

/** Total seats in the current plan (for the meter max + copy). */
export const SEAT_LIMIT = 20

/** Individual resource meters. */
export const RESOURCE_USAGE: { label: string; used: number; total: number; unit: string }[] = [
  { label: 'Storage', used: 68, total: 100, unit: 'GB' },
  { label: 'API calls', used: 412, total: 500, unit: 'k' },
  { label: 'Build minutes', used: 240, total: 1000, unit: 'min' },
]

/** An invoice row. */
export interface Invoice {
  id: string
  date: string
  amount: string
  status: 'Paid' | 'Pending'
}

export const INVOICES: Invoice[] = [
  { id: 'INV-2048', date: 'Jun 1, 2026', amount: '$24.00', status: 'Paid' },
  { id: 'INV-1994', date: 'May 1, 2026', amount: '$24.00', status: 'Paid' },
  { id: 'INV-1941', date: 'Apr 1, 2026', amount: '$24.00', status: 'Paid' },
  { id: 'INV-1888', date: 'Mar 1, 2026', amount: '$24.00', status: 'Paid' },
]

export const INVOICE_TONE: Record<Invoice['status'], CanonicalTone> = {
  Paid: 'success',
  Pending: 'warning',
}

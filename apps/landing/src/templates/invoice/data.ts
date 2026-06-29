/**
 * Sample data for the Invoice template. Co-located so the template stays
 * self-contained and copy-pasteable (docs/templates.md §7). A plausible design
 * studio invoice — never lorem ipsum (§5 "realistic content"). Totals are
 * DERIVED in the component from these line items, so the arithmetic is always
 * internally consistent.
 */

/** Identity of the party issuing the invoice. */
export interface Party {
  name: string
  lines: string[]
  email: string
  /** Tax registration number (or client ref for the recipient). */
  ref: string
  refLabel: string
}

export const ISSUER: Party = {
  name: 'Nightform Studio',
  lines: ['114 Carver Street', 'Sheffield S1 4FU', 'United Kingdom'],
  email: 'billing@nightform.studio',
  ref: 'GB 438 1192 04',
  refLabel: 'VAT no.',
}

export const CLIENT: Party = {
  name: 'Harborline Technologies',
  lines: ['Attn: Noah Kvist', '2200 Marina Boulevard, Suite 540', 'San Francisco, CA 94123'],
  email: 'accounts@harborline.com',
  ref: 'PO-2026-0884',
  refLabel: 'PO ref.',
}

/** Top-line invoice facts shown beside the parties. */
export const INVOICE_META = {
  number: 'INV-2026-0142',
  issued: '2026-06-12',
  due: '2026-07-12',
  /** 'Due' | 'Paid' | 'Overdue' — drives the status badge tone. */
  status: 'Due' as const,
  currency: 'USD',
}

/** A billable line. `amount` is always `qty * unitPrice` (asserted in tests of arithmetic). */
export interface LineItem {
  id: string
  description: string
  detail: string
  qty: number
  unitPrice: number
}

export const LINE_ITEMS: LineItem[] = [
  {
    id: 'li-1',
    description: 'Brand identity system',
    detail: 'Logotype, palette, type scale & guidelines',
    qty: 1,
    unitPrice: 4800,
  },
  {
    id: 'li-2',
    description: 'Marketing website',
    detail: '8 responsive pages, CMS-ready',
    qty: 1,
    unitPrice: 9200,
  },
  {
    id: 'li-3',
    description: 'Design system & component library',
    detail: 'Tokenised Figma + handoff',
    qty: 1,
    unitPrice: 6400,
  },
  {
    id: 'li-4',
    description: 'Motion & interaction polish',
    detail: 'Senior design, hourly',
    qty: 12,
    unitPrice: 140,
  },
  {
    id: 'li-5',
    description: 'Accessibility audit',
    detail: 'WCAG 2.2 AA conformance pass',
    qty: 1,
    unitPrice: 1500,
  },
]

/** Loyalty discount applied to the subtotal (5%). */
export const DISCOUNT_RATE = 0.05
/** VAT applied to the discounted subtotal (20%). */
export const TAX_RATE = 0.2

export const NOTES =
  'Payment is due within 30 days by bank transfer to the account on file. ' +
  'Please quote invoice ' +
  INVOICE_META.number +
  ' as the reference. Thank you for working with us.'

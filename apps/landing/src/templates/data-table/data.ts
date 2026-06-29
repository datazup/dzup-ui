/**
 * Sample data for the Data Table (CRUD list) template. Co-located so the
 * template stays self-contained and copy-pasteable (docs/templates.md §7).
 * Plausible billing-console content — a SaaS customer ledger — never lorem
 * ipsum (§5 "realistic content").
 */
import type { CanonicalTone } from '@dzup-ui/contracts'
import type { DzSelectItem } from '@dzup-ui/core'
import type { Component } from 'vue'
import { Building2, CreditCard, LayoutGrid, LifeBuoy, Receipt, Users } from 'lucide-vue-next'

export type CustomerPlan = 'Free' | 'Starter' | 'Pro' | 'Enterprise'
export type CustomerStatus = 'Active' | 'Trial' | 'Past due' | 'Churned'

/**
 * A row in the customers grid. Extends `Record<string, unknown>` so DzDataGrid's
 * generic `ColumnDef<CustomerRow>` and the `#cell` slot infer cleanly
 * (see [[dzdataview-generic-index-signature]] for the same pattern on DzDataView).
 */
export interface CustomerRow extends Record<string, unknown> {
  id: string
  name: string
  email: string
  company: string
  plan: CustomerPlan
  status: CustomerStatus
  /** Monthly recurring revenue in whole USD. */
  mrr: number
  /** ISO date ('YYYY-MM-DD') so the column sorts chronologically; rendered formatted. */
  created: string
}

/** The seed ledger — 26 rows so the 8-per-page grid spans a few pages. */
export const CUSTOMERS: CustomerRow[] = [
  { id: 'cus_8a21', name: 'Ava Restić', email: 'ava@northwind.io', company: 'Northwind', plan: 'Enterprise', status: 'Active', mrr: 2400, created: '2026-01-12' },
  { id: 'cus_4f09', name: 'Liam Novak', email: 'liam@brightloom.com', company: 'Brightloom', plan: 'Pro', status: 'Active', mrr: 480, created: '2026-02-03' },
  { id: 'cus_2c77', name: 'Mara Petrović', email: 'mara@verdant.co', company: 'Verdant', plan: 'Pro', status: 'Trial', mrr: 0, created: '2026-06-09' },
  { id: 'cus_9b14', name: 'Noah Kvist', email: 'noah@harborline.com', company: 'Harborline', plan: 'Starter', status: 'Active', mrr: 120, created: '2026-03-21' },
  { id: 'cus_6d52', name: 'Sofia Adeyemi', email: 'sofia@luma.studio', company: 'Luma Studio', plan: 'Pro', status: 'Past due', mrr: 480, created: '2026-02-28' },
  { id: 'cus_1e88', name: 'Theo Andersen', email: 'theo@graystone.io', company: 'Graystone', plan: 'Enterprise', status: 'Active', mrr: 3100, created: '2025-11-04' },
  { id: 'cus_7a30', name: 'Priya Nair', email: 'priya@cobalt.dev', company: 'Cobalt', plan: 'Starter', status: 'Active', mrr: 120, created: '2026-04-17' },
  { id: 'cus_3f61', name: 'Sam Okafor', email: 'sam@meridian.app', company: 'Meridian', plan: 'Free', status: 'Trial', mrr: 0, created: '2026-06-15' },
  { id: 'cus_5c19', name: 'Elena Marchetti', email: 'elena@fernwood.co', company: 'Fernwood', plan: 'Pro', status: 'Active', mrr: 520, created: '2026-01-30' },
  { id: 'cus_0b47', name: 'Dario Kovač', email: 'dario@tidalworks.com', company: 'Tidalworks', plan: 'Enterprise', status: 'Active', mrr: 2750, created: '2025-12-19' },
  { id: 'cus_8e93', name: 'Hana Yamamoto', email: 'hana@orchid.io', company: 'Orchid', plan: 'Starter', status: 'Churned', mrr: 0, created: '2025-10-22' },
  { id: 'cus_2a05', name: 'Marcus Bell', email: 'marcus@quanta.co', company: 'Quanta', plan: 'Pro', status: 'Active', mrr: 480, created: '2026-03-08' },
  { id: 'cus_9d72', name: 'Ines Duarte', email: 'ines@solstice.app', company: 'Solstice', plan: 'Free', status: 'Trial', mrr: 0, created: '2026-06-21' },
  { id: 'cus_4b38', name: 'Owen Fletcher', email: 'owen@redpine.dev', company: 'Redpine', plan: 'Starter', status: 'Active', mrr: 120, created: '2026-05-02' },
  { id: 'cus_6f81', name: 'Zara Haddad', email: 'zara@northgate.io', company: 'Northgate', plan: 'Enterprise', status: 'Past due', mrr: 2950, created: '2025-12-01' },
  { id: 'cus_1c46', name: 'Felix Brandt', email: 'felix@arclight.co', company: 'Arclight', plan: 'Pro', status: 'Active', mrr: 600, created: '2026-02-11' },
  { id: 'cus_7e29', name: 'Nadia Sorokin', email: 'nadia@willowbank.com', company: 'Willowbank', plan: 'Starter', status: 'Trial', mrr: 0, created: '2026-06-04' },
  { id: 'cus_3a90', name: 'Caleb Mwangi', email: 'caleb@driftwood.io', company: 'Driftwood', plan: 'Pro', status: 'Active', mrr: 480, created: '2026-01-19' },
  { id: 'cus_5d63', name: 'Lena Hoffmann', email: 'lena@castiron.dev', company: 'Cast Iron', plan: 'Free', status: 'Churned', mrr: 0, created: '2025-09-15' },
  { id: 'cus_0a18', name: 'Rohan Mehta', email: 'rohan@beacon.app', company: 'Beacon', plan: 'Enterprise', status: 'Active', mrr: 3400, created: '2025-11-27' },
  { id: 'cus_8b54', name: 'Tomas Varga', email: 'tomas@pinegrove.co', company: 'Pinegrove', plan: 'Starter', status: 'Active', mrr: 120, created: '2026-04-30' },
  { id: 'cus_2e77', name: 'Aaliyah Reed', email: 'aaliyah@stellar.io', company: 'Stellar', plan: 'Pro', status: 'Past due', mrr: 480, created: '2026-03-14' },
  { id: 'cus_9c02', name: 'Bruno Salazar', email: 'bruno@latitude.app', company: 'Latitude', plan: 'Free', status: 'Trial', mrr: 0, created: '2026-06-18' },
  { id: 'cus_4d41', name: 'Maja Jovanović', email: 'maja@evergreen.co', company: 'Evergreen', plan: 'Enterprise', status: 'Active', mrr: 2600, created: '2025-12-30' },
  { id: 'cus_6a96', name: 'Henry Cole', email: 'henry@sandbar.dev', company: 'Sandbar', plan: 'Pro', status: 'Active', mrr: 540, created: '2026-02-22' },
  { id: 'cus_1f23', name: 'Yuki Tanaka', email: 'yuki@moonlit.io', company: 'Moonlit', plan: 'Starter', status: 'Active', mrr: 120, created: '2026-05-19' },
]

/** Badge tone per plan tier — Enterprise reads as the brand primary. */
export const PLAN_TONE: Record<CustomerPlan, CanonicalTone> = {
  Free: 'neutral',
  Starter: 'info',
  Pro: 'primary',
  Enterprise: 'success',
}

/** Badge tone per lifecycle status. */
export const STATUS_TONE: Record<CustomerStatus, CanonicalTone> = {
  Active: 'success',
  Trial: 'info',
  'Past due': 'warning',
  Churned: 'danger',
}

/** Facet options for the plan DzMultiSelect — values are the plan labels. */
export const PLAN_OPTIONS: DzSelectItem[] = (['Free', 'Starter', 'Pro', 'Enterprise'] as const).map(
  (p) => ({ label: p, value: p }),
)

/** Facet options for the status DzMultiSelect — values are the status labels. */
export const STATUS_OPTIONS: DzSelectItem[] = (
  ['Active', 'Trial', 'Past due', 'Churned'] as const
).map((s) => ({ label: s, value: s }))

/** Plan choices for the "New customer" dialog form's DzSelect. */
export const PLAN_SELECT: DzSelectItem[] = PLAN_OPTIONS

/** Status choices for the "New customer" dialog form's DzSelect. */
export const STATUS_SELECT: DzSelectItem[] = STATUS_OPTIONS

/** A sidebar navigation item. */
export interface NavItem {
  label: string
  icon: Component
  active?: boolean
  badge?: string
}

export const PRIMARY_NAV: NavItem[] = [
  { label: 'Customers', icon: Users, active: true, badge: String(CUSTOMERS.length) },
  { label: 'Invoices', icon: Receipt },
  { label: 'Subscriptions', icon: CreditCard },
  { label: 'Accounts', icon: Building2 },
]

export const SECONDARY_NAV: NavItem[] = [
  { label: 'Overview', icon: LayoutGrid },
  { label: 'Support', icon: LifeBuoy },
]

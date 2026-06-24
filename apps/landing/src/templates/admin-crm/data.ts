/**
 * Sample data for the Admin / CRM template. Co-located so the template is
 * self-contained and copy-pasteable (docs/templates.md §7). Content is plausible
 * sales-CRM fare — never lorem ipsum (§7 "realistic content").
 */
import type { Component } from 'vue'
import {
  Building2,
  Contact,
  Handshake,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  PieChart,
  Settings,
} from 'lucide-vue-next'
import type { CanonicalTone } from '@dzup-ui/contracts'

/** A sidebar navigation entry. */
export interface NavItem {
  label: string
  icon: Component
  /** Marks the current page (one per nav). */
  active?: boolean
  /** Optional count badge (e.g. open items). */
  badge?: string
}

export const PRIMARY_NAV: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Contacts', icon: Contact, active: true },
  { label: 'Companies', icon: Building2 },
  { label: 'Deals', icon: Handshake, badge: '12' },
  { label: 'Tasks', icon: ListChecks, badge: '5' },
]

export const SECONDARY_NAV: NavItem[] = [
  { label: 'Reports', icon: PieChart },
  { label: 'Settings', icon: Settings },
  { label: 'Support', icon: LifeBuoy },
]

/** Lifecycle stage of a contact — drives the tab filter and the status chip. */
export type ContactStatus = 'Customer' | 'Lead' | 'Churned'

/** A row in the contacts grid. */
export interface ContactRow extends Record<string, unknown> {
  id: string
  name: string
  email: string
  company: string
  status: ContactStatus
  /** Open/closed deal value in whole dollars (formatted in the cell). */
  value: number
}

export const CONTACTS: ContactRow[] = [
  { id: 'c-01', name: 'Ava Restić', email: 'ava@northwind.io', company: 'Northwind', status: 'Customer', value: 48200 },
  { id: 'c-02', name: 'Liam Novak', email: 'liam@lumenlabs.com', company: 'Lumen Labs', status: 'Lead', value: 12400 },
  { id: 'c-03', name: 'Mara Petrović', email: 'mara@helio.dev', company: 'Helio', status: 'Customer', value: 91300 },
  { id: 'c-04', name: 'Noah Kvist', email: 'noah@arcadia.co', company: 'Arcadia', status: 'Churned', value: 0 },
  { id: 'c-05', name: 'Sofia Adeyemi', email: 'sofia@meridian.io', company: 'Meridian', status: 'Customer', value: 27600 },
  { id: 'c-06', name: 'Theo Andersen', email: 'theo@vela.app', company: 'Vela', status: 'Lead', value: 8900 },
  { id: 'c-07', name: 'Priya Nair', email: 'priya@orbit.com', company: 'Orbit', status: 'Customer', value: 63400 },
  { id: 'c-08', name: 'Sam Okafor', email: 'sam@cobalt.io', company: 'Cobalt', status: 'Lead', value: 15200 },
  { id: 'c-09', name: 'Lena Fischer', email: 'lena@strata.dev', company: 'Strata', status: 'Churned', value: 0 },
  { id: 'c-10', name: 'Devon Reyes', email: 'devon@quill.co', company: 'Quill', status: 'Customer', value: 34800 },
  { id: 'c-11', name: 'Hana Suzuki', email: 'hana@beacon.io', company: 'Beacon', status: 'Lead', value: 21000 },
  { id: 'c-12', name: 'Marco Bianchi', email: 'marco@atlas.app', company: 'Atlas', status: 'Customer', value: 57100 },
  { id: 'c-13', name: 'Zoe Laurent', email: 'zoe@nimbus.co', company: 'Nimbus', status: 'Lead', value: 9700 },
  { id: 'c-14', name: 'Omar Haddad', email: 'omar@verge.io', company: 'Verge', status: 'Customer', value: 42600 },
]

export const STATUS_TONE: Record<ContactStatus, CanonicalTone> = {
  Customer: 'success',
  Lead: 'info',
  Churned: 'neutral',
}

/** Tabs across the top of the contacts table. */
export const CONTACT_TABS: { value: string; label: string; match?: ContactStatus }[] = [
  { value: 'all', label: 'All contacts' },
  { value: 'customers', label: 'Customers', match: 'Customer' },
  { value: 'leads', label: 'Leads', match: 'Lead' },
  { value: 'churned', label: 'Churned', match: 'Churned' },
]

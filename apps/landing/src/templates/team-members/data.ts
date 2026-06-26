/**
 * Sample data for the Team Members template. Co-located so the template is
 * self-contained and copy-pasteable (docs/templates.md §7). Plausible org
 * directory content — never lorem ipsum (§7 "realistic content").
 */
import type { CanonicalTone } from '@dzup-ui/contracts'
import type { DzSelectItem } from '@dzup-ui/core'

export type MemberRole = 'Owner' | 'Admin' | 'Member' | 'Viewer'
export type MemberStatus = 'Active' | 'Invited' | 'Suspended'

/** A row in the members grid. */
export interface MemberRow extends Record<string, unknown> {
  id: string
  name: string
  email: string
  role: MemberRole
  status: MemberStatus
}

export const MEMBERS: MemberRow[] = [
  { id: 'm-01', name: 'Ava Restić', email: 'ava@northwind.io', role: 'Owner', status: 'Active' },
  { id: 'm-02', name: 'Liam Novak', email: 'liam@northwind.io', role: 'Admin', status: 'Active' },
  { id: 'm-03', name: 'Mara Petrović', email: 'mara@northwind.io', role: 'Member', status: 'Active' },
  { id: 'm-04', name: 'Noah Kvist', email: 'noah@northwind.io', role: 'Member', status: 'Invited' },
  { id: 'm-05', name: 'Sofia Adeyemi', email: 'sofia@northwind.io', role: 'Viewer', status: 'Active' },
  { id: 'm-06', name: 'Theo Andersen', email: 'theo@northwind.io', role: 'Member', status: 'Suspended' },
  { id: 'm-07', name: 'Priya Nair', email: 'priya@northwind.io', role: 'Admin', status: 'Active' },
  { id: 'm-08', name: 'Sam Okafor', email: 'sam@northwind.io', role: 'Member', status: 'Invited' },
]

export const ROLE_TONE: Record<MemberRole, CanonicalTone> = {
  Owner: 'primary',
  Admin: 'info',
  Member: 'neutral',
  Viewer: 'neutral',
}

export const STATUS_TONE: Record<MemberStatus, CanonicalTone> = {
  Active: 'success',
  Invited: 'warning',
  Suspended: 'danger',
}

/** Teams offered in the invite dialog's DzMultiSelect. */
export const TEAM_OPTIONS: DzSelectItem[] = [
  { label: 'Product', value: 'product' },
  { label: 'Engineering', value: 'engineering' },
  { label: 'Design', value: 'design' },
  { label: 'Marketing', value: 'marketing' },
  { label: 'Support', value: 'support' },
  { label: 'Operations', value: 'operations' },
]

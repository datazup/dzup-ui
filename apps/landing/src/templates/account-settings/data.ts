/**
 * Account Centre — co-located sample data (docs/templates.md §6.6).
 *
 * Realistic, self-contained seed content for the account-settings template:
 * select options, the notification channel matrix, active sessions, account
 * facts and recent invoices. Kept free of component imports so the .vue stays
 * the single place that maps data → core components.
 */
import type { DzSelectItem } from '@dzup-ui/core'

/** Timezone options for the Profile tab. */
export const TIMEZONES: DzSelectItem[] = [
  { label: '(UTC−08:00) Pacific Time', value: 'pst' },
  { label: '(UTC−05:00) Eastern Time', value: 'est' },
  { label: '(UTC+00:00) London', value: 'gmt' },
  { label: '(UTC+01:00) Central European', value: 'cet' },
  { label: '(UTC+05:30) India', value: 'ist' },
  { label: '(UTC+09:00) Tokyo', value: 'jst' },
]

/** Interface-language options for the Profile tab. */
export const LANGUAGES: DzSelectItem[] = [
  { label: 'English (US)', value: 'en-us' },
  { label: 'English (UK)', value: 'en-gb' },
  { label: 'Deutsch', value: 'de' },
  { label: 'Français', value: 'fr' },
  { label: 'Español', value: 'es' },
  { label: '日本語', value: 'ja' },
]

/** "Who can see my profile" visibility options for the Profile tab. */
export const VISIBILITY: DzSelectItem[] = [
  { label: 'Everyone in workspace', value: 'workspace' },
  { label: 'Only my team', value: 'team' },
  { label: 'Just me', value: 'private' },
]

/** Channels across the top of the notification matrix. */
export const NOTIFY_CHANNELS = ['Email', 'Push', 'SMS'] as const

/** A row in the notification matrix — one event type, one toggle per channel. */
export interface NotifyRow {
  key: string
  label: string
  desc: string
  email: boolean
  push: boolean
  sms: boolean
}

/** Seed for the Notifications matrix (deep-cloned into reactive state). */
export const NOTIFY_SEED: NotifyRow[] = [
  {
    key: 'mentions',
    label: 'Mentions & replies',
    desc: 'Someone @mentions you or replies to your thread.',
    email: true,
    push: true,
    sms: false,
  },
  {
    key: 'assigned',
    label: 'Assigned to you',
    desc: 'A task or review is handed to you.',
    email: true,
    push: true,
    sms: false,
  },
  {
    key: 'digest',
    label: 'Weekly digest',
    desc: 'A Monday summary of your workspace activity.',
    email: true,
    push: false,
    sms: false,
  },
  {
    key: 'security',
    label: 'Security alerts',
    desc: 'New sign-ins and changes to your account.',
    email: true,
    push: true,
    sms: true,
  },
  {
    key: 'product',
    label: 'Product news',
    desc: 'New features, improvements and tips.',
    email: false,
    push: false,
    sms: false,
  },
]

/** An active sign-in session shown in the Security tab. */
export interface Session {
  id: string
  device: string
  meta: string
  location: string
  lastActive: string
  /** The session the page is "running" in — cannot be revoked. */
  current?: boolean
  /** 'monitor' | 'smartphone' — picks the lucide glyph in the component. */
  kind: 'monitor' | 'smartphone'
}

/** Seed for the active-sessions list (deep-cloned into reactive state). */
export const SESSIONS_SEED: Session[] = [
  {
    id: 's1',
    device: 'MacBook Pro · Chrome',
    meta: 'macOS 14.4',
    location: 'Berlin, Germany',
    lastActive: 'Active now',
    current: true,
    kind: 'monitor',
  },
  {
    id: 's2',
    device: 'iPhone 15 · Northwind app',
    meta: 'iOS 17.4',
    location: 'Berlin, Germany',
    lastActive: '2 hours ago',
    kind: 'smartphone',
  },
  {
    id: 's3',
    device: 'Windows PC · Firefox',
    meta: 'Windows 11',
    location: 'Amsterdam, Netherlands',
    lastActive: 'Yesterday at 18:20',
    kind: 'monitor',
  },
]

/** A line in the Billing invoices snippet. */
export interface Invoice {
  id: string
  date: string
  amount: string
  status: 'Paid' | 'Pending' | 'Failed'
}

/** Recent invoices for the Billing tab. */
export const INVOICES: Invoice[] = [
  { id: 'INV-2061', date: 'Jun 1, 2026', amount: '$48.00', status: 'Paid' },
  { id: 'INV-2048', date: 'May 1, 2026', amount: '$48.00', status: 'Paid' },
  { id: 'INV-2033', date: 'Apr 1, 2026', amount: '$48.00', status: 'Paid' },
  { id: 'INV-2019', date: 'Mar 1, 2026', amount: '$32.00', status: 'Paid' },
]

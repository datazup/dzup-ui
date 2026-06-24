/**
 * Sample data for the Inbox / Notifications template. Co-located so the template
 * is self-contained and copy-pasteable (docs/templates.md §7). Plausible product
 * notifications — never lorem ipsum (§7 "realistic content").
 */
import type { Component } from 'vue'
import { Archive, AtSign, Bell, Inbox, Settings } from 'lucide-vue-next'

/** A sidebar navigation entry. */
export interface NavItem {
  label: string
  icon: Component
  active?: boolean
  badge?: string
}

export const PRIMARY_NAV: NavItem[] = [
  { label: 'Inbox', icon: Inbox, active: true, badge: '6' },
  { label: 'Mentions', icon: AtSign },
  { label: 'Subscribed', icon: Bell },
  { label: 'Archive', icon: Archive },
]

export const SECONDARY_NAV: NavItem[] = [{ label: 'Settings', icon: Settings }]

/** A single notification row. */
export interface Notification {
  id: string
  /** Avatar fallback initials for the actor. */
  actor: string
  /** Actor display name. */
  name: string
  /** What they did. */
  action: string
  /** The thing they acted on. */
  target: string
  when: string
  unread: boolean
  mention: boolean
}

export const NOTIFICATIONS: Notification[] = [
  { id: 'n-01', actor: 'MP', name: 'Mara Petrović', action: 'mentioned you in', target: 'Billing refactor', when: '5m ago', unread: true, mention: true },
  { id: 'n-02', actor: 'DR', name: 'Devon Reyes', action: 'requested your review on', target: 'PR #482 · Dark theme tokens', when: '22m ago', unread: true, mention: false },
  { id: 'n-03', actor: 'PN', name: 'Priya Nair', action: 'assigned you', target: 'Tune table virtualization', when: '1h ago', unread: true, mention: false },
  { id: 'n-04', actor: 'LF', name: 'Lena Fischer', action: 'mentioned you in', target: 'Design System guild', when: '3h ago', unread: true, mention: true },
  { id: 'n-05', actor: 'SO', name: 'Sam Okafor', action: 'commented on', target: 'Auth token rotation', when: 'Yesterday', unread: false, mention: false },
  { id: 'n-06', actor: 'AR', name: 'Ava Restić', action: 'closed', target: 'Add export to CSV', when: 'Yesterday', unread: false, mention: false },
  { id: 'n-07', actor: 'TA', name: 'Theo Andersen', action: 'shared', target: 'Q3 roadmap deck', when: '2 days ago', unread: false, mention: false },
]

/** Tabs across the top of the notifications list. */
export const INBOX_TABS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'mentions', label: 'Mentions' },
]

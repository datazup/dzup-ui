/**
 * Sample data for the Project / Task Board template. Co-located so the template
 * is self-contained and copy-pasteable (docs/templates.md §7). Plausible product
 * delivery work — never lorem ipsum (§7 "realistic content").
 */
import type { Component } from 'vue'
import {
  CalendarClock,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  Settings,
  Users,
} from 'lucide-vue-next'
import type { CanonicalTone } from '@dzup-ui/contracts'

/** A sidebar navigation entry. */
export interface NavItem {
  label: string
  icon: Component
  active?: boolean
  badge?: string
}

export const PRIMARY_NAV: NavItem[] = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Boards', icon: FolderKanban, active: true },
  { label: 'Inbox', icon: Inbox, badge: '4' },
  { label: 'Schedule', icon: CalendarClock },
  { label: 'Team', icon: Users },
]

export const SECONDARY_NAV: NavItem[] = [{ label: 'Settings', icon: Settings }]

/** A board column (status lane). */
export interface BoardColumn {
  key: string
  title: string
  tone: CanonicalTone
}

export const COLUMNS: BoardColumn[] = [
  { key: 'backlog', title: 'Backlog', tone: 'neutral' },
  { key: 'progress', title: 'In progress', tone: 'info' },
  { key: 'review', title: 'In review', tone: 'warning' },
  { key: 'done', title: 'Done', tone: 'success' },
]

/** A single task card. */
export interface Task {
  id: string
  title: string
  column: string
  done: boolean
  label: string
  labelTone: CanonicalTone
  priority: 'High' | 'Medium' | 'Low'
  /** Assignee initials shown in the avatar group. */
  assignees: string[]
}

export const PRIORITY_TONE: Record<Task['priority'], CanonicalTone> = {
  High: 'danger',
  Medium: 'warning',
  Low: 'neutral',
}

export const TASKS: Task[] = [
  { id: 't-01', title: 'Define API contract for billing', column: 'backlog', done: false, label: 'Backend', labelTone: 'info', priority: 'Medium', assignees: ['DR', 'PN'] },
  { id: 't-02', title: 'Audit empty states across app', column: 'backlog', done: false, label: 'Design', labelTone: 'primary', priority: 'Low', assignees: ['LF'] },
  { id: 't-03', title: 'Spike: edge cache strategy', column: 'backlog', done: false, label: 'Research', labelTone: 'neutral', priority: 'Low', assignees: ['SO', 'AR'] },
  { id: 't-04', title: 'Build dashboard KPI row', column: 'progress', done: false, label: 'Frontend', labelTone: 'success', priority: 'High', assignees: ['AR'] },
  { id: 't-05', title: 'Wire auth token rotation', column: 'progress', done: false, label: 'Backend', labelTone: 'info', priority: 'High', assignees: ['SO', 'DR'] },
  { id: 't-06', title: 'Localize onboarding copy', column: 'progress', done: false, label: 'Content', labelTone: 'warning', priority: 'Medium', assignees: ['ZL'] },
  { id: 't-07', title: 'Review settings form a11y', column: 'review', done: false, label: 'A11y', labelTone: 'primary', priority: 'High', assignees: ['LF', 'MP'] },
  { id: 't-08', title: 'Tune table virtualization', column: 'review', done: false, label: 'Frontend', labelTone: 'success', priority: 'Medium', assignees: ['PN'] },
  { id: 't-09', title: 'Ship dark theme tokens', column: 'done', done: true, label: 'Design', labelTone: 'primary', priority: 'High', assignees: ['LF'] },
  { id: 't-10', title: 'Add export to CSV', column: 'done', done: true, label: 'Frontend', labelTone: 'success', priority: 'Low', assignees: ['AR', 'DR'] },
  { id: 't-11', title: 'Migrate to new icon set', column: 'done', done: true, label: 'Chore', labelTone: 'neutral', priority: 'Low', assignees: ['MP'] },
]

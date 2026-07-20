import type { CanonicalTone } from '@dzup-ui/contracts'
import type { Component } from 'vue'
/**
 * Tasks / To-Do — co-located sample data (docs/templates.md §6.4).
 *
 * A believable personal task app: the left-rail lists (`NAV`), and a seeded
 * `TASKS` set spread across Today / Upcoming / Done with priorities and labels.
 * Pure data — the page keeps a reactive copy so checking, adding, moving and
 * deleting feel live in the preview.
 */
import { CalendarDays, ListTodo, Star, Sun, UserRoundCheck } from 'lucide-vue-next'

/** One to-do row. */
export interface TaskItem {
  id: string
  title: string
  done: boolean
  /** Which view bucket it belongs to while open ('done' is derived from `done`). */
  when: 'today' | 'upcoming'
  /** Friendly due label, e.g. 'Today', 'Tomorrow', 'Fri', 'Jun 28'. */
  due: string
  priority: 'High' | 'Medium' | 'Low'
  /** A single context label rendered as a DzTag. */
  label: string
  labelTone: CanonicalTone
  starred: boolean
}

/** Priority → badge tone (mirrors the project-board convention). */
export const PRIORITY_TONE: Record<TaskItem['priority'], CanonicalTone> = {
  High: 'danger',
  Medium: 'warning',
  Low: 'neutral',
}

/** A sidebar list with its glyph and a count badge. */
export interface NavList {
  key: string
  label: string
  icon: Component
  count: number
  active?: boolean
}

export const NAV: NavList[] = [
  { key: 'my-day', label: 'My Day', icon: Sun, count: 5, active: true },
  { key: 'important', label: 'Important', icon: Star, count: 3 },
  { key: 'planned', label: 'Planned', icon: CalendarDays, count: 8 },
  { key: 'assigned', label: 'Assigned to me', icon: UserRoundCheck, count: 2 },
  { key: 'tasks', label: 'All Tasks', icon: ListTodo, count: 14 },
]

/** Date shown beneath the "My Day" heading. Static for a deterministic preview. */
export const TODAY_LABEL = '25 June 2026'

/** Seeded tasks. New quick-adds are appended to the Today bucket. */
export const TASKS: TaskItem[] = [
  {
    id: 't1',
    title: 'Finalise the Q3 launch checklist',
    done: false,
    when: 'today',
    due: 'Today',
    priority: 'High',
    label: 'Launch',
    labelTone: 'primary',
    starred: true,
  },
  {
    id: 't2',
    title: 'Review pull requests for the design system',
    done: false,
    when: 'today',
    due: 'Today',
    priority: 'Medium',
    label: 'Engineering',
    labelTone: 'info',
    starred: false,
  },
  {
    id: 't3',
    title: 'Reply to Maya about the onboarding flow',
    done: false,
    when: 'today',
    due: 'Today',
    priority: 'Low',
    label: 'Inbox',
    labelTone: 'neutral',
    starred: false,
  },
  {
    id: 't4',
    title: 'Draft the weekly investor update',
    done: false,
    when: 'today',
    due: 'Today',
    priority: 'Medium',
    label: 'Writing',
    labelTone: 'success',
    starred: false,
  },
  {
    id: 't5',
    title: 'Book the offsite venue',
    done: false,
    when: 'upcoming',
    due: 'Tomorrow',
    priority: 'Medium',
    label: 'Team',
    labelTone: 'info',
    starred: true,
  },
  {
    id: 't6',
    title: 'Prepare slides for the board meeting',
    done: false,
    when: 'upcoming',
    due: 'Fri',
    priority: 'High',
    label: 'Writing',
    labelTone: 'success',
    starred: false,
  },
  {
    id: 't7',
    title: 'Renew the analytics subscription',
    done: false,
    when: 'upcoming',
    due: 'Jun 28',
    priority: 'Low',
    label: 'Admin',
    labelTone: 'neutral',
    starred: false,
  },
  {
    id: 't8',
    title: 'Plan the Q4 roadmap workshop',
    done: false,
    when: 'upcoming',
    due: 'Jul 02',
    priority: 'Medium',
    label: 'Planning',
    labelTone: 'warning',
    starred: false,
  },
  {
    id: 't9',
    title: 'Send the signed vendor contract',
    done: true,
    when: 'today',
    due: 'Today',
    priority: 'High',
    label: 'Admin',
    labelTone: 'neutral',
    starred: false,
  },
  {
    id: 't10',
    title: 'Approve the new brand colour tokens',
    done: true,
    when: 'today',
    due: 'Today',
    priority: 'Medium',
    label: 'Design',
    labelTone: 'primary',
    starred: false,
  },
]

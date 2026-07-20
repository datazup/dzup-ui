/**
 * Sample data for the Calendar / Scheduler template (docs/templates.md §6.4).
 * Co-located so the template is self-contained and copy-pasteable (§5). A full,
 * plausible month of June 2026 events across six colour-coded calendars — never
 * lorem ipsum (§5 "realistic content").
 */
import type { Component } from 'vue'
import { CalendarDays, CheckSquare, Inbox, Settings, Users } from 'lucide-vue-next'

/** A sidebar navigation entry for the app rail. */
export interface NavItem {
  label: string
  icon: Component
  active?: boolean
  badge?: string
}

export const APP_NAV: NavItem[] = [
  { label: 'Calendar', icon: CalendarDays, active: true },
  { label: 'Inbox', icon: Inbox, badge: '3' },
  { label: 'Tasks', icon: CheckSquare },
  { label: 'People', icon: Users },
]

export const APP_NAV_SECONDARY: NavItem[] = [{ label: 'Settings', icon: Settings }]

/**
 * A named calendar / event category. `palette` is a `@dzup-ui/tokens` decorative
 * spectrum name — the template paints each event from `var(--dz-colors-{palette}-*)`
 * so the colour-coding is token-only and stays correct in light + dark.
 */
export interface EventCategory {
  key: string
  label: string
  palette: 'indigo' | 'violet' | 'cyan' | 'emerald' | 'rose' | 'amber'
}

export const CATEGORIES: EventCategory[] = [
  { key: 'meeting', label: 'Meetings', palette: 'indigo' },
  { key: 'review', label: 'Reviews', palette: 'violet' },
  { key: 'focus', label: 'Focus time', palette: 'cyan' },
  { key: 'personal', label: 'Personal', palette: 'emerald' },
  { key: 'deadline', label: 'Deadlines', palette: 'rose' },
  { key: 'social', label: 'Team & social', palette: 'amber' },
]

/** A single scheduled event. `date` is an ISO 'YYYY-MM-DD' day key. */
export interface CalendarEvent {
  id: string
  title: string
  date: string
  /** 24h sort key, e.g. '09:30'. */
  start: string
  /** Human label, e.g. '9:30 AM'. */
  startLabel: string
  endLabel: string
  /** Category key (see {@link CATEGORIES}). */
  category: string
  location?: string
  /** Attendee avatar fallback initials. */
  attendees: string[]
  description?: string
}

export const EVENTS: CalendarEvent[] = [
  { id: 'e-01', title: 'Sprint planning', date: '2026-06-01', start: '09:30', startLabel: '9:30 AM', endLabel: '10:30 AM', category: 'meeting', location: 'Atlas room', attendees: ['MP', 'DR', 'PN'], description: 'Scope the 2.4 release and assign owners.' },
  { id: 'e-02', title: 'Design crit', date: '2026-06-02', start: '14:00', startLabel: '2:00 PM', endLabel: '3:00 PM', category: 'review', location: 'Figma', attendees: ['LF', 'AR'], description: 'Review the calendar template day-cell exploration.' },
  { id: 'e-03', title: 'Deep work — tokens', date: '2026-06-03', start: '08:30', startLabel: '8:30 AM', endLabel: '11:00 AM', category: 'focus', attendees: ['AR'], description: 'No-meeting block to land the dark ramp fixes.' },
  { id: 'e-04', title: '1:1 with Devon', date: '2026-06-04', start: '11:00', startLabel: '11:00 AM', endLabel: '11:30 AM', category: 'meeting', location: 'Zoom', attendees: ['DR', 'AR'] },
  { id: 'e-05', title: 'Release 2.3.1 cutoff', date: '2026-06-05', start: '17:00', startLabel: '5:00 PM', endLabel: '5:00 PM', category: 'deadline', attendees: ['SO'], description: 'Final patch merge window closes.' },
  { id: 'e-06', title: 'Team lunch', date: '2026-06-05', start: '12:30', startLabel: '12:30 PM', endLabel: '1:30 PM', category: 'social', location: 'Café Nord', attendees: ['MP', 'DR', 'PN', 'LF', 'SO'] },
  { id: 'e-07', title: 'Accessibility audit', date: '2026-06-09', start: '10:00', startLabel: '10:00 AM', endLabel: '12:00 PM', category: 'review', location: 'Atlas room', attendees: ['PN', 'AR'], description: 'WCAG AA pass over the new app templates.' },
  { id: 'e-08', title: 'Roadmap sync', date: '2026-06-10', start: '15:00', startLabel: '3:00 PM', endLabel: '4:00 PM', category: 'meeting', location: 'Zoom', attendees: ['MP', 'TA', 'AR'] },
  { id: 'e-09', title: 'Deep work — calendar', date: '2026-06-11', start: '09:00', startLabel: '9:00 AM', endLabel: '12:00 PM', category: 'focus', attendees: ['AR'] },
  { id: 'e-10', title: 'Dentist', date: '2026-06-12', start: '16:30', startLabel: '4:30 PM', endLabel: '5:15 PM', category: 'personal', location: 'Bright Smile', attendees: ['AR'] },
  { id: 'e-11', title: 'Component review', date: '2026-06-15', start: '10:00', startLabel: '10:00 AM', endLabel: '11:00 AM', category: 'review', location: 'Figma', attendees: ['LF', 'MP', 'AR'], description: 'Sign off DzCalendar day-cell slot API.' },
  { id: 'e-12', title: 'Standup', date: '2026-06-15', start: '09:15', startLabel: '9:15 AM', endLabel: '9:30 AM', category: 'meeting', attendees: ['MP', 'DR', 'PN', 'LF'] },
  { id: 'e-13', title: 'Investor update prep', date: '2026-06-15', start: '13:00', startLabel: '1:00 PM', endLabel: '2:00 PM', category: 'deadline', attendees: ['TA', 'AR'] },
  { id: 'e-14', title: 'Customer call — Northwind', date: '2026-06-16', start: '11:30', startLabel: '11:30 AM', endLabel: '12:15 PM', category: 'meeting', location: 'Zoom', attendees: ['TA', 'PN'] },
  { id: 'e-15', title: 'Docs writing', date: '2026-06-17', start: '14:00', startLabel: '2:00 PM', endLabel: '4:00 PM', category: 'focus', attendees: ['AR'] },
  { id: 'e-16', title: 'Design system guild', date: '2026-06-18', start: '15:30', startLabel: '3:30 PM', endLabel: '4:30 PM', category: 'social', location: 'Atlas room', attendees: ['LF', 'MP', 'DR', 'PN', 'SO', 'AR'] },
  { id: 'e-17', title: 'Q3 OKR deadline', date: '2026-06-19', start: '17:00', startLabel: '5:00 PM', endLabel: '5:00 PM', category: 'deadline', attendees: ['TA'], description: 'Submit team objectives for the quarter.' },
  { id: 'e-18', title: 'Yoga', date: '2026-06-22', start: '07:30', startLabel: '7:30 AM', endLabel: '8:15 AM', category: 'personal', attendees: ['AR'] },
  { id: 'e-19', title: 'Stakeholder review', date: '2026-06-23', start: '10:30', startLabel: '10:30 AM', endLabel: '11:30 AM', category: 'review', location: 'Atlas room', attendees: ['MP', 'TA', 'AR'] },
  { id: 'e-20', title: 'Standup', date: '2026-06-25', start: '09:15', startLabel: '9:15 AM', endLabel: '9:30 AM', category: 'meeting', attendees: ['MP', 'DR', 'PN', 'LF'] },
  { id: 'e-21', title: 'Template demo', date: '2026-06-25', start: '14:00', startLabel: '2:00 PM', endLabel: '2:45 PM', category: 'review', location: 'Zoom', attendees: ['LF', 'SO', 'AR'], description: 'Walk through chat + calendar templates with the guild.' },
  { id: 'e-22', title: 'Release 2.4 freeze', date: '2026-06-26', start: '12:00', startLabel: '12:00 PM', endLabel: '12:00 PM', category: 'deadline', attendees: ['SO', 'AR'], description: 'Code freeze ahead of the 2.4 release.' },
  { id: 'e-23', title: 'Happy hour', date: '2026-06-26', start: '17:30', startLabel: '5:30 PM', endLabel: '7:00 PM', category: 'social', location: 'The Anchor', attendees: ['MP', 'DR', 'PN', 'LF', 'SO', 'TA'] },
  { id: 'e-24', title: 'Plan next sprint', date: '2026-06-29', start: '09:30', startLabel: '9:30 AM', endLabel: '10:30 AM', category: 'meeting', location: 'Atlas room', attendees: ['MP', 'DR', 'PN'] },
]

/** The wider team, shown as a DzAvatarGroup in the toolbar. */
export const TEAM = ['AR', 'MP', 'DR', 'PN', 'LF', 'SO', 'TA']

/**
 * Quick-add presets for the "New event" dialog. The dialog composes a new event
 * from a preset + a time slot (no free-text field — it draws only from the
 * template's stack: DzDialog, DzSegmented, DzButton, DzBadge, DzAvatarGroup).
 */
export interface EventPreset {
  title: string
  category: string
  durationLabel: string
}

export const EVENT_PRESETS: EventPreset[] = [
  { title: '1:1 sync', category: 'meeting', durationLabel: '30 min' },
  { title: 'Design review', category: 'review', durationLabel: '1 hr' },
  { title: 'Focus block', category: 'focus', durationLabel: '2 hr' },
  { title: 'Team social', category: 'social', durationLabel: '1 hr' },
]

/** Selectable start times for the new-event dialog. */
export const TIME_SLOTS: { value: string, label: string }[] = [
  { value: '09:00', label: '9:00 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '16:00', label: '4:00 PM' },
]

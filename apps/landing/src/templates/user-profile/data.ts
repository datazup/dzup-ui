/**
 * Sample data for the User Profile template. Co-located so the template is
 * self-contained and copy-pasteable (docs/templates.md §7). Plausible profile
 * and activity content — never lorem ipsum (§7 "realistic content").
 */
import type { CanonicalTone } from '@dzup-ui/contracts'

/** A read-only profile fact rendered in the DzDescriptions grid. */
export interface ProfileFact {
  label: string
  value: string
}

export const FACTS: ProfileFact[] = [
  { label: 'Email', value: 'ava@northwind.io' },
  { label: 'Location', value: 'Berlin, Germany' },
  { label: 'Team', value: 'Product & Design' },
  { label: 'Timezone', value: 'UTC+01:00' },
  { label: 'Joined', value: 'March 2022' },
  { label: 'Manager', value: 'Mara Petrović' },
]

/** A single entry in the activity timeline. */
export interface ActivityEvent {
  title: string
  detail: string
  when: string
  tone: CanonicalTone
}

export const ACTIVITY: ActivityEvent[] = [
  {
    title: 'Shipped dark theme tokens',
    detail: 'Merged PR #482 into main after review.',
    when: '2h ago',
    tone: 'success',
  },
  {
    title: 'Commented on “Billing refactor”',
    detail: 'Flagged a migration edge case for the team.',
    when: 'Yesterday',
    tone: 'info',
  },
  {
    title: 'Closed 4 tasks in Platform Q3',
    detail: 'Cleared the review lane ahead of the sprint demo.',
    when: '3 days ago',
    tone: 'primary',
  },
  {
    title: 'Joined the Design System guild',
    detail: 'Now a reviewer for component contributions.',
    when: 'Last week',
    tone: 'neutral',
  },
]

/** Headline stats shown as a small row under the name. */
export const STATS: { label: string, value: string }[] = [
  { label: 'Projects', value: '14' },
  { label: 'Tasks done', value: '329' },
  { label: 'Reviews', value: '87' },
]

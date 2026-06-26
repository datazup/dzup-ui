/**
 * Sample content for the Changelog template (docs/templates.md §6.5).
 * Co-located so the template is self-contained (§7). Content only — the page is
 * token-driven with no painted artwork, so this file carries no raw hex.
 */

import type { CanonicalTone } from '@dzup-ui/contracts'

/** The kind of change, which drives its DzTag tone. */
export type ChangeType = 'Added' | 'Improved' | 'Fixed' | 'Removed'

/** Map a change type to its semantic tone for the inline DzTag. */
export const CHANGE_TONE: Record<ChangeType, CanonicalTone> = {
  Added: 'success',
  Improved: 'info',
  Fixed: 'warning',
  Removed: 'danger',
}

/** A single line item within a release. */
export interface Change {
  type: ChangeType
  text: string
}

/** One released version, rendered as a node on the timeline. */
export interface Release {
  version: string
  date: string
  /** Headline summary for the release. */
  title: string
  /** Marks the newest release with a "Latest" badge + accent dot. */
  latest?: boolean
  changes: Change[]
  /** Optional code/diff snippet shown beneath the change list. */
  code?: string
  codeLang?: string
  codeFile?: string
}

/** Filter chips — 'All' plus one per change type. */
export const FILTERS: (ChangeType | 'All')[] = [
  'All',
  'Added',
  'Improved',
  'Fixed',
  'Removed',
]

export const RELEASES: Release[] = [
  {
    version: 'v2.4.0',
    date: 'Jun 24, 2026',
    title: 'Token pipeline & multi-brand theming',
    latest: true,
    changes: [
      { type: 'Added', text: 'Multi-brand theming: layer brand token sets over the base palette at runtime.' },
      { type: 'Added', text: 'New `DzMeterGroup` component for stacked usage meters.' },
      { type: 'Improved', text: 'Token build is now ~40% faster thanks to an incremental generator.' },
      { type: 'Fixed', text: 'Dark-mode focus rings now meet AA contrast on subtle surfaces.' },
    ],
    code: `:root {
  --dz-primary: var(--brand-primary, oklch(0.62 0.19 256));
}
[data-brand='aurora'] {
  --brand-primary: oklch(0.68 0.16 162);
}`,
    codeLang: 'css',
    codeFile: 'brand.css',
  },
  {
    version: 'v2.3.1',
    date: 'May 30, 2026',
    title: 'Stability & accessibility pass',
    changes: [
      { type: 'Fixed', text: 'DzSelect no longer loses its label association when wrapped in a DzFormField.' },
      { type: 'Fixed', text: 'Roving focus now sets a correct initial tab stop in DzTabs.' },
      { type: 'Improved', text: 'Reduced the core bundle by 6kB by tree-shaking unused Reka primitives.' },
    ],
  },
  {
    version: 'v2.3.0',
    date: 'May 12, 2026',
    title: 'Data display expansion',
    changes: [
      { type: 'Added', text: 'DzDataGrid gains column pinning and per-column sort.' },
      { type: 'Added', text: 'New DzTimeline + DzTimelineItem for activity and release feeds.' },
      { type: 'Improved', text: 'DzTable rows support a compact density for dashboards.' },
      { type: 'Removed', text: 'Deprecated the legacy `DzListView`; use DzList with `interactive`.' },
    ],
  },
  {
    version: 'v2.2.0',
    date: 'Apr 28, 2026',
    title: 'Forms & validation',
    changes: [
      { type: 'Added', text: 'DzFieldArray for repeatable form groups with add/remove controls.' },
      { type: 'Improved', text: 'Validation messages now announce politely to screen readers.' },
      { type: 'Fixed', text: 'DzNumberInput respected `min`/`max` but not `step` on keyboard input.' },
    ],
  },
]

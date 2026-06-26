/**
 * Sample content for the Newsroom / Press template (docs/templates.md §6.5).
 * Co-located so the template is self-contained (§7). Content only — token-driven
 * with no painted artwork, so this file carries no raw hex. Resource-card icons
 * are referenced by string key into the central ICONS registry (icons.ts).
 */

import type { CanonicalTone } from '@dzup-ui/contracts'

/** The pinned, most-important announcement at the top of the page. */
export interface Pinned {
  badge: string
  date: string
  title: string
  excerpt: string
}

/** A downloadable press resource card. */
export interface PressKit {
  /** ICONS registry key for the card glyph. */
  icon: string
  title: string
  description: string
  /** Format/size hint shown on the download button row. */
  meta: string
}

/** A dated press release row in the news list. */
export interface NewsItem {
  /** Short stamp shown in the row prefix, e.g. 'Jun 18'. */
  date: string
  category: string
  tone: CanonicalTone
  title: string
}

export const PINNED: Pinned = {
  badge: 'Announcement',
  date: 'June 24, 2026',
  title: 'Northwind raises $40M Series B to scale its design platform',
  excerpt:
    'The round, led by Meridian Ventures, will fund deeper enterprise theming, an expanded component library and a growing developer-experience team.',
}

export const PRESS_KITS: PressKit[] = [
  {
    icon: 'Palette',
    title: 'Brand assets',
    description: 'Logos, wordmarks and colour values in SVG and PNG.',
    meta: 'ZIP · 8 MB',
  },
  {
    icon: 'FileSearch',
    title: 'Fact sheet',
    description: 'Company milestones, headcount and key figures at a glance.',
    meta: 'PDF · 320 KB',
  },
  {
    icon: 'Users',
    title: 'Executive bios',
    description: 'Leadership headshots and approved biographies.',
    meta: 'ZIP · 14 MB',
  },
]

/** Outlets that have covered the company — rendered as decorative wordmarks. */
export const MEDIA_LOGOS: string[] = [
  'TechWire',
  'The Ledger',
  'Pixel Daily',
  'Forge',
  'Standpoint',
]

export const NEWS: NewsItem[] = [
  {
    date: 'Jun 24',
    category: 'Company',
    tone: 'danger',
    title: 'Northwind closes $40M Series B led by Meridian Ventures',
  },
  {
    date: 'Jun 10',
    category: 'Hiring',
    tone: 'info',
    title: 'Veteran platform lead Dana Whitlock joins as VP of Engineering',
  },
  {
    date: 'May 28',
    category: 'Product',
    tone: 'success',
    title: 'Multi-brand theming ships to all Business and Enterprise customers',
  },
  {
    date: 'May 09',
    category: 'Recognition',
    tone: 'warning',
    title: 'Named to the “Tools to Watch” list at the Frontend Summit',
  },
  {
    date: 'Apr 21',
    category: 'Company',
    tone: 'danger',
    title: 'Northwind opens its first European office in Berlin',
  },
]

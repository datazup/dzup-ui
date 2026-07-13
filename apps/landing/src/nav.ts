/**
 * The header's information architecture (TASK-DS-12).
 *
 * One exported structure, consumed by `TopNav.vue` for both the desktop menus
 * and the mobile drawer, so the two can never drift apart. `TopNav.spec.ts`
 * asserts the two invariants the design review found broken:
 *
 *   1. at most five top-level entries, and
 *   2. no destination reachable from two different nav entries.
 *
 * `Ecosystem` deliberately has no entry. It used to link to the home page's
 * `#ecosystem` section, whose tiles are Blocks / Templates / Animations /
 * Themes — three of which also sat next to it as top-level items. Those are now
 * the real destinations; the section itself stays on the page.
 */

import { LINKS } from './config.ts'

/** A single destination. `external` renders a plain `<a>` rather than a RouterLink. */
export interface NavLeaf {
  label: string
  href: string
  /**
   * Outside the SPA router. Storybook is same-origin but served as its own app,
   * so it must be a full navigation, not a `router.push`.
   */
  external?: boolean
}

/** A labelled menu of destinations. Rendered as a `DzDropdownMenu`. */
export interface NavGroup {
  label: string
  items: NavLeaf[]
}

export type NavEntry = NavLeaf | NavGroup

/** Type predicate so the template narrows without casting. */
export function isGroup(entry: NavEntry): entry is NavGroup {
  return 'items' in entry
}

/**
 * Five top-level entries.
 *
 * `Components` and `Docs` are the two menus, and they are genuinely different
 * things: Components lists what you install and drop into an app, Docs lists
 * what you read. Before this, both resolved into Storybook.
 */
export const NAV: NavEntry[] = [
  {
    label: 'Components',
    items: [
      { label: 'All components', href: LINKS.components, external: true },
      { label: 'Blocks', href: '/blocks' },
      { label: 'Templates', href: '/templates' },
      { label: 'Animations', href: '/animations' },
    ],
  },
  {
    label: 'Docs',
    items: [
      { label: 'Getting started', href: LINKS.gettingStarted, external: true },
      { label: 'Design tokens', href: LINKS.designTokens, external: true },
      { label: 'Theming', href: LINKS.theming, external: true },
      { label: 'Accessibility', href: LINKS.accessibility, external: true },
      { label: 'AI IDE setup', href: '/ai' },
      { label: 'Contributing', href: LINKS.contributing, external: true },
    ],
  },
  { label: 'Themes', href: '/themes' },
  { label: 'Compare', href: '/compare' },
  { label: 'Pro', href: '/pro' },
]

/** Every destination in the nav, flattened — the basis of the no-duplicates gate. */
export function navDestinations(): string[] {
  return NAV.flatMap(entry => (isGroup(entry) ? entry.items.map(i => i.href) : [entry.href]))
}

/** Top-level entries that are plain links, not menus. */
export function navLeaves(): NavLeaf[] {
  return NAV.filter((entry): entry is NavLeaf => !isGroup(entry))
}

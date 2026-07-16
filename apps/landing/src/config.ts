/**
 * Site configuration — the single place to edit external targets and the
 * free/pro phase wiring. Per spec §3.4/§3.5, cross-links to Storybook are
 * plain relative URLs; Phase 2 flips the Pro targets without structural change.
 */

import { COMPONENTS } from './generated/components.ts'
import { COUNTS } from './generated/counts.ts'

/**
 * Canonical production origin (no trailing slash). The single source of truth for
 * absolute URLs the client can't derive from `window.location` at build time:
 * the generated `sitemap.xml`/`robots.txt` (scripts/build-sitemap.ts) and the
 * absolute BreadcrumbList item URLs in the per-route JSON-LD. Kept in lockstep
 * with the `<link rel="canonical">`/`og:url` origin authored in index.html.
 */
export const SITE_ORIGIN = 'https://dzup-ui.com'

/** Where the free component docs (Storybook) are mounted in production (§3.4). */
export const STORYBOOK_BASE = '/storybook/'

/** Build a Storybook deep-link to a story's docs page (§4.6). */
export function storybookDocs(storyId: string): string {
  return `${STORYBOOK_BASE}?path=/docs/${storyId}--docs`
}

/** Build a Storybook deep-link to a specific story canvas. */
export function storybookStory(storyId: string): string {
  return `${STORYBOOK_BASE}?path=/story/${storyId}`
}

/**
 * Storybook family for each `@dzup-ui/core` component referenced by a template's
 * `stack`. Story ids follow `core-<family>-<componentlower>` (the same scheme the
 * Ecosystem family tiles use in `data.ts`). Extend this map as later template
 * batches (T4+) introduce components from new families.
 */
const COMPONENT_FAMILY: Record<string, string> = {
  // layout
  DzAppShell: 'layout',
  DzDivider: 'layout',
  // navigation
  DzSidebar: 'navigation',
  DzSegmented: 'navigation',
  DzPagination: 'navigation',
  DzTabs: 'navigation',
  // cards
  DzCard: 'cards',
  DzStatCard: 'cards',
  // data
  DzTable: 'data',
  DzAccordion: 'data',
  DzDataGrid: 'data',
  DzList: 'data',
  DzTag: 'data',
  DzDescriptions: 'data',
  DzTimeline: 'data',
  // feedback
  DzBadge: 'feedback',
  DzProgress: 'feedback',
  DzMeterGroup: 'feedback',
  DzAlert: 'feedback',
  DzEmpty: 'feedback',
  // inputs
  DzInput: 'inputs',
  DzPasswordInput: 'inputs',
  DzSearchInput: 'inputs',
  // forms
  DzFormField: 'forms',
  DzCheckbox: 'forms',
  DzSwitch: 'forms',
  DzSelect: 'forms',
  DzRadioGroup: 'forms',
  DzMultiSelect: 'forms',
  // buttons
  DzButton: 'buttons',
  // media
  DzAvatar: 'media',
  DzAvatarGroup: 'media',
  DzCarousel: 'media',
  DzImage: 'media',
  // overlays
  DzDropdownMenu: 'overlays',
  DzDialog: 'overlays',
}

/**
 * Build a Storybook docs deep-link for a `@dzup-ui/core` component by name —
 * powers the "Built with" badges on the template detail page (§5). Falls back to
 * the Storybook home when the component's family is not yet mapped, so an
 * unmapped name degrades to a useful link rather than a dead one.
 */
export function componentDocs(component: string): string {
  const family = COMPONENT_FAMILY[component]
  if (!family)
    return STORYBOOK_BASE
  return storybookDocs(`core-${family}-${component.toLowerCase()}`)
}

/** Canonical entry points used across the page. */
export const LINKS = {
  /** Primary "Browse components" CTA → free Storybook. */
  components: STORYBOOK_BASE,
  /** "Get started" → Storybook Getting Started guide. */
  gettingStarted: storybookDocs('getting-started'),
  /** "Themes" → Storybook Theming guide. */
  theming: storybookDocs('guides-theming'),
  // NOT storybookDocs(): the Design Tokens guide is an ATTACHED MDX page
  // (`<Meta of={…}>`), so its docs entry is named after the MDX file —
  // `…--designtokens`, not the `--docs` suffix unattached guides get. The
  // Storybook CI gate (check-mdx-links) verifies the id against the built index.
  designTokens: `${STORYBOOK_BASE}?path=/docs/guides-design-tokens--designtokens`,
  accessibility: storybookDocs('guides-accessibility'),
  contributing: storybookDocs('contributing'),
  /** Pro path. Phase 1: the /pro coming-soon route. Phase 2: '/pro/'. */
  pro: '/pro',
  /**
   * External community / source links (TASK-FREE-11). The GitHub org is
   * `datazup` — the git remote, verified live. Every link here must RESOLVE:
   * the old Discord invite, X handle and a `dzup-ui/dzup-ui` org variant were
   * all 404s and have been removed/corrected (`orgConsistency.spec.ts` keeps
   * the org unique; re-add social links only once the destinations exist).
   */
  github: 'https://github.com/datazup/dzup-ui',
  npm: 'https://www.npmjs.com/package/@dzup-ui/core',
  license: 'https://github.com/datazup/dzup-ui/blob/main/LICENSE',
  changelog: 'https://github.com/datazup/dzup-ui/blob/main/CHANGELOG.md',
  /** Issue tracker — the repo has GitHub Discussions disabled, so this is the
   *  one live "talk to us" surface. */
  issues: 'https://github.com/datazup/dzup-ui/issues',
} as const

/**
 * Headline library facts (Appendix A). Surfaced as social proof + breadth.
 *
 * Every field is **derived**, never typed. Hand-maintained counts drift —
 * `freeComponents` used to read `147` while the real figure was `139`, and it was
 * the only count in either app that wasn't a literal. Now they all come from
 * `generated/counts.ts`, globbed out of the source tree and the real registries
 * by `scripts/build-counts.ts`. Add a component and every number follows.
 *
 * Two component counts, each with its rule — the same pair DESIGN.md publishes:
 *
 *   `freeComponents`    the DOCUMENTED size: components with a dedicated
 *                       Storybook page (compound sub-parts are documented
 *                       through their parent). This is the figure the hero, the
 *                       stat row and the `<head>` show — what a visitor can
 *                       actually browse.
 *   `catalogComponents` the CATALOG size: every exported `.vue` component,
 *                       including compound sub-parts such as `DzCardBody`.
 *
 * Never print one where the other is meant, and never print either without the
 * word that identifies it. Pro's figures live in `data.ts` (`PRO_FACTS`), beside
 * the list they count.
 */
export const FACTS = {
  /** @see COUNTS.documentedComponents — components with a docs page of their own. */
  freeComponents: COMPONENTS.length,
  /** @see COUNTS.catalogComponents — every exported `.vue`, sub-parts included. */
  catalogComponents: COUNTS.catalogComponents,
  families: COUNTS.families,
  blocks: COUNTS.blocks,
  effects: COUNTS.effects,
  templates: COUNTS.templates,
} as const

/**
 * A real testimonial from a real person who really uses dzup-ui, published with
 * their permission.
 *
 * @see TESTIMONIALS for why the list is empty.
 */
export interface Testimonial {
  /** The quote, verbatim. Never paraphrase, never compose one. */
  quote: string
  /** Attribution. A quote nobody signs is not social proof. */
  name: string
  /** Role and company, e.g. "Staff Engineer, Acme". */
  title: string
  /** Optional avatar URL. `alt` is derived from `name`. */
  avatar?: string
  /** Optional link to the source (tweet, issue, post) so the claim is checkable. */
  href?: string
}

/**
 * **Empty on purpose.** dzup-ui has no public users yet: the GitHub repo and the
 * npm package are both unpublished (see `useLiveStats`, which degrades its star
 * and download tiles to calls-to-action for the same reason). There is therefore
 * no real quote to print and no customer logo we have permission to display.
 *
 * `HomeTestimonials` renders nothing while this array is empty, so the home page
 * carries no trust section at all rather than a fabricated one. Add real,
 * permission-cleared entries here and the section appears — no other change.
 *
 * Do not seed this with placeholder or example quotes. The demo quotes in
 * `src/blocks/marketing/Testimonials.vue` are illustrative block content and are
 * labelled as such; they are not evidence and must not be lifted onto this page.
 */
export const TESTIMONIALS: Testimonial[] = []

/**
 * A single site-wide announcement (the thin bar above the nav). Surfaces a
 * release/news item and drives repeat traffic — landing.md reserves the slot.
 *
 * Edit ONE entry to change what shows; set `ANNOUNCEMENT` to `null` to hide the
 * bar entirely. The `id` is the dismissal key: a visitor who dismisses the bar
 * won't see it again (persisted in localStorage), but bumping `id` for a NEW
 * announcement re-shows it to everyone.
 */
export interface Announcement {
  /** Stable, unique id. Bump it for a new announcement so the bar re-shows. */
  id: string
  /** The short message shown in the bar. */
  message: string
  /**
   * Optional call-to-action target. An in-app path ('/blocks') renders a
   * router-link; an absolute URL ('https://…') renders an external anchor.
   */
  href?: string
  /** Optional label for the CTA link (defaults to "Learn more"). */
  linkLabel?: string
}

/**
 * The live announcement, or `null` to hide the bar.
 *
 * The count is interpolated, not typed: the bar shipped "90+ blocks" against a
 * registry of 87. Round numbers in marketing copy are still claims.
 */
export const ANNOUNCEMENT: Announcement | null = {
  id: '2026-07-blocks',
  message: `New — ${COUNTS.blocks} copy-paste Vue blocks, each runnable in one click.`,
  href: '/blocks',
  linkLabel: 'Browse blocks',
}

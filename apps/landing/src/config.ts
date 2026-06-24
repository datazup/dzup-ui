/**
 * Site configuration — the single place to edit external targets and the
 * free/pro phase wiring. Per spec §3.4/§3.5, cross-links to Storybook are
 * plain relative URLs; Phase 2 flips the Pro targets without structural change.
 */

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
  if (!family) return STORYBOOK_BASE
  return storybookDocs(`core-${family}-${component.toLowerCase()}`)
}

/** Canonical entry points used across the page. */
export const LINKS = {
  /** Primary "Browse components" CTA → free Storybook. */
  components: STORYBOOK_BASE,
  /** "Get started" → Storybook Getting Started guide. */
  gettingStarted: storybookDocs('guides-getting-started'),
  /** "Themes" → Storybook Theming guide. */
  theming: storybookDocs('guides-theming'),
  designTokens: storybookDocs('guides-design-tokens'),
  accessibility: storybookDocs('guides-accessibility'),
  contributing: storybookDocs('guides-contributing'),
  /** Pro path. Phase 1: the /pro coming-soon route. Phase 2: '/pro/'. */
  pro: '/pro',
  /** External community / source links. */
  github: 'https://github.com/dzup-ui/dzup-ui',
  npm: 'https://www.npmjs.com/package/@dzup-ui/core',
  changelog: 'https://github.com/dzup-ui/dzup-ui/blob/main/CHANGELOG.md',
  discussions: 'https://github.com/dzup-ui/dzup-ui/discussions',
  discord: 'https://discord.gg/dzup-ui',
  twitter: 'https://twitter.com/dzup_ui',
  nuxtModule: storybookDocs('guides-nuxt'),
} as const

/** Headline library facts (Appendix A). Surfaced as social proof + breadth. */
export const FACTS = {
  freeComponents: 147,
  proComponents: 41,
  families: 11,
  proFamilies: 8,
  // Live numbers (stars / downloads) would be fetched at build/runtime; until a
  // data source is wired we show the static, verifiable facts and label the
  // dynamic ones as such rather than inventing figures.
  githubStars: null as number | null,
  npmDownloads: null as number | null,
} as const

/** Whether the Pro funnel is live (Phase 2). Phase 1 keeps this false. */
export const PRO_LIVE = false

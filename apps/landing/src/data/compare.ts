/**
 * Comparison data for the /compare page.
 *
 * An honest, neutral feature matrix of dzup-ui alongside other popular Vue 3
 * component libraries. The goal is to summarise public, verifiable facts so
 * evaluators can find the right fit — not to rank or disparage. Every library
 * listed here is a capable, actively maintained project.
 *
 * Each figure is sourced from the library's official documentation (linked in
 * `LIBRARIES[].href`) and dated via `COMPARE_UPDATED`. Component counts are
 * approximate — libraries count sub-components differently — so they are labelled
 * "~" and should be read as orders of magnitude, not exact leaderboard positions.
 *
 * To refresh: re-check each `href`, update the values + `COMPARE_UPDATED`, and
 * keep claims factual and neutral.
 *
 * The competitors' figures are quoted from their docs; OUR figure is derived from
 * our own source tree (`COUNTS`) — a page whose entire premise is verifiable facts
 * cannot be the one place we print an unverified number about ourselves, which is
 * what a hand-typed "~147 (free)" was doing next to a real count nowhere near it.
 * The real count is not restated here on purpose: see `COUNTS` for the live
 * value, never a literal in a comment.
 */

import { COUNTS } from '../generated/counts.ts'

/** Month the figures below were last verified against each library's public docs. */
export const COMPARE_UPDATED = 'July 2026'

/** A library column in the matrix. `self` marks dzup-ui (highlighted, first). */
export interface CompareLibrary {
  /** Stable key used to index each row's `values`. */
  key: string
  /** Display name. */
  name: string
  /** Official docs/home — the source cited for this column's facts. */
  href: string
  /** Short source label shown in the Sources list. */
  source: string
  /** True for dzup-ui itself (rendered as the emphasised column). */
  self?: boolean
}

/**
 * Libraries compared, dzup-ui first. Peers chosen for being the most widely used
 * general-purpose Vue 3 component libraries at the time of writing.
 */
export const LIBRARIES: CompareLibrary[] = [
  { key: 'dzup', name: 'dzup-ui', href: 'https://dzup-ui.com', source: 'dzup-ui.com', self: true },
  { key: 'primevue', name: 'PrimeVue', href: 'https://primevue.org', source: 'primevue.org' },
  { key: 'nuxtui', name: 'Nuxt UI', href: 'https://ui.nuxt.com', source: 'ui.nuxt.com' },
  { key: 'vuetify', name: 'Vuetify', href: 'https://vuetifyjs.com', source: 'vuetifyjs.com' },
  { key: 'elementplus', name: 'Element Plus', href: 'https://element-plus.org', source: 'element-plus.org' },
]

/** A feature row: one attribute compared across every library. */
export interface CompareRow {
  /** The attribute label (row header). */
  feature: string
  /** Optional clarifying note shown under the feature label. */
  note?: string
  /** Cell text keyed by `CompareLibrary.key`. Keep each value short + factual. */
  values: Record<string, string>
}

/**
 * The matrix rows. Values are deliberately short, factual descriptors — no
 * superlatives, no "best". Where a library offers a spectrum (e.g. styled +
 * unstyled), the cell says so rather than picking a side.
 */
export const ROWS: CompareRow[] = [
  {
    feature: 'Framework',
    values: {
      dzup: 'Vue 3',
      primevue: 'Vue 3',
      nuxtui: 'Vue 3 / Nuxt',
      vuetify: 'Vue 3',
      elementplus: 'Vue 3',
    },
  },
  {
    feature: 'Components',
    note: 'Others approximate — counted differently per library. Ours is exact: components with a docs page of their own.',
    values: {
      dzup: `${COUNTS.documentedComponents} documented (free)`,
      primevue: '~90+',
      nuxtui: '~100+',
      vuetify: '~80+',
      elementplus: '~80+',
    },
  },
  {
    feature: 'TypeScript',
    values: {
      dzup: 'Yes — strict, contract-first',
      primevue: 'Yes',
      nuxtui: 'Yes',
      vuetify: 'Yes',
      elementplus: 'Yes',
    },
  },
  {
    feature: 'Styling',
    values: {
      dzup: 'Tailwind CSS 4 + tailwind-variants',
      primevue: 'Styled or unstyled; Tailwind option',
      nuxtui: 'Tailwind CSS 4 + Tailwind Variants',
      vuetify: 'SASS (Material Design)',
      elementplus: 'SCSS',
    },
  },
  {
    feature: 'Theming & tokens',
    values: {
      dzup: 'OKLCH design tokens (--dz-* CSS vars)',
      primevue: 'Design tokens (primitive/semantic/component) + CSS vars',
      nuxtui: 'Tailwind + design tokens (app.config)',
      vuetify: 'Material theme (SASS + CSS vars)',
      elementplus: 'SCSS + CSS vars',
    },
  },
  {
    feature: 'Headless primitives',
    values: {
      dzup: 'Reka UI',
      primevue: 'Own (+ unstyled mode)',
      nuxtui: 'Reka UI',
      vuetify: 'Own (Material)',
      elementplus: 'Own',
    },
  },
  {
    feature: 'Accessibility',
    note: 'As stated by each project',
    values: {
      dzup: 'WCAG 2.2 AA target; axe-audited in CI',
      primevue: 'WCAG 2.1 AA; WAI-ARIA',
      nuxtui: 'Reka UI primitives (ARIA + keyboard)',
      vuetify: 'ARIA support; a11y guide',
      elementplus: 'ARIA support',
    },
  },
  {
    feature: 'Light / dark',
    values: {
      dzup: 'Light / dark / system',
      primevue: 'Yes',
      nuxtui: 'Yes',
      vuetify: 'Yes',
      elementplus: 'Yes',
    },
  },
  {
    feature: 'License',
    values: {
      dzup: 'MIT (core) · commercial (Pro)',
      primevue: 'MIT',
      nuxtui: 'MIT',
      vuetify: 'MIT',
      elementplus: 'MIT',
    },
  },
]

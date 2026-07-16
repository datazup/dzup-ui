/**
 * GENERATED FILE — do not edit by hand.
 *
 * Written by `apps/landing/scripts/build-counts.ts`, which runs from the landing
 * `build` script (and the Storybook one) ahead of the bundler. Every number
 * either app publishes about itself — the landing <head>, the feature grid, the
 * announcement bar, the comparison table, the Pro page, the Storybook docs —
 * reads from here.
 *
 * Hand-typed counts drift: this module exists because "147 components" was in the
 * meta description, the OpenGraph card AND the JSON-LD while the real figure was
 * 139. `src/generated/counts.ts` is regenerated from the filesystem and the real
 * registries, and `apps/landing/src/claims.spec.ts` reads the shipped files back
 * off disk and fails the build if any published claim disagrees with it.
 */

/**
 * The two component counts, each with its rule stated — mirroring DESIGN.md,
 * which publishes both. Never print one without saying which it is.
 *
 * `catalogComponents` is the CATALOG size: every exported `.vue` component,
 * including compound sub-parts such as `DzCardBody`. `documentedComponents` is
 * the DOCUMENTED size: components with a dedicated Storybook page (compound
 * sub-parts are documented through their parent).
 */
export const CATALOG_COUNT_RULE
  = 'every exported `.vue` component, including compound sub-parts such as `DzCardBody`'

/** The rule behind `documentedComponents`. @see CATALOG_COUNT_RULE */
export const DOCUMENTED_COUNT_RULE
  = 'components with a dedicated Storybook page (compound sub-parts are documented through their parent)'

/** Both component counts for one family, and real names from it. */
export interface FamilyCount {
  /** Family dir, e.g. `buttons` — the key in both the source and stories trees. */
  key: string
  /** Display label, e.g. `Buttons`. */
  label: string
  /** `.vue` files in this family (the catalog rule). */
  catalog: number
  /** Components in this family with a docs page of their own. */
  documented: number
  /** Up to five real, deep-linkable component names from this family. */
  examples: string[]
}

/** Per-family breakdown, in display order. Sums to `COUNTS.catalogComponents`. */
export const FAMILY_COUNTS: FamilyCount[] = [
  { key: 'buttons', label: 'Buttons', catalog: 10, documented: 8, examples: ['DzButton', 'DzButtonGroup', 'DzCopyButton', 'DzFab', 'DzIconButton'] },
  { key: 'inputs', label: 'Inputs', catalog: 8, documented: 8, examples: ['DzInput', 'DzInputGroup', 'DzInputMask', 'DzNumberInput', 'DzOtpInput'] },
  { key: 'forms', label: 'Forms', catalog: 31, documented: 28, examples: ['DzCascader', 'DzCheckbox', 'DzCheckboxGroup', 'DzColorPicker', 'DzCombobox'] },
  { key: 'cards', label: 'Cards', catalog: 6, documented: 3, examples: ['DzCard', 'DzImageCard', 'DzStatCard'] },
  { key: 'data', label: 'Data', catalog: 31, documented: 19, examples: ['DzAccordion', 'DzAnimatedNumber', 'DzCalendar', 'DzChip', 'DzCodeBlock'] },
  { key: 'feedback', label: 'Feedback', catalog: 20, documented: 16, examples: ['DzAlert', 'DzAsyncBoundary', 'DzBadge', 'DzBlockUI', 'DzEmpty'] },
  { key: 'layout', label: 'Layout', catalog: 21, documented: 17, examples: ['DzAffix', 'DzAppShell', 'DzAspectRatio', 'DzCollapse', 'DzContainer'] },
  { key: 'navigation', label: 'Navigation', catalog: 23, documented: 12, examples: ['DzAnchor', 'DzBackTop', 'DzBreadcrumb', 'DzColorModeToggle', 'DzMegaMenu'] },
  { key: 'overlays', label: 'Overlays', catalog: 33, documented: 10, examples: ['DzCommandPalette', 'DzConfirmDialog', 'DzContextMenu', 'DzDialog', 'DzDropdownMenu'] },
  { key: 'media', label: 'Media', catalog: 14, documented: 10, examples: ['DzAvatar', 'DzAvatarGroup', 'DzCarousel', 'DzEmoji', 'DzIcon'] },
  { key: 'typography', label: 'Typography', catalog: 8, documented: 8, examples: ['DzBlockquote', 'DzCaption', 'DzCode', 'DzHeading', 'DzKbd'] },
]

/** Every published figure, derived. */
export const COUNTS = {
  /** Every exported `.vue` under `packages/core/src/components`. @see CATALOG_COUNT_RULE */
  catalogComponents: 205,
  /** Components with a dedicated Storybook page. @see DOCUMENTED_COUNT_RULE */
  documentedComponents: 139,
  /** Component families. */
  families: 11,
  /** Copy-paste blocks — `BLOCKS.length` in `src/blocks/registry.ts`. */
  blocks: 87,
  /** Animation effects — `CATALOG.length` in `src/gallery/catalog.ts`. */
  effects: 59,
  /** Animation categories — `CATEGORIES.length` in `src/gallery/catalog.ts`. */
  effectCategories: 11,
  /** Full-page templates — `TEMPLATES.length` in `src/templates/registry.ts`. */
  templates: 44,
  /** Story files across the 11 families, `*Parts` bundles included. */
  storyFiles: 176,
} as const

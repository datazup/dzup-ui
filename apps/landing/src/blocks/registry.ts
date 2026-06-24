/**
 * Block registry — the single typed source of truth for the Blocks catalog.
 *
 * Drives the /blocks index page, the category nav, deep-link anchors (#<id>),
 * search/filtering, the live `BlockPreview`, and a CI completeness test.
 * See docs/blocks.md §3.3 (data model) and §4 (the catalog).
 *
 * Phase A1 ships the *schema only*: the types, the ordered category metadata,
 * and an empty `BLOCKS` array. Later tasks (A5, A7, Phase B) fill `BLOCKS` with
 * one entry per block, pairing a lazily-loaded `component` with its `?raw`
 * `source` string so the Code tab never drifts from what renders.
 */

import { defineAsyncComponent } from 'vue'
import type { Component } from 'vue'

/**
 * Top-level catalog categories. Order here is the canonical browse order used by
 * the index page and category nav. Matches docs/blocks.md §4.1–§4.5.
 */
export type BlockCategory =
  | 'marketing'
  | 'application'
  | 'auth'
  | 'commerce'
  | 'content'

/**
 * A single ready-made block. Composed purely from free `@dzup-ui/core`
 * components and `--dz-*` tokens, so it drops in already themed and accessible.
 * Shape per docs/blocks.md §3.3.
 */
export interface BlockDef {
  /** kebab-case, unique across the catalog; used as the deep-link anchor (`#hero-split`). */
  id: string
  /** Human title, e.g. "Split hero with media". */
  title: string
  /** One line: what it is / when to use it. */
  description: string
  /** Which category section the block lives under. */
  category: BlockCategory
  /** Free-form tags for filter/search, e.g. `['hero', 'cta']`. */
  tags: string[]
  /**
   * Real `Dz*` export names of the `@dzup-ui/core` components used. Powers the
   * "Built from N components" chips and a CI test that every name maps to a real
   * export — so no invented component names. Authors list real names only.
   */
  components: string[]
  /** The live Vue block (loaded lazily via `defineAsyncComponent` in later tasks). */
  component: Component
  /** Raw source string (Vite `?raw` import) shown verbatim in the Code tab. */
  source: string
  /** Notes when a mobile variant differs from the default layout. */
  responsive?: { mobile?: boolean }
}

/** Display metadata for a category section on the index page. */
export interface CategoryMeta {
  id: BlockCategory
  /** Section heading, e.g. "Marketing". */
  label: string
  /** Short intro line under the section heading. */
  blurb: string
}

/**
 * Ordered category metadata. The array order is the section order on /blocks.
 */
export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'marketing',
    label: 'Marketing',
    blurb: 'Heroes, pricing, testimonials, FAQs, CTAs and footers — the building blocks of a landing page.',
  },
  {
    id: 'application',
    label: 'Application',
    blurb: 'App shells, page headers, stat rows, data tables and settings — the surfaces of a product UI.',
  },
  {
    id: 'auth',
    label: 'Auth & Forms',
    blurb: 'Sign-in, sign-up, password reset, OTP and multi-step wizards — accessible, validated form flows.',
  },
  {
    id: 'commerce',
    label: 'Commerce',
    blurb: 'Product grids, detail pages, carts and checkout summaries for storefront experiences.',
  },
  {
    id: 'content',
    label: 'Content',
    blurb: 'Blog lists, article headers, prose and code showcases for editorial and documentation pages.',
  },
]

// ---------------------------------------------------------------------------
// Component + source pairing (docs/blocks.md §3.2)
// ---------------------------------------------------------------------------

/**
 * Static import maps Vite analyses at build time. `import.meta.glob` resolves
 * every block `.vue` under `src/blocks/<category>/` twice off the *same* path:
 *   • lazily, for the live preview `component`;
 *   • eagerly as a `?raw` string, for the Code tab `source`.
 * Pairing both from one path guarantees the source shown equals the file that
 * renders — zero drift between preview and snippet.
 */
const blockComponents = import.meta.glob<{ default: Component }>('./*/*.vue')

const blockSources = import.meta.glob('./*/*.vue', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

/**
 * Pairs a block's lazily-loaded component with its exact `?raw` source from a
 * single path (relative to this file, e.g. `'./marketing/HeroCentered.vue'`).
 */
function loadBlock(path: string): Pick<BlockDef, 'component' | 'source'> {
  const loader = blockComponents[path]
  const source = blockSources[path]
  if (!loader || source === undefined) {
    throw new Error(
      `[blocks] No .vue found at "${path}". Paths are relative to src/blocks/ ` +
        `and must match "./<category>/<Name>.vue".`,
    )
  }
  return { component: defineAsyncComponent(loader), source }
}

/** A block's authored metadata; `path` resolves its `component` + `source`. */
type BlockEntry = Omit<BlockDef, 'component' | 'source'> & {
  /** Path to the block `.vue`, relative to this file (`./<category>/<Name>.vue`). */
  path: string
}

/**
 * Build a `BlockDef` from one entry — keeps per-block boilerplate to a single
 * object: author the metadata, point `path` at the `.vue`, done.
 */
function defineBlock({ path, ...meta }: BlockEntry): BlockDef {
  return { ...meta, ...loadBlock(path) }
}

// ---------------------------------------------------------------------------
// The catalog
// ---------------------------------------------------------------------------

/**
 * How to add a block (one entry, no other wiring):
 *
 *   1. Author the SFC at `src/blocks/<category>/<Name>.vue`, composed only from
 *      free `@dzup-ui/core` components and `--dz-*` tokens (docs/blocks.md §3.6).
 *   2. Add ONE `defineBlock({ … })` entry below, grouped under its category:
 *
 *        defineBlock({
 *          id: 'hero-split',                         // kebab, unique → deep-link #id
 *          title: 'Split hero with media',
 *          description: 'Copy left, framed product image right.',
 *          category: 'marketing',
 *          tags: ['hero', 'cta'],
 *          components: ['DzHeading', 'DzText', 'DzButton', 'DzImage'], // real Dz* names
 *          path: './marketing/HeroSplit.vue',        // resolves component + ?raw source
 *        }),
 *
 *   That's it — `path` pairs the live component with its exact source via the
 *   static `import.meta.glob` maps above, so the Code tab can never drift from
 *   what renders, and `components[]` drives the "Built from" chips.
 */
export const BLOCKS: BlockDef[] = [
  // — Marketing —
  defineBlock({
    id: 'hero-centered',
    title: 'Centered hero',
    description: 'Eyebrow chip, headline, subhead and two call-to-action buttons, centered.',
    category: 'marketing',
    tags: ['hero', 'cta'],
    components: ['DzBadge', 'DzHeading', 'DzText', 'DzButton'],
    path: './marketing/HeroCentered.vue',
  }),
  defineBlock({
    id: 'hero-split',
    title: 'Split hero with media',
    description: 'Copy and two CTAs on the left, a framed product image on the right; stacks to one column on narrow viewports.',
    category: 'marketing',
    tags: ['hero', 'cta', 'image'],
    components: ['DzBadge', 'DzHeading', 'DzText', 'DzButton', 'DzImage', 'DzAspectRatio'],
    path: './marketing/HeroSplit.vue',
  }),
  defineBlock({
    id: 'nav-bar',
    title: 'Top navigation bar',
    description: 'Responsive top bar with logo, nav links, search input, theme toggle, primary CTA, and a mobile drawer.',
    category: 'marketing',
    tags: ['navigation', 'header', 'responsive', 'mobile'],
    components: ['DzButton', 'DzIconButton', 'DzSearchInput', 'DzColorModeToggle', 'DzSheet', 'DzSheetTrigger', 'DzSheetContent', 'DzSheetTitle', 'DzSheetDescription', 'DzSheetClose', 'DzText'],
    path: './marketing/NavBar.vue',
  }),
  defineBlock({
    id: 'feature-grid',
    title: 'Feature grid',
    description: 'Six feature cards, each with a lucide icon, title, and short blurb; responsive 3→2→1 column grid.',
    category: 'marketing',
    tags: ['features', 'grid', 'cards'],
    components: ['DzCard', 'DzCardBody', 'DzHeading', 'DzText', 'DzIcon'],
    path: './marketing/FeatureGrid.vue',
  }),
  defineBlock({
    id: 'stats-band',
    title: 'Stats band',
    description: 'A horizontal band of four key metrics with icon, trend indicator, and an animated count-up on scroll.',
    category: 'marketing',
    tags: ['stats', 'metrics', 'animated'],
    components: ['DzStatCard', 'DzAnimatedNumber'],
    path: './marketing/StatsBand.vue',
  }),
  defineBlock({
    id: 'pricing-3',
    title: 'Three-tier pricing',
    description: 'Free / Pro / Enterprise pricing cards with feature lists, a "Most popular" badge on Pro, and responsive 3→2→1 column layout.',
    category: 'marketing',
    tags: ['pricing', 'cards', 'cta'],
    components: ['DzCard', 'DzBadge', 'DzButton', 'DzDivider', 'DzHeading', 'DzText'],
    path: './marketing/PricingThree.vue',
  }),
  defineBlock({
    id: 'testimonials',
    title: 'Testimonials grid',
    description: 'Grid of customer quote cards each with a star rating, avatar, name/role, and quote text; responsive 3→2→1 columns.',
    category: 'marketing',
    tags: ['testimonials', 'social-proof', 'grid'],
    components: ['DzCard', 'DzAvatar', 'DzRating', 'DzHeading', 'DzText'],
    path: './marketing/Testimonials.vue',
  }),
  defineBlock({
    id: 'faq',
    title: 'FAQ accordion',
    description: 'Six Q&A items in a separated collapsible accordion with a section header and a contact link.',
    category: 'marketing',
    tags: ['faq', 'accordion', 'content'],
    components: ['DzAccordion', 'DzAccordionItem', 'DzAccordionTrigger', 'DzAccordionContent', 'DzHeading', 'DzText'],
    path: './marketing/Faq.vue',
  }),
  defineBlock({
    id: 'cta-band',
    title: 'CTA band',
    description: 'Closing call-to-action with headline, subtext, and two buttons on a token gradient background.',
    category: 'marketing',
    tags: ['cta', 'conversion'],
    components: ['DzHeading', 'DzText', 'DzButton'],
    path: './marketing/CtaBand.vue',
  }),
  defineBlock({
    id: 'footer',
    title: 'Multi-column footer',
    description: 'Brand blurb, four link columns, social icon buttons, and a theme toggle; collapses to two columns on mobile.',
    category: 'marketing',
    tags: ['footer', 'navigation', 'links'],
    components: ['DzText', 'DzDivider', 'DzIconButton', 'DzColorModeToggle'],
    path: './marketing/Footer.vue',
  }),

  // — Application —
  defineBlock({
    id: 'app-shell',
    title: 'App shell',
    description: 'Collapsible sidebar nav, breadcrumb top bar and user avatar menu inside a constrained app-shell preview.',
    category: 'application',
    tags: ['layout', 'shell', 'sidebar', 'navigation'],
    components: ['DzAppShell', 'DzSidebar', 'DzSidebarHeader', 'DzSidebarSection', 'DzSidebarItem', 'DzSidebarFooter', 'DzBreadcrumb', 'DzBreadcrumbItem', 'DzAvatar', 'DzBadge', 'DzButton', 'DzDropdownMenu', 'DzDropdownMenuTrigger', 'DzDropdownMenuContent', 'DzDropdownMenuItem', 'DzDropdownMenuSeparator', 'DzHeading', 'DzText'],
    path: './application/AppShell.vue',
  }),
  defineBlock({
    id: 'page-header',
    title: 'Page header',
    description: 'Breadcrumb trail, page title with inline status badge, and a row of contextual action buttons.',
    category: 'application',
    tags: ['header', 'breadcrumb', 'actions'],
    components: ['DzBreadcrumb', 'DzBreadcrumbItem', 'DzHeading', 'DzBadge', 'DzButton'],
    path: './application/PageHeader.vue',
  }),
  defineBlock({
    id: 'stat-row',
    title: 'Stat card row',
    description: 'Four KPI cards with up/down/neutral trend deltas in a responsive 4→2→1 column grid.',
    category: 'application',
    tags: ['stats', 'kpi', 'dashboard', 'cards'],
    components: ['DzStatCard'],
    path: './application/StatRow.vue',
  }),
  defineBlock({
    id: 'table-card',
    title: 'Data table card',
    description: 'Outlined card with a search + segmented filter toolbar, a hoverable data table with avatars and status badges, and paginated results.',
    category: 'application',
    tags: ['table', 'search', 'pagination', 'data'],
    components: ['DzCard', 'DzSearchInput', 'DzSegmented', 'DzTable', 'DzTableHeader', 'DzTableBody', 'DzTableRow', 'DzTableCell', 'DzAvatar', 'DzBadge', 'DzPagination', 'DzText'],
    path: './application/TableCard.vue',
  }),
  defineBlock({
    id: 'empty-state',
    title: 'Empty state',
    description: 'Styled icon illustration, heading, supporting copy and a primary call-to-action button for zero-data screens.',
    category: 'application',
    tags: ['empty', 'placeholder', 'zero-state'],
    components: ['DzEmpty', 'DzButton'],
    path: './application/EmptyState.vue',
  }),
  defineBlock({
    id: 'settings-layout',
    title: 'Settings layout',
    description: 'Horizontal tab nav over three panels — profile form fields, notification switches, and appearance options — with a sticky footer.',
    category: 'application',
    tags: ['settings', 'form', 'tabs', 'switches'],
    components: ['DzTabs', 'DzTabList', 'DzTabTrigger', 'DzTabContent', 'DzFormField', 'DzFormLabel', 'DzFormDescription', 'DzInput', 'DzSelect', 'DzSwitch', 'DzDivider', 'DzButton', 'DzText'],
    path: './application/SettingsLayout.vue',
  }),

  // — Auth & Forms —
  defineBlock({
    id: 'sign-in',
    title: 'Sign-in card',
    description: 'Centered card with email, password, remember-me checkbox, forgot-password link, primary submit, labeled divider, and GitHub/Google social buttons.',
    category: 'auth',
    tags: ['auth', 'login', 'social'],
    components: ['DzCard', 'DzFormField', 'DzFormLabel', 'DzInput', 'DzPasswordInput', 'DzCheckbox', 'DzDivider', 'DzButton', 'DzHeading', 'DzText'],
    path: './auth/SignIn.vue',
  }),
  defineBlock({
    id: 'sign-up',
    title: 'Sign-up card',
    description: 'Centered card with name, email, password plus a live strength meter, terms checkbox, and submit.',
    category: 'auth',
    tags: ['auth', 'registration', 'password-strength'],
    components: ['DzCard', 'DzFormField', 'DzFormLabel', 'DzInput', 'DzPasswordInput', 'DzProgress', 'DzCheckbox', 'DzButton', 'DzHeading', 'DzText'],
    path: './auth/SignUp.vue',
  }),
  defineBlock({
    id: 'auth-split',
    title: 'Two-column auth',
    description: 'Sign-in form left, token-gradient brand/marketing panel right; collapses to single column on mobile.',
    category: 'auth',
    tags: ['auth', 'split', 'marketing', 'responsive'],
    components: ['DzCard', 'DzFormField', 'DzFormLabel', 'DzInput', 'DzPasswordInput', 'DzButton', 'DzHeading', 'DzText'],
    path: './auth/AuthSplit.vue',
    responsive: { mobile: true },
  }),
  defineBlock({
    id: 'wizard',
    title: 'Multi-step form wizard',
    description: 'Three-step onboarding wizard with stepper nav, per-step form fields, Back/Continue buttons, and a completion state.',
    category: 'auth',
    tags: ['auth', 'wizard', 'stepper', 'multi-step'],
    components: ['DzStepper', 'DzStepperItem', 'DzFormField', 'DzFormLabel', 'DzInput', 'DzButton', 'DzHeading', 'DzText'],
    path: './auth/Wizard.vue',
  }),
]

/** All blocks in a given category, preserving registration order. */
export function blocksByCategory(category: BlockCategory): BlockDef[] {
  return BLOCKS.filter((block) => block.category === category)
}

/**
 * Block registry — the single typed source of truth for the Blocks catalog.
 *
 * Drives the /blocks index page, the category nav, deep-link anchors (#<id>),
 * search/filtering, the live `BlockPreview`, and a CI completeness test.
 * See docs/blocks.md §3.3 (data model) and §4 (the catalog).
 *
 * The file holds the types, the ordered category metadata, and `BLOCKS` itself —
 * one entry per shipped block, discovered by a module-level `import.meta.glob`
 * rather than hand-listed. Each entry pairs a lazily-loaded `component` with the
 * `?raw` source resolved off the same `path` (see `sources.ts`), so the Code tab
 * never drifts from what renders.
 *
 * Because the glob is evaluated at module scope, this module only loads under a
 * bundler: Node scripts (`scripts/build-registry.ts`) must pull `BLOCKS` through
 * Vite's `ssrLoadModule`, never a plain `import`.
 *
 * This module is reachable from the ENTRY chunk (`router.ts` head resolution and
 * the site-wide ⌘K palette both need block metadata), so keep it metadata-only —
 * anything eager and bulky imported here is downloaded by every first-time visitor
 * to `/`. Block source text lives in `sources.ts` for exactly this reason.
 */

import type { Component } from 'vue'
import { lazyComponent } from '../lib/lazyComponent.ts'

/**
 * Top-level catalog categories. Order here is the canonical browse order used by
 * the index page and category nav. Matches docs/blocks.md §4.1–§4.5.
 */
export type BlockCategory
  = | 'marketing'
    | 'application'
    | 'layout'
    | 'media'
    | 'data'
    | 'feedback'
    | 'overlays'
    | 'buttons'
    | 'auth'
    | 'forms'
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
  /**
   * Path of the block's SFC relative to `src/blocks/` (e.g.
   * `'./marketing/HeroCentered.vue'`) — the same string that resolves the block's
   * `component`, and the key you pass to `getBlockSource()` for its `?raw` text.
   * Lets build tooling (the sitemap's git-derived `<lastmod>`) locate the file on
   * disk without a parallel path convention.
   *
   * There is deliberately no `source` field: it would inline all 87 blocks' source
   * text into the entry chunk (see `sources.ts`). Call `getBlockSource(block.path)`
   * from lazy code instead.
   */
  path: string
  /** Notes when a mobile variant differs from the default layout. */
  responsive?: { mobile?: boolean }
  /**
   * Conservative floor for the live preview frame while this lazy block loads.
   * Values remain applied after resolution, so they must not exceed the block's
   * rendered height at the corresponding breakpoint. This prevents supporting
   * content below the preview from shifting when a short skeleton is replaced
   * by a taller block without imposing one oversized floor on the whole catalog.
   */
  previewMinHeight?: { wide: number, compact: number }
}

/**
 * A decorative palette name from `@dzup-ui/tokens` — resolves to the
 * `--dz-colors-<accent>-<shade>` CSS custom properties shipped for every hue.
 * Used purely to give each category its own visual identity on /blocks; carries
 * no semantic meaning (see tokens `primitives/colors.ts`).
 */
export type CategoryAccent
  = | 'rose' | 'red' | 'orange' | 'amber' | 'yellow' | 'lime' | 'green'
    | 'emerald' | 'teal' | 'cyan' | 'sky' | 'blue' | 'indigo' | 'violet'
    | 'purple' | 'fuchsia' | 'pink'

/** Display metadata for a category section on the index page. */
export interface CategoryMeta {
  id: BlockCategory
  /** Section heading, e.g. "Marketing". */
  label: string
  /** Short intro line under the section heading. */
  blurb: string
  /**
   * Decorative accent hue for this category — colors the nav tab/pill, block
   * card chips and the preview chrome so each group reads as its own family.
   * Spread across the OKLCH wheel so adjacent tabs stay visually distinct.
   */
  accent: CategoryAccent
}

/**
 * Ordered category metadata. The array order is the section order on /blocks.
 */
export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'marketing',
    label: 'Marketing',
    blurb: 'Heroes, pricing, testimonials, FAQs, CTAs and footers — the building blocks of a landing page.',
    accent: 'violet',
  },
  {
    id: 'application',
    label: 'Application',
    blurb: 'App shells, page headers, stat rows, data tables and settings — the surfaces of a product UI.',
    accent: 'blue',
  },
  {
    id: 'layout',
    label: 'Layout',
    blurb: 'Page shells and structural scaffolding composed from the Layout family — bento grids, resizable workspaces, masonry galleries, sticky asides, toolbar canvases and full page scaffolds built from Grid, Flex, Stack, Container, Panel, Toolbar, Resizable, Masonry, Affix, ScrollArea and Collapse.',
    accent: 'cyan',
  },
  {
    id: 'media',
    label: 'Media',
    blurb: 'Image-first surfaces composed from the Media family — lightbox galleries, autoplaying carousels, before/after comparison sliders, stacked avatar rosters, QR handoff cards and watermarked previews, all framed with DzImage, DzAspectRatio and `--dz-*` tokens.',
    accent: 'pink',
  },
  {
    id: 'data',
    label: 'Data display',
    blurb: 'Data grids, timelines, descriptions, trees, collection galleries, ranked lists and countdowns — composed from the Data family to present records, history and metrics.',
    accent: 'teal',
  },
  {
    id: 'feedback',
    label: 'Feedback',
    blurb: 'Alerts, notifications, toasts, loading skeletons, usage meters and result screens — composed from the Feedback family to keep users informed about state, progress and outcomes.',
    accent: 'amber',
  },
  {
    id: 'overlays',
    label: 'Overlays',
    blurb: 'Layered, anchored surfaces composed from the Overlays family — a ⌘K command palette, dropdown and context menus, popovers, tooltips, modal dialogs, slide-out sheets, inline/modal confirmations and a spotlight product tour, all focus-trapped, dismissible and token-themed.',
    accent: 'purple',
  },
  {
    id: 'buttons',
    label: 'Buttons',
    blurb: 'Action affordances composed from the Buttons family — galleries, toolbars, segmented groups, social sign-in, and floating actions.',
    accent: 'indigo',
  },
  {
    id: 'auth',
    label: 'Auth & Forms',
    blurb: 'Sign-in, sign-up, password reset, OTP and multi-step wizards — accessible, validated form flows.',
    accent: 'emerald',
  },
  {
    id: 'forms',
    label: 'Forms & Inputs',
    blurb: 'Newsletter, contact, payment, feedback, filter and profile forms — composed from the Inputs and Forms families with built-in labels, validation and accessibility.',
    accent: 'sky',
  },
  {
    id: 'commerce',
    label: 'Commerce',
    blurb: 'Product grids, detail pages, carts and checkout summaries for storefront experiences.',
    accent: 'orange',
  },
  {
    id: 'content',
    label: 'Content',
    blurb: 'Blog lists, article headers, prose and code showcases for editorial and documentation pages.',
    accent: 'rose',
  },
]

// ---------------------------------------------------------------------------
// Component + source pairing (docs/blocks.md §3.2)
// ---------------------------------------------------------------------------

/**
 * Static import map Vite analyses at build time. `import.meta.glob` resolves every
 * block `.vue` under `src/blocks/<category>/` lazily, for the live preview
 * `component`.
 *
 * The matching `?raw` source text is globbed off the *same* path pattern in
 * `sources.ts`, so the source shown in the Code tab is always the file that renders
 * — zero drift between preview and snippet. It lives in a separate module because it
 * is eager, and eager source text must not reach the entry chunk; see the header of
 * `sources.ts`.
 */
const blockComponents = import.meta.glob<{ default: Component }>('./*/*.vue')

/**
 * Resolves a block's lazily-loaded component from its path (relative to this file,
 * e.g. `'./marketing/HeroCentered.vue'`).
 */
function loadBlock(path: string): Pick<BlockDef, 'component'> {
  const loader = blockComponents[path]
  if (!loader) {
    throw new Error(
      `[blocks] No .vue found at "${path}". Paths are relative to src/blocks/ `
      + `and must match "./<category>/<Name>.vue".`,
    )
  }
  // lazyComponent (not bare defineAsyncComponent) so every block has loading /
  // error / timeout states — a failed chunk shows a retry, never a blank hole.
  return { component: lazyComponent(loader) }
}

/**
 * Resolves one block's `?raw` SFC text.
 *
 * Injected, never imported, by the pure projection modules (`registryItem.ts`,
 * `llmsText.ts`): those are deliberately runtime-free so the bare Node generator can
 * import them, and `sources.ts` carries an `import.meta.glob` that only Vite can
 * evaluate. Browser callers pass `block => getBlockSource(block.path)`; the
 * generator passes the same after `ssrLoadModule`-ing it — the pattern the templates'
 * `rawSources.ts` already uses. Declared here because this module is types-first and
 * both sides already import `BlockDef` from it.
 */
export type BlockSourceLookup = (block: BlockDef) => string

/** A block's authored metadata; `path` resolves its `component` (and its source). */
type BlockEntry = Omit<BlockDef, 'component'>

/**
 * Build a `BlockDef` from one entry — keeps per-block boilerplate to a single
 * object: author the metadata, point `path` at the `.vue`, done.
 */
function defineBlock(meta: BlockEntry): BlockDef {
  return { ...meta, ...loadBlock(meta.path) }
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
    // Measured lower bounds across the production preview's responsive widths.
    // The lazy scaffold is 248px tall; without these floors the details section
    // moves 203.625px on desktop and 439.219px at 390px when the chunk resolves.
    previewMinHeight: { wide: 400, compact: 687 },
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

  // — Layout —
  defineBlock({
    id: 'bento-grid',
    title: 'Bento dashboard grid',
    description: 'A spanning "bento box" dashboard laid out with DzGrid — a 2×2 revenue hero, a fixed-ratio media tile, compact stat panels and a full-width footer cell, all collapsing to a single column on mobile.',
    category: 'layout',
    tags: ['grid', 'bento', 'dashboard', 'responsive'],
    components: ['DzGrid', 'DzPanel', 'DzAspectRatio', 'DzDivider', 'DzBadge', 'DzHeading', 'DzText', 'DzIcon'],
    path: './layout/BentoGrid.vue',
  }),
  defineBlock({
    id: 'resizable-workspace',
    title: 'Resizable workspace',
    description: 'An IDE-style three-pane shell built on DzResizable — a collapsible file explorer, an editor and a live preview, each scrolling independently in a DzScrollArea, with draggable handles and a DzToolbar across the top.',
    category: 'layout',
    tags: ['resizable', 'splitter', 'ide', 'panes', 'scroll-area'],
    components: ['DzResizable', 'DzResizablePanel', 'DzResizableHandle', 'DzScrollArea', 'DzToolbar', 'DzDivider', 'DzBadge', 'DzIcon', 'DzText'],
    path: './layout/ResizableWorkspace.vue',
  }),
  defineBlock({
    id: 'masonry-gallery',
    title: 'Masonry gallery',
    description: 'A Pinterest-style cascading board built on DzMasonry — variable-height DzCards, some leading with a DzAspectRatio media tile, packed into balanced responsive columns (3 → 2 → 1) with no row gaps.',
    category: 'layout',
    tags: ['masonry', 'gallery', 'cards', 'responsive'],
    components: ['DzMasonry', 'DzAspectRatio', 'DzCard', 'DzAvatar', 'DzBadge', 'DzTag', 'DzHeading', 'DzText'],
    path: './layout/MasonryGallery.vue',
  }),
  defineBlock({
    id: 'sticky-aside',
    title: 'Sticky aside docs layout',
    description: 'A documentation shell where the "On this page" nav pins on scroll via DzAffix — DzContainer sets the measure, DzFlex splits prose from the aside, a DzScrollArea holds a long related list, and the aside lifts onto a surface once pinned.',
    category: 'layout',
    tags: ['affix', 'sticky', 'docs', 'sidebar', 'toc'],
    components: ['DzAffix', 'DzContainer', 'DzFlex', 'DzScrollArea', 'DzDivider', 'DzBadge', 'DzHeading', 'DzText'],
    path: './layout/StickyAside.vue',
    responsive: { mobile: true },
  }),
  defineBlock({
    id: 'toolbar-canvas',
    title: 'Toolbar canvas shell',
    description: 'A design-tool shell — a DzToolbar with start/center/end regions over a vertical DzFlex tool rail (a DzSpacer pushing settings to the bottom), a scrollable DzScrollArea artboard, and a DzPanel inspector with DzDivider-fenced groups.',
    category: 'layout',
    tags: ['toolbar', 'spacer', 'flex', 'editor', 'shell'],
    components: ['DzToolbar', 'DzFlex', 'DzSpacer', 'DzScrollArea', 'DzPanel', 'DzDivider', 'DzIconButton', 'DzBadge', 'DzIcon', 'DzText'],
    path: './layout/ToolbarCanvas.vue',
  }),
  defineBlock({
    id: 'page-scaffold',
    title: 'Responsive page scaffold',
    description: 'A whole landing page assembled from layout primitives only — DzContainer for measure, DzFlex + DzSpacer for the header bar, DzStack for hero rhythm, a responsive DzGrid feature row, a DzFlex content/aside split and a DzDivider-fenced footer.',
    category: 'layout',
    tags: ['container', 'grid', 'flex', 'stack', 'spacer', 'page'],
    components: ['DzContainer', 'DzGrid', 'DzFlex', 'DzStack', 'DzSpacer', 'DzDivider', 'DzButton', 'DzBadge', 'DzHeading', 'DzText', 'DzIcon'],
    path: './layout/PageScaffold.vue',
    responsive: { mobile: true },
  }),
  defineBlock({
    id: 'collapsible-sections',
    title: 'Collapsible settings sections',
    description: 'A settings page of expandable DzPanels (each owning its open state via v-model:collapsed) spaced by a DzStack, with DzSwitch rows and DzDivider inside — plus a standalone DzCollapse "advanced" region toggled by a button, the primitive DzPanel wraps.',
    category: 'layout',
    tags: ['panel', 'collapse', 'stack', 'settings', 'accordion'],
    components: ['DzPanel', 'DzCollapse', 'DzContainer', 'DzStack', 'DzDivider', 'DzSwitch', 'DzButton', 'DzHeading', 'DzText', 'DzIcon'],
    path: './layout/CollapsibleSections.vue',
  }),

  // — Media —
  defineBlock({
    id: 'media-gallery',
    title: 'Lightbox gallery',
    description: 'An asymmetric image grid where every ratio-stable DzImage tile (framed by DzAspectRatio) opens a focus-trapped DzLightbox with captions, a counter, and arrow-key navigation.',
    category: 'media',
    tags: ['gallery', 'lightbox', 'images', 'grid'],
    components: ['DzImage', 'DzAspectRatio', 'DzLightbox', 'DzBadge', 'DzHeading', 'DzText'],
    path: './media/Gallery.vue',
  }),
  defineBlock({
    id: 'media-carousel',
    title: 'Featured carousel',
    description: 'A looping, autoplaying DzCarousel of DzImage slides with gradient captions, hover-to-pause, and DzCarouselPrevious / DzCarouselNext / DzCarouselDots navigation.',
    category: 'media',
    tags: ['carousel', 'slider', 'autoplay', 'images'],
    components: ['DzCarousel', 'DzCarouselSlide', 'DzCarouselPrevious', 'DzCarouselNext', 'DzCarouselDots', 'DzImage', 'DzAspectRatio', 'DzBadge', 'DzHeading', 'DzText'],
    path: './media/CarouselShowcase.vue',
  }),
  defineBlock({
    id: 'media-comparison',
    title: 'Before / after slider',
    description: 'A draggable, keyboard-operable DzImageComparison revealing a graded edit over the raw frame, with before/after label chips and a live reveal read-out wired to v-model:position.',
    category: 'media',
    tags: ['comparison', 'before-after', 'slider', 'reveal'],
    components: ['DzImageComparison', 'DzImage', 'DzBadge', 'DzHeading', 'DzText'],
    path: './media/BeforeAfter.vue',
  }),
  defineBlock({
    id: 'media-team',
    title: 'Team roster',
    description: 'A stacked DzAvatarGroup with a "+N" overflow chip over a member list, each row pairing a DzAvatar (image or initials fallback) with a presence dot and an online/away DzBadge.',
    category: 'media',
    tags: ['avatars', 'team', 'group', 'presence'],
    components: ['DzAvatarGroup', 'DzAvatar', 'DzBadge', 'DzHeading', 'DzText'],
    path: './media/TeamAvatars.vue',
  }),
  defineBlock({
    id: 'media-qr',
    title: 'QR handoff card',
    description: 'A "continue on mobile" card built around DzQRCode — a token-styled SVG code with a centered brand mark via the #logo slot, error-level H, a pairing code, and an expire/refresh status flow.',
    category: 'media',
    tags: ['qr-code', 'handoff', 'share', 'card'],
    components: ['DzQRCode', 'DzButton', 'DzDivider', 'DzBadge', 'DzHeading', 'DzText'],
    path: './media/QrShareCard.vue',
  }),
  defineBlock({
    id: 'media-watermark',
    title: 'Watermarked preview',
    description: 'A confidential asset draped in a tiled, rotated DzWatermark over a framed DzImage — the aria-hidden, pointer-transparent overlay stamps ownership without blocking interaction.',
    category: 'media',
    tags: ['watermark', 'confidential', 'preview', 'image'],
    components: ['DzWatermark', 'DzImage', 'DzAspectRatio', 'DzBadge', 'DzHeading', 'DzText'],
    path: './media/ProtectedPreview.vue',
  }),

  // — Data display —
  defineBlock({
    id: 'data-grid',
    title: 'Data grid card',
    description: 'A DzDataGrid of deployments with sortable columns, multi-row selection, a paginated footer, and a #cell slot rendering avatars, environment tags and status badges.',
    category: 'data',
    tags: ['data-grid', 'table', 'sortable', 'selection', 'pagination'],
    components: ['DzDataGrid', 'DzCard', 'DzAvatar', 'DzBadge', 'DzTag', 'DzText'],
    path: './data/DataGridCard.vue',
  }),
  defineBlock({
    id: 'activity-timeline',
    title: 'Activity timeline',
    description: 'A vertical DzTimeline feed of events — tone-coded dots, timestamp statuses, avatar indicators, and per-item tags for a "who did what, when" history.',
    category: 'data',
    tags: ['timeline', 'activity', 'feed', 'history'],
    components: ['DzTimeline', 'DzTimelineItem', 'DzAvatar', 'DzBadge', 'DzTag', 'DzText', 'DzCard'],
    path: './data/ActivityTimeline.vue',
  }),
  defineBlock({
    id: 'detail-descriptions',
    title: 'Detail descriptions panel',
    description: 'A read-only label/value record view built from DzDescriptions — a responsive, bordered term/definition grid with slot-rich values (status badge, plan and label tags, monospaced payment) and a full-width spanning row.',
    category: 'data',
    tags: ['descriptions', 'detail', 'record', 'key-value'],
    components: ['DzDescriptions', 'DzDescriptionsItem', 'DzBadge', 'DzTag', 'DzButton', 'DzText', 'DzCard'],
    path: './data/DetailDescriptions.vue',
  }),
  defineBlock({
    id: 'file-tree',
    title: 'File explorer tree',
    description: 'A hierarchical DzTree with per-node lucide icons, expand/collapse and selection (both v-modelled) and the full APG roving-tabindex keyboard model, beside a live selection panel.',
    category: 'data',
    tags: ['tree', 'explorer', 'hierarchy', 'navigation'],
    components: ['DzTree', 'DzCard', 'DzBadge', 'DzText'],
    path: './data/FileTree.vue',
  }),
  defineBlock({
    id: 'collection-gallery',
    title: 'Collection gallery',
    description: 'A DzDataView template marketplace with a list/grid layout toggle, client-side sorting and a paginator; the #item slot renders rich cards in grid mode and compact rows in list mode from the same records.',
    category: 'data',
    tags: ['data-view', 'gallery', 'grid', 'list', 'sort'],
    components: ['DzDataView', 'DzCard', 'DzBadge', 'DzTag', 'DzButton', 'DzText'],
    path: './data/DataViewGallery.vue',
  }),
  defineBlock({
    id: 'leaderboard',
    title: 'Animated leaderboard',
    description: 'A ranked DzList where each row pairs a rank badge + avatar prefix with a DzAnimatedNumber score and a tone-coded delta tag; a refresh button mutates the values so the figures re-animate live.',
    category: 'data',
    tags: ['list', 'leaderboard', 'ranking', 'animated-number'],
    components: ['DzList', 'DzListItem', 'DzAnimatedNumber', 'DzAvatar', 'DzBadge', 'DzTag', 'DzButton', 'DzText', 'DzCard'],
    path: './data/Leaderboard.vue',
  }),
  defineBlock({
    id: 'release-countdown',
    title: 'Release countdown',
    description: 'A launch banner driven by DzCountdown — its slot renders labelled day/hour/minute/second cells ticking toward a deadline — with a DzAnimatedNumber count-up for claimed spots and a primary CTA.',
    category: 'data',
    tags: ['countdown', 'launch', 'timer', 'animated-number'],
    components: ['DzCountdown', 'DzAnimatedNumber', 'DzBadge', 'DzHeading', 'DzButton', 'DzText'],
    path: './data/ReleaseCountdown.vue',
  }),

  // — Feedback —
  defineBlock({
    id: 'alert-stack',
    title: 'Alert stack',
    description: 'A column of inline DzAlerts spanning the variant taxonomy and tones — info, success with an actions row, a closable warning, and a dismissible filled danger alert that can be restored.',
    category: 'feedback',
    tags: ['alert', 'inline', 'banner', 'dismissible'],
    components: ['DzAlert', 'DzButton', 'DzHeading', 'DzText'],
    path: './feedback/AlertStack.vue',
  }),
  defineBlock({
    id: 'notification-center',
    title: 'Notification center',
    description: 'A dismissible feed of persistent DzNotifications inside an outlined panel — tone-coded icons, titles, per-item action buttons, a live unread count badge, "Clear all", and an empty state.',
    category: 'feedback',
    tags: ['notification', 'feed', 'inbox', 'dismissible'],
    components: ['DzNotification', 'DzCard', 'DzBadge', 'DzButton', 'DzHeading', 'DzText'],
    path: './feedback/NotificationCenter.vue',
  }),
  defineBlock({
    id: 'toast-launcher',
    title: 'Toast notifications',
    description: 'The compound toast system wired up — DzToastProvider owns a capped, auto-dismissing queue, DzToastViewport renders it bottom-right, and a per-tone trigger row fires live toasts via the injected imperative API.',
    category: 'feedback',
    tags: ['toast', 'snackbar', 'ephemeral', 'provider'],
    components: ['DzToastProvider', 'DzToastViewport', 'DzToast', 'DzButton', 'DzHeading', 'DzText'],
    path: './feedback/ToastLauncher.vue',
  }),
  defineBlock({
    id: 'loading-states',
    title: 'Loading states',
    description: 'A content card that flips between loading and loaded — an indeterminate DzProgress bar and a DzSpinner status row over a DzSkeleton scaffold (circular, text and rectangular) that mirrors the real layout. "Reload" replays it.',
    category: 'feedback',
    tags: ['loading', 'skeleton', 'spinner', 'progress'],
    components: ['DzSkeleton', 'DzSpinner', 'DzProgress', 'DzCard', 'DzAvatar', 'DzButton', 'DzHeading', 'DzText'],
    path: './feedback/LoadingStates.vue',
  }),
  defineBlock({
    id: 'usage-meters',
    title: 'Usage meters',
    description: 'A quota dashboard pairing a segmented DzMeterGroup storage breakdown (with legend) against tone-coded DzProgress limit bars and a circular DzProgress ring summarising overall usage.',
    category: 'feedback',
    tags: ['meter', 'progress', 'usage', 'quota', 'dashboard'],
    components: ['DzMeterGroup', 'DzProgress', 'DzCard', 'DzBadge', 'DzDivider', 'DzHeading', 'DzText'],
    path: './feedback/UsageMeters.vue',
  }),
  defineBlock({
    id: 'result-states',
    title: 'Result screens',
    description: 'Full-page outcome screens from DzResult — a segmented switch across the success / error / warning / info statuses, each with its own icon, copy and contextual action buttons.',
    category: 'feedback',
    tags: ['result', 'status', 'outcome', 'empty-page'],
    components: ['DzResult', 'DzCard', 'DzButton'],
    path: './feedback/ResultStates.vue',
  }),

  // — Overlays —
  defineBlock({
    id: 'command-menu',
    title: 'Command menu',
    description: 'A ⌘K command palette (DzCommandPalette) — a search-field launcher with a DzKbd hint opens a fuzzy-searchable, grouped list of commands with per-item icons and shortcuts; the global ⌘K / Ctrl+K shortcut opens it too.',
    category: 'overlays',
    tags: ['command-palette', 'search', 'shortcut', 'cmdk'],
    components: ['DzCommandPalette', 'DzKbd', 'DzHeading', 'DzText'],
    path: './overlays/CommandMenu.vue',
  }),
  defineBlock({
    id: 'account-menu',
    title: 'Account dropdown menu',
    description: 'A product top bar with a rich DzDropdownMenu account menu — avatar trigger, an account header, icon-prefixed items with DzKbd shortcut suffixes, separators, and a destructive sign-out.',
    category: 'overlays',
    tags: ['dropdown', 'menu', 'account', 'header'],
    components: ['DzDropdownMenu', 'DzDropdownMenuTrigger', 'DzDropdownMenuContent', 'DzDropdownMenuItem', 'DzDropdownMenuSeparator', 'DzAvatar', 'DzBadge', 'DzIconButton', 'DzKbd', 'DzText'],
    path: './overlays/AccountMenu.vue',
  }),
  defineBlock({
    id: 'context-menu-board',
    title: 'Context menu canvas',
    description: 'A file canvas wrapped in a DzContextMenuTrigger — right-click (or the context-menu key) opens a DzContextMenu with icon-prefixed items, DzKbd shortcut suffixes, separators, a disabled item, and a destructive delete.',
    category: 'overlays',
    tags: ['context-menu', 'right-click', 'files', 'actions'],
    components: ['DzContextMenu', 'DzContextMenuTrigger', 'DzContextMenuContent', 'DzContextMenuItem', 'DzContextMenuSeparator', 'DzBadge', 'DzHeading', 'DzKbd', 'DzText'],
    path: './overlays/ContextMenuBoard.vue',
  }),
  defineBlock({
    id: 'info-popovers',
    title: 'Anchored popovers',
    description: 'Two DzPopover patterns side by side — a profile hover card (avatar, bio, follow action) and a non-modal filter panel with DzSwitch rows and apply/reset — each with an arrow and explicit side/alignment.',
    category: 'overlays',
    tags: ['popover', 'hover-card', 'filters', 'anchored'],
    components: ['DzPopover', 'DzPopoverTrigger', 'DzPopoverContent', 'DzAvatar', 'DzBadge', 'DzButton', 'DzDivider', 'DzSwitch', 'DzHeading', 'DzText'],
    path: './overlays/InfoPopovers.vue',
  }),
  defineBlock({
    id: 'tooltip-toolbar',
    title: 'Tooltip toolbar',
    description: 'A formatting toolbar where every DzIconButton is wrapped in a DzTooltip revealing its name and DzKbd shortcut on hover/focus — demonstrating per-side placement and a short open delay, with DzDivider-fenced groups.',
    category: 'overlays',
    tags: ['tooltip', 'toolbar', 'hint', 'shortcut'],
    components: ['DzTooltip', 'DzTooltipTrigger', 'DzTooltipContent', 'DzIconButton', 'DzKbd', 'DzDivider', 'DzHeading', 'DzText'],
    path: './overlays/TooltipToolbar.vue',
  }),
  defineBlock({
    id: 'create-dialog',
    title: 'Create dialog',
    description: 'A focus-trapped modal form built from the DzDialog compound — a trigger button, a backdrop-dimmed panel with title/description, a project form (input, textarea, select), a top-right close and a Cancel/Create footer.',
    category: 'overlays',
    tags: ['dialog', 'modal', 'form', 'create'],
    components: ['DzDialog', 'DzDialogTrigger', 'DzDialogContent', 'DzDialogTitle', 'DzDialogDescription', 'DzDialogClose', 'DzButton', 'DzInput', 'DzTextarea', 'DzSelect', 'DzFormField', 'DzFormLabel', 'DzBadge', 'DzHeading', 'DzText'],
    path: './overlays/CreateDialog.vue',
  }),
  defineBlock({
    id: 'confirm-actions',
    title: 'Confirm actions',
    description: 'A "danger zone" panel pairing the two confirmation patterns — heavy actions route through a modal DzConfirmDialog (the delete simulates an async, loading confirm) while low-risk row deletes use an inline DzPopconfirm bubble.',
    category: 'overlays',
    tags: ['confirm', 'dialog', 'popconfirm', 'danger'],
    components: ['DzConfirmDialog', 'DzPopconfirm', 'DzButton', 'DzIconButton', 'DzDivider', 'DzBadge', 'DzHeading', 'DzText'],
    path: './overlays/ConfirmActions.vue',
  }),
  defineBlock({
    id: 'detail-sheet',
    title: 'Detail sheet',
    description: 'A slide-out record panel (DzSheet) — an orders list where each row opens a right-side sheet with a pinned header/close, a scrollable body of customer and line-item details, a status badge, and a footer action bar.',
    category: 'overlays',
    tags: ['sheet', 'drawer', 'detail', 'side-panel'],
    components: ['DzSheet', 'DzSheetContent', 'DzSheetTitle', 'DzSheetDescription', 'DzSheetClose', 'DzAvatar', 'DzBadge', 'DzButton', 'DzIconButton', 'DzDivider', 'DzHeading', 'DzText'],
    path: './overlays/DetailSheet.vue',
  }),
  defineBlock({
    id: 'product-tour',
    title: 'Product tour',
    description: 'A spotlight onboarding walkthrough (DzTour) over a mini dashboard — "Start tour" dims the page, spotlights each target in turn, and shows an anchored step popover with Back/Next/Finish controls and progress dots.',
    category: 'overlays',
    tags: ['tour', 'onboarding', 'spotlight', 'walkthrough'],
    components: ['DzTour', 'DzButton', 'DzIconButton', 'DzBadge', 'DzHeading', 'DzText'],
    path: './overlays/ProductTour.vue',
  }),

  // — Buttons —
  defineBlock({
    id: 'button-showcase',
    title: 'Button gallery',
    description: 'A labelled specimen sheet of every DzButton variant, tone and size, plus icon and loading/disabled states — a living reference for the button scale.',
    category: 'buttons',
    tags: ['buttons', 'reference', 'variants', 'tones', 'sizes'],
    components: ['DzButton', 'DzText'],
    path: './buttons/ButtonShowcase.vue',
  }),
  defineBlock({
    id: 'editor-toolbar',
    title: 'Rich-text toolbar',
    description: 'A document toolbar built from the Buttons family — toggle buttons for inline format and alignment, icon-button history/insert actions, a copy-link button, and a split "Publish" action. Toggles are live.',
    category: 'buttons',
    tags: ['toolbar', 'editor', 'toggle', 'split-button', 'actions'],
    components: ['DzToggleButton', 'DzIconButton', 'DzCopyButton', 'DzSplitButton', 'DzSplitButtonAction', 'DzSplitButtonMenu', 'DzText'],
    path: './buttons/EditorToolbar.vue',
  }),
  defineBlock({
    id: 'button-groups',
    title: 'Button groups & segmented controls',
    description: 'DzButtonGroup wiring child buttons into connected controls — a live view switcher, a time-range segmented control, and a vertical action group.',
    category: 'buttons',
    tags: ['button-group', 'segmented', 'toggle', 'view-switcher'],
    components: ['DzButtonGroup', 'DzButton', 'DzText'],
    path: './buttons/ButtonGroups.vue',
  }),
  defineBlock({
    id: 'social-auth-buttons',
    title: 'Social sign-in buttons',
    description: 'A stacked column of full-width provider buttons (Google, GitHub, Apple), a labelled divider, and an email fallback — drop-in for any auth screen.',
    category: 'buttons',
    tags: ['auth', 'social', 'oauth', 'buttons'],
    components: ['DzButton', 'DzDivider', 'DzText'],
    path: './buttons/SocialAuthButtons.vue',
  }),
  defineBlock({
    id: 'floating-actions',
    title: 'Floating action button & speed dial',
    description: 'Circular elevated affordances — DzFab across tones and variants, and a DzSpeedDial that fans out related shortcuts on open, pinned inside a mock app canvas.',
    category: 'buttons',
    tags: ['fab', 'speed-dial', 'floating', 'actions'],
    components: ['DzFab', 'DzSpeedDial', 'DzText'],
    path: './buttons/FloatingActions.vue',
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
  defineBlock({
    id: 'otp-verify',
    title: 'OTP verification',
    description: 'A one-time-code card: a 6-digit DzOtpInput, a Verify button that enables once the code is complete, a live resend countdown, and a success state on completion.',
    category: 'auth',
    tags: ['auth', 'otp', '2fa', 'verification'],
    components: ['DzOtpInput', 'DzButton', 'DzHeading', 'DzText'],
    path: './auth/OtpVerify.vue',
  }),
  defineBlock({
    id: 'forgot-password',
    title: 'Forgot password',
    description: 'A two-state reset-request card — a validated email field (inline error via DzFormMessage) that swaps to a "check your inbox" confirmation with resend and back-to-sign-in actions.',
    category: 'auth',
    tags: ['auth', 'password', 'reset', 'validation'],
    components: ['DzCard', 'DzFormField', 'DzFormLabel', 'DzFormMessage', 'DzInput', 'DzButton', 'DzHeading', 'DzText'],
    path: './auth/ForgotPassword.vue',
  }),

  // — Forms & Inputs —
  defineBlock({
    id: 'newsletter-form',
    title: 'Newsletter signup',
    description: 'A focused subscribe card — an email DzInput with a mail-icon prefix and inline submit, a consent checkbox, and a success state. Live validation.',
    category: 'forms',
    tags: ['newsletter', 'subscribe', 'email', 'cta'],
    components: ['DzInput', 'DzCheckbox', 'DzButton', 'DzHeading', 'DzText'],
    path: './forms/NewsletterForm.vue',
  }),
  defineBlock({
    id: 'contact-form',
    title: 'Contact form',
    description: 'A labeled "get in touch" card: two-column name/email row, topic select, message textarea with a live character counter, and consent — with inline email validation via DzFormMessage.',
    category: 'forms',
    tags: ['contact', 'validation', 'select', 'textarea'],
    components: ['DzCard', 'DzFormField', 'DzFormLabel', 'DzFormDescription', 'DzFormMessage', 'DzInput', 'DzSelect', 'DzTextarea', 'DzCheckbox', 'DzButton', 'DzHeading', 'DzText'],
    path: './forms/ContactForm.vue',
  }),
  defineBlock({
    id: 'payment-form',
    title: 'Payment details',
    description: 'A checkout card showcasing masked and grouped inputs: DzInputMask formats the card number and expiry as you type, and a DzInputGroup pairs a promo field with an inline Apply button.',
    category: 'forms',
    tags: ['payment', 'checkout', 'mask', 'input-group'],
    components: ['DzCard', 'DzFormField', 'DzFormLabel', 'DzInput', 'DzInputMask', 'DzInputGroup', 'DzSelect', 'DzDivider', 'DzButton', 'DzHeading', 'DzText'],
    path: './forms/PaymentForm.vue',
  }),
  defineBlock({
    id: 'feedback-form',
    title: 'Feedback survey',
    description: 'A rating + survey card built from the scale controls — a half-step star DzRating, a frequency radio group, a 0–10 recommend slider with a live read-out, and a comments textarea.',
    category: 'forms',
    tags: ['feedback', 'survey', 'rating', 'slider'],
    components: ['DzCard', 'DzRating', 'DzRadioGroup', 'DzRadio', 'DzSlider', 'DzTextarea', 'DzFormField', 'DzFormLabel', 'DzButton', 'DzHeading', 'DzText'],
    path: './forms/FeedbackForm.vue',
  }),
  defineBlock({
    id: 'filter-panel',
    title: 'Filter sidebar',
    description: 'A product-listing filter rail: search input, category checkbox group, a dual-thumb price range slider with read-out, a minimum-rating radio group, and an in-stock switch, with a live active-filter count.',
    category: 'forms',
    tags: ['filters', 'sidebar', 'range', 'checkbox-group'],
    components: ['DzSearchInput', 'DzCheckboxGroup', 'DzCheckbox', 'DzRangeSlider', 'DzRadioGroup', 'DzRadio', 'DzSwitch', 'DzDivider', 'DzButton', 'DzHeading', 'DzText'],
    path: './forms/FilterPanel.vue',
  }),
  defineBlock({
    id: 'profile-form',
    title: 'Edit profile',
    description: 'A broad account panel: a file-upload avatar drop zone, name/username inputs, a role select, a bio textarea with counter, a free-text skills tags input, and a public-profile switch.',
    category: 'forms',
    tags: ['profile', 'settings', 'file-upload', 'tags'],
    components: ['DzCard', 'DzFileUpload', 'DzInput', 'DzTextarea', 'DzTagsInput', 'DzSelect', 'DzSwitch', 'DzFormField', 'DzFormLabel', 'DzFormDescription', 'DzDivider', 'DzButton', 'DzHeading', 'DzText'],
    path: './forms/ProfileForm.vue',
  }),
  defineBlock({
    id: 'booking-form',
    title: 'Booking form',
    description: 'A reservation card pairing the date/time/number controls — a DzDatePicker day, a 30-minute-step DzTimePicker slot, a clamped DzNumberInput party size, and a seating DzSelect.',
    category: 'forms',
    tags: ['booking', 'reservation', 'date', 'time'],
    components: ['DzCard', 'DzDatePicker', 'DzTimePicker', 'DzNumberInput', 'DzSelect', 'DzFormField', 'DzFormLabel', 'DzFormDescription', 'DzButton', 'DzHeading', 'DzText'],
    path: './forms/BookingForm.vue',
  }),
  defineBlock({
    id: 'record-form',
    title: 'Create record',
    description: 'A "create issue" panel built from the selection inputs — a searchable DzCombobox assignee, a DzMultiSelect labels picker, a single-select DzListbox priority, plus title and description fields.',
    category: 'forms',
    tags: ['combobox', 'multiselect', 'listbox', 'issue'],
    components: ['DzCard', 'DzCombobox', 'DzMultiSelect', 'DzListbox', 'DzInput', 'DzTextarea', 'DzFormField', 'DzFormLabel', 'DzButton', 'DzHeading', 'DzText'],
    path: './forms/RecordForm.vue',
  }),
  defineBlock({
    id: 'category-picker',
    title: 'Category picker',
    description: 'A hierarchical classification panel — a filterable DzTreeSelect for a nested category, a DzCascader region path (country → state → city), and a DzDateRangePicker availability window.',
    category: 'forms',
    tags: ['tree-select', 'cascader', 'date-range', 'hierarchy'],
    components: ['DzCard', 'DzTreeSelect', 'DzCascader', 'DzDateRangePicker', 'DzFormField', 'DzFormLabel', 'DzFormDescription', 'DzButton', 'DzHeading', 'DzText'],
    path: './forms/CategoryPicker.vue',
  }),
  defineBlock({
    id: 'appearance-editor',
    title: 'Appearance editor',
    description: 'A brand/theme customizer with a live preview — a DzColorPicker (presets + hex input) and two DzKnob rotary dials for radius and scale, reflected instantly in a preview panel.',
    category: 'forms',
    tags: ['color-picker', 'knob', 'theme', 'preview'],
    components: ['DzCard', 'DzColorPicker', 'DzKnob', 'DzFormField', 'DzFormLabel', 'DzButton', 'DzHeading', 'DzText'],
    path: './forms/AppearanceEditor.vue',
  }),
  defineBlock({
    id: 'invoice-builder',
    title: 'Invoice builder',
    description: 'A dynamic line-items editor — a DzInplace click-to-edit "Bill to" field over a DzFieldArray of removable description/qty/rate rows, an "Add line item" action, and a live total.',
    category: 'forms',
    tags: ['field-array', 'inplace', 'dynamic', 'invoice'],
    components: ['DzCard', 'DzFieldArray', 'DzInplace', 'DzInput', 'DzNumberInput', 'DzIconButton', 'DzDivider', 'DzButton', 'DzHeading', 'DzText'],
    path: './forms/InvoiceBuilder.vue',
  }),
  defineBlock({
    id: 'access-transfer',
    title: 'Share access',
    description: 'A sharing / permissions panel — a searchable DzTransfer dual-list of capabilities, a DzPersonaSelector owner picker (avatar + name + role), and a DzMention note with @-mentions.',
    category: 'forms',
    tags: ['transfer', 'persona', 'mention', 'permissions'],
    components: ['DzCard', 'DzTransfer', 'DzPersonaSelector', 'DzMention', 'DzFormField', 'DzFormLabel', 'DzButton', 'DzHeading', 'DzText'],
    path: './forms/AccessTransfer.vue',
  }),
  defineBlock({
    id: 'float-label-form',
    title: 'Float-label contact form',
    description: 'A compact, modern contact variant — each control wrapped in a DzFloatLabel (notched "on" variant) whose label rests in-field and floats onto the border on focus/fill.',
    category: 'forms',
    tags: ['float-label', 'contact', 'compact'],
    components: ['DzCard', 'DzFloatLabel', 'DzInput', 'DzSelect', 'DzTextarea', 'DzButton', 'DzHeading', 'DzText'],
    path: './forms/FloatLabelForm.vue',
  }),

  // — Commerce —
  defineBlock({
    id: 'product-grid',
    title: 'Product card grid',
    description: 'A storefront grid of product cards — image with a sale/new corner badge, name, read-only star rating with review count, current/original price, and an add-to-cart button; reflows 3 → 2 → 1 columns.',
    category: 'commerce',
    tags: ['product', 'grid', 'cards', 'rating'],
    components: ['DzImageCard', 'DzBadge', 'DzRating', 'DzButton', 'DzHeading', 'DzText'],
    path: './commerce/ProductGrid.vue',
    responsive: { mobile: true },
  }),
  defineBlock({
    id: 'product-detail',
    title: 'Product detail',
    description: 'A two-column product page — a looping DzCarousel gallery beside a buy box with rating, sale price, a size toggle group, stock badge and primary actions, over a full-width description / specs / shipping DzTabs panel.',
    category: 'commerce',
    tags: ['product', 'detail', 'gallery', 'tabs'],
    components: ['DzCarousel', 'DzCarouselSlide', 'DzCarouselPrevious', 'DzCarouselNext', 'DzCarouselDots', 'DzImage', 'DzAspectRatio', 'DzRating', 'DzButton', 'DzTabs', 'DzTabList', 'DzTabTrigger', 'DzTabContent', 'DzBadge', 'DzHeading', 'DzText'],
    path: './commerce/ProductDetail.vue',
    responsive: { mobile: true },
  }),
  defineBlock({
    id: 'cart-summary',
    title: 'Cart summary',
    description: 'An editable cart — a divided list of line items each with a thumbnail, a clamped quantity stepper and a remove action, plus live subtotal/shipping/tax/total rows and a checkout button.',
    category: 'commerce',
    tags: ['cart', 'checkout', 'quantity', 'totals'],
    components: ['DzList', 'DzListItem', 'DzNumberInput', 'DzButton', 'DzDivider', 'DzHeading', 'DzText'],
    path: './commerce/CartSummary.vue',
  }),
  defineBlock({
    id: 'checkout-summary',
    title: 'Checkout order summary',
    description: 'An order review panel — a DzDescriptions ship-to / delivery / payment grid, an itemised list, a promo-code field (try “SAVE10”) that adds a live discount line, and recomputed totals above a place-order button.',
    category: 'commerce',
    tags: ['checkout', 'order', 'promo', 'summary'],
    components: ['DzDescriptions', 'DzDescriptionsItem', 'DzInput', 'DzButton', 'DzDivider', 'DzBadge', 'DzHeading', 'DzText'],
    path: './commerce/CheckoutSummary.vue',
  }),
  defineBlock({
    id: 'category-header',
    title: 'Category header',
    description: 'The title bar above a product listing — a breadcrumb trail, category heading with a live product count, and a toolbar pairing a sort DzSelect with a grid/list DzSegmented view toggle.',
    category: 'commerce',
    tags: ['category', 'header', 'sort', 'toolbar'],
    components: ['DzHeading', 'DzSelect', 'DzSegmented', 'DzBreadcrumb', 'DzBreadcrumbItem', 'DzText'],
    path: './commerce/CategoryHeader.vue',
    responsive: { mobile: true },
  }),
  defineBlock({
    id: 'order-status',
    title: 'Order status tracker',
    description: 'A fulfilment timeline for a single order — a DzStepper rail from placed to delivered marking the parcel’s current stage, a tone-coded status badge, and a carrier / tracking / ETA detail grid; the rail turns vertical on mobile.',
    category: 'commerce',
    tags: ['order', 'tracking', 'stepper', 'status'],
    components: ['DzStepper', 'DzStepperItem', 'DzBadge', 'DzHeading', 'DzText'],
    path: './commerce/OrderStatus.vue',
    responsive: { mobile: true },
  }),

  // — Content —
  defineBlock({
    id: 'blog-list',
    title: 'Blog post list',
    description: 'A grid of editorial cards — cover image with a category badge overlay, title, excerpt, and an author byline with avatar and read time; reflows 3 → 2 → 1 columns.',
    category: 'content',
    tags: ['blog', 'cards', 'editorial', 'grid'],
    components: ['DzImageCard', 'DzBadge', 'DzAvatar', 'DzText'],
    path: './content/BlogList.vue',
    responsive: { mobile: true },
  }),
  defineBlock({
    id: 'article-header',
    title: 'Article header',
    description: 'A long-form masthead — category eyebrow, title and standfirst, a byline pairing an avatar with the author and a live DzRelativeTime published stamp, and a row of topic tags.',
    category: 'content',
    tags: ['article', 'header', 'byline', 'tags'],
    components: ['DzHeading', 'DzText', 'DzAvatar', 'DzTag', 'DzRelativeTime'],
    path: './content/ArticleHeader.vue',
  }),
  defineBlock({
    id: 'prose',
    title: 'Prose / rich content',
    description: 'A typographic article body composed from the long-form primitives — DzHeading sections, DzText paragraphs and lists with inline DzCode, a DzBlockquote pull-quote, a block code snippet, and DzDivider rules.',
    category: 'content',
    tags: ['prose', 'typography', 'article', 'blockquote', 'code'],
    components: ['DzHeading', 'DzText', 'DzBlockquote', 'DzCode', 'DzDivider'],
    path: './content/Prose.vue',
  }),
  defineBlock({
    id: 'code-showcase',
    title: 'Code showcase',
    description: 'A tabbed setup example — DzTabs switch between files, each a DzCodeBlock with a filename header and an explicit DzCopyButton wired into its actions slot that copies exactly the snippet on screen.',
    category: 'content',
    tags: ['code', 'tabs', 'copy', 'snippet'],
    components: ['DzCodeBlock', 'DzCopyButton', 'DzTabs', 'DzTabList', 'DzTabTrigger', 'DzTabContent'],
    path: './content/CodeShowcase.vue',
  }),
  defineBlock({
    id: 'toc-aside',
    title: 'Table-of-contents aside',
    description: 'A docs layout where a sticky DzAnchor "On this page" nav scrollspy-highlights the section in view beside a column of DzText prose with matching heading ids; collapses to one column on mobile.',
    category: 'content',
    tags: ['toc', 'anchor', 'docs', 'sticky', 'scrollspy'],
    components: ['DzAnchor', 'DzText'],
    path: './content/TocAside.vue',
    responsive: { mobile: true },
  }),
  defineBlock({
    id: 'faq-2col',
    title: 'Two-column FAQ',
    description: 'Questions grouped into two labelled DzAccordion columns (separated, single + collapsible) under a centered heading, so one answer is open per column at a time; stacks to one column on mobile.',
    category: 'content',
    tags: ['faq', 'accordion', 'two-column', 'content'],
    components: ['DzAccordion', 'DzAccordionItem', 'DzAccordionTrigger', 'DzAccordionContent', 'DzHeading', 'DzText'],
    path: './content/Faq2Col.vue',
    responsive: { mobile: true },
  }),
]

/** All blocks in a given category, preserving registration order. */
export function blocksByCategory(category: BlockCategory): BlockDef[] {
  return BLOCKS.filter(block => block.category === category)
}

/**
 * A single block by its `id` (the kebab-case deep-link anchor), or `undefined`
 * when no block owns that id. Backs the `/blocks/preview/:id` standalone route
 * and its router guard (docs/blocks.md §3.5) — an unknown id resolves here so the
 * caller can redirect rather than render a dead page.
 */
export function getBlock(id: string): BlockDef | undefined {
  return BLOCKS.find(block => block.id === id)
}

// ---------------------------------------------------------------------------
// Derived indexes (docs/blocks.md §3.1 — search/filter/reverse-lookup data)
// ---------------------------------------------------------------------------
//
// Pure projections of the (immutable) BLOCKS array shared by the discovery UI:
// the search composable, the tag-filter bar, the ⌘K palette and the component
// reverse-lookup. The catalog is built once at module load and never mutated,
// so the unique-value lists are memoized on first use and reused thereafter.

/** Memoized unique, sorted tag list across the whole catalog. */
let tagsCache: readonly string[] | null = null
/** Memoized unique, sorted component-name list across the whole catalog. */
let componentsCache: readonly string[] | null = null
/** Memoized component-name → blocks index, built lazily on first lookup. */
let usageCache: Map<string, BlockDef[]> | null = null

/**
 * Every tag used anywhere in the catalog — unique and alphabetically sorted.
 * Stable identity across calls (memoized), so it is safe to use as a render key.
 */
export function allTags(): readonly string[] {
  if (tagsCache === null) {
    const seen = new Set<string>()
    for (const block of BLOCKS) {
      for (const tag of block.tags) seen.add(tag)
    }
    tagsCache = [...seen].sort()
  }
  return tagsCache
}

/**
 * The union of every block's `components[]` — the real `Dz*` export names used
 * across the catalog, unique and alphabetically sorted. Memoized.
 */
export function allComponents(): readonly string[] {
  if (componentsCache === null) {
    const seen = new Set<string>()
    for (const block of BLOCKS) {
      for (const name of block.components) seen.add(name)
    }
    componentsCache = [...seen].sort()
  }
  return componentsCache
}

/**
 * Reverse lookup: every block whose `components[]` includes `name`, in registry
 * order. `name` is matched exactly (component names are real `Dz*` exports, e.g.
 * `blocksUsingComponent('DzTable')`). Returns a fresh array each call so callers
 * may sort/slice it freely; the underlying index is memoized.
 */
export function blocksUsingComponent(name: string): BlockDef[] {
  if (usageCache === null) {
    usageCache = new Map<string, BlockDef[]>()
    for (const block of BLOCKS) {
      for (const component of block.components) {
        const bucket = usageCache.get(component)
        if (bucket)
          bucket.push(block)
        else usageCache.set(component, [block])
      }
    }
  }
  const blocks = usageCache.get(name)
  return blocks ? [...blocks] : []
}

/**
 * Static content for the landing page. Counts and facts are drawn from the spec
 * Appendix A and CLAUDE.md. The component-family counts below sum to the 147
 * headline figure; the gallery deep-links use real Storybook story ids.
 */

import { storybookDocs } from './config.ts'

export interface Family {
  /** Display name. */
  label: string
  /** Component count for this family. */
  count: number
  /** Storybook deep-link (representative story docs page). */
  href: string
  /** One-line description of the family. */
  blurb: string
}

/** 11 free families (§4.6). Counts total to 147. */
export const FAMILIES: Family[] = [
  { label: 'Buttons', count: 10, href: storybookDocs('core-buttons-dzbutton'), blurb: 'Buttons, groups, split, FAB, speed-dial.' },
  { label: 'Inputs', count: 8, href: storybookDocs('core-inputs-dzinput'), blurb: 'Text, number, password, OTP, search, masks.' },
  { label: 'Forms', count: 30, href: storybookDocs('core-forms-dzcheckbox'), blurb: 'Selects, pickers, sliders, switches, fields.' },
  { label: 'Cards', count: 6, href: storybookDocs('core-cards-dzcard'), blurb: 'Surfaces, stat cards, image cards.' },
  { label: 'Data', count: 32, href: storybookDocs('core-data-dztable'), blurb: 'Tables, grids, trees, timelines, lists.' },
  { label: 'Feedback', count: 18, href: storybookDocs('core-feedback-dzalert'), blurb: 'Alerts, badges, progress, toasts, skeletons.' },
  { label: 'Layout', count: 20, href: storybookDocs('core-layout-dzcontainer'), blurb: 'Shell, grid, flex, splitter, scroll-area.' },
  { label: 'Navigation', count: 12, href: storybookDocs('core-navigation-dztabs'), blurb: 'Tabs, menus, breadcrumb, stepper, sidebar.' },
  { label: 'Overlays', count: 10, href: storybookDocs('core-overlays-dzdialog'), blurb: 'Dialog, sheet, popover, tooltip, command.' },
  { label: 'Media', count: 12, href: storybookDocs('core-media-dzavatar'), blurb: 'Avatars, image, carousel, lightbox, QR.' },
  { label: 'Typography', count: 9, href: storybookDocs('core-typography-dzheading'), blurb: 'Headings, text, code, kbd, blockquote.' },
]

export interface Feature {
  /** lucide-vue-next icon name (resolved in the component). */
  icon: string
  title: string
  body: string
}

/** Feature grid (§4.4) — drawn from real library facts. */
export const FEATURES: Feature[] = [
  { icon: 'Boxes', title: '147 components', body: 'Across 11 families — buttons to data grids — every one stable and documented.' },
  { icon: 'Accessibility', title: 'Accessible by default', body: 'WCAG AA, Reka UI primitives, full keyboard and ARIA support baked in.' },
  { icon: 'Palette', title: 'OKLCH design tokens', body: 'A three-tier system — primitive → semantic → component — in a perceptual color space.' },
  { icon: 'MoonStar', title: 'Light / dark / system', body: 'A single data-theme switch, FOUC-safe before first paint (ADR-15).' },
  { icon: 'Braces', title: 'TypeScript-first', body: 'Strict mode, full inference, and contract-typed props across every component.' },
  { icon: 'Wind', title: 'Tailwind CSS 4', body: 'Styled with tailwind-variants and design tokens — never raw colors.' },
  { icon: 'PackageCheck', title: 'SSR-safe, ESM-only', body: 'Tree-shakeable ESM with a first-party Nuxt module available.' },
  { icon: 'SwatchBook', title: 'Themeable', body: 'Swap tokens, not component code. Re-skin the whole library from one file.' },
]

/**
 * Ecosystem — the offerings that complement the components themselves (§ landing
 * "Beyond components"). Grounded in what comparable libraries ship around their
 * core: PrimeVue (450+ Blocks, paid Templates) and Tailwind Plus
 * (Marketing/Application/Ecommerce UI blocks + page Templates) sell pre-composed
 * Blocks and full-page Templates; the shadcn ecosystem (Aceternity, Magic UI,
 * Motion-Primitives) popularised drop-in Animations; Icons, Theme presets and a
 * Figma kit round out a mature design system. All are built on the SAME tokens,
 * a11y bar and component set as `@dzup-ui/core` so they stay visually identical
 * to the library they extend.
 *
 * Most are landing-page placeholders — they render a "Planned" state until the
 * offering ships. The shipped ones (Blocks → /blocks, Templates → /templates,
 * Animations → /animations) are 'available' and link to their own page; the rest
 * fill in their detail (counts, previews, links) later.
 */
export interface EcosystemItem {
  /** ICONS registry key (see icons.ts). */
  icon: string
  /** Display name. */
  title: string
  /** One-line description of what the offering is. */
  blurb: string
  /** Small category line under the title (the kinds of things it covers). */
  meta: string
  /**
   * Lifecycle state. 'planned' = announced, not yet shipped (shows a badge);
   * 'available' = shipped and interactive (the tile links to its `href`).
   */
  status: 'planned' | 'available'
  /** In-app route the tile links to when `status` is 'available'. */
  href?: string
}

/**
 * The three the team called out first (Blocks, Templates, Animations) lead, then
 * the "and similar" ecosystem pieces. Order = display order in the grid.
 */
export const ECOSYSTEM: EcosystemItem[] = [
  {
    icon: 'Blocks',
    title: 'Blocks',
    blurb: 'Pre-composed sections — heroes, pricing, navbars, stat rows, auth forms — built from core components. Copy, paste, ship.',
    meta: 'Marketing · Application',
    status: 'available',
    href: '/blocks',
  },
  {
    icon: 'LayoutTemplate',
    title: 'Templates',
    blurb: 'Full-page and full-app starters — dashboards, admin panels, landing pages, settings flows — wired and themed out of the box.',
    meta: 'Dashboards · Landing · Auth',
    status: 'available',
    href: '/templates',
  },
  {
    icon: 'Sparkles',
    title: 'Animations',
    blurb: 'Motion primitives and ready-made effects — scroll reveals, text and number transitions — that honour prefers-reduced-motion.',
    meta: '32 effects · 8 categories',
    status: 'available',
    href: '/animations',
  },
  {
    icon: 'Shapes',
    title: 'Icons',
    blurb: 'A curated icon set wired to the token system — sized, spaced and coloured exactly like the rest of the library.',
    meta: 'Curated · Tokenised',
    status: 'planned',
  },
  {
    icon: 'SwatchBook',
    title: 'Themes',
    blurb: 'Ready-made token themes and a visual editor — re-skin the whole library from a preset, then export the CSS variables.',
    meta: 'Presets · Editor',
    status: 'planned',
  },
  {
    icon: 'Figma',
    title: 'Figma kit',
    blurb: 'A design kit mirroring the components and OKLCH tokens, so design and code stay in lockstep from the first frame.',
    meta: 'Components · Tokens',
    status: 'planned',
  },
]

export interface ProComponent {
  label: string
  family: string
}

/** Pro components (§4.8, Appendix A) — shown with a "coming soon" state. */
export const PRO_COMPONENTS: ProComponent[] = [
  { label: 'Kanban', family: 'Planning' },
  { label: 'Gantt', family: 'Planning' },
  { label: 'Calendar', family: 'Planning' },
  { label: 'Scheduler', family: 'Planning' },
  { label: 'DataGridPro', family: 'Data Pro' },
  { label: 'CodeEditor', family: 'Editors' },
  { label: 'RichTextEditor', family: 'Editors' },
  { label: 'Chart', family: 'Visualization' },
  { label: 'WorkflowDesigner', family: 'Workflow' },
  { label: 'FormBuilder', family: 'Builders' },
  { label: 'PageBuilder', family: 'Builders' },
  { label: 'Chat', family: 'Communication' },
  { label: 'NotificationCenter', family: 'Communication' },
]

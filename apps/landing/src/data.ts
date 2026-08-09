/**
 * Static content for the landing page — the copy, and only the copy.
 *
 * **Every number here is derived.** The family counts, the headline component
 * figure and the animation-catalog line all read from `generated/counts.ts`,
 * which `scripts/build-counts.ts` globs out of the real source tree and the real
 * registries. The hand-typed versions of these were wrong in every instance: the
 * family rows summed to 167 (a figure matching nothing), the feature card said
 * "147 components" against a real 139, and the animations tile said 59 effects
 * without anything checking. Write prose here; take numbers from `COUNTS`.
 */

import { storybookDocs } from './config.ts'
import { COUNTS, FAMILY_COUNTS } from './generated/counts.ts'
import proShowcaseSnapshot from './generated/pro-showcase.snapshot.json'

export interface Family {
  /** Display name. */
  label: string
  /**
   * Components in this family with a Storybook page of their own — the
   * DOCUMENTED count. These sum to `COUNTS.documentedComponents` (the headline
   * figure), NOT to the larger catalog count, which includes compound sub-parts
   * documented through their parent.
   */
  count: number
  /** Storybook deep-link (representative story docs page). */
  href: string
  /** One-line description of the family. */
  blurb: string
}

/**
 * The hand-written half of a family row: where it links and how we describe it.
 * Keyed by the family key in `FAMILY_COUNTS`, which supplies the other half —
 * the label and the count — so a family can never be described but not counted,
 * or counted but not described (a missing key is a type error, not a wrong page).
 */
const FAMILY_COPY: Record<string, { story: string, blurb: string }> = {
  buttons: { story: 'core-buttons-dzbutton', blurb: 'Buttons, groups, split, FAB, speed-dial.' },
  inputs: { story: 'core-inputs-dzinput', blurb: 'Text, number, password, OTP, search, masks.' },
  forms: { story: 'core-forms-dzcheckbox', blurb: 'Selects, pickers, sliders, switches, fields.' },
  cards: { story: 'core-cards-dzcard', blurb: 'Surfaces, stat cards, image cards.' },
  data: { story: 'core-data-dztable', blurb: 'Tables, grids, trees, timelines, lists.' },
  feedback: { story: 'core-feedback-dzalert', blurb: 'Alerts, badges, progress, toasts, skeletons.' },
  layout: { story: 'core-layout-dzcontainer', blurb: 'Shell, grid, flex, splitter, scroll-area.' },
  navigation: { story: 'core-navigation-dztabs', blurb: 'Tabs, menus, breadcrumb, stepper, sidebar.' },
  overlays: { story: 'core-overlays-dzdialog', blurb: 'Dialog, sheet, popover, tooltip, command.' },
  media: { story: 'core-media-dzavatar', blurb: 'Avatars, image, carousel, lightbox, QR.' },
  typography: { story: 'core-typography-dzheading', blurb: 'Headings, text, code, kbd, blockquote.' },
}

/** The 11 free families (§4.6), counted from the source tree. */
export const FAMILIES: Family[] = FAMILY_COUNTS.map((family) => {
  const copy = FAMILY_COPY[family.key]
  if (!copy)
    throw new Error(`data.ts: family "${family.key}" has no copy — add it to FAMILY_COPY.`)
  return {
    label: family.label,
    count: family.documented,
    href: storybookDocs(copy.story),
    blurb: copy.blurb,
  }
})

export interface Feature {
  /** lucide-vue-next icon name (resolved in the component). */
  icon: string
  title: string
  body: string
}

/** Feature grid (§4.4) — drawn from real library facts. */
export const FEATURES: Feature[] = [
  { icon: 'Boxes', title: `${COUNTS.documentedComponents} components`, body: `Across ${COUNTS.families} families — buttons to data grids — every one stable and documented.` },
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
    meta: `${COUNTS.effects} effects · ${COUNTS.effectCategories} categories`,
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
    blurb: 'A visual OKLCH token editor with curated presets — re-skin the whole library live in light and dark, check contrast, then export the CSS variables or share a link.',
    meta: 'Editor · Presets · Export',
    status: 'available',
    href: '/themes',
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
  familyId: string
  storyId: string | null
  storyPath: string | null
}

/**
 * Public-safe projection generated by the Pro repository from its exported
 * design inventory and built Storybook index. This app imports JSON metadata,
 * never `@dzup-ui-pro/pro` source or runtime code.
 */
export const PRO_FAMILIES = proShowcaseSnapshot.families
export const PRO_COMPONENTS: ProComponent[] = PRO_FAMILIES.flatMap(family =>
  family.components.map(component => ({
    label: component.name,
    family: family.label,
    familyId: family.id,
    storyId: component.storyId,
    storyPath: component.storyPath,
  })),
)

/** Current Pro claims, all projected from the generated public snapshot. */
export const PRO_FACTS = {
  version: proShowcaseSnapshot.package.version,
  published: proShowcaseSnapshot.counts.publishedComponents,
  documented: proShowcaseSnapshot.counts.dedicatedDocumentationPages,
  families: proShowcaseSnapshot.counts.families,
  stories: proShowcaseSnapshot.counts.stories,
  sourceRevision: proShowcaseSnapshot.sourceRevision,
  countRules: proShowcaseSnapshot.countRules,
} as const

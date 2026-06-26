/**
 * Templates registry — the source of truth for the free, full-page starters
 * built from `@dzup-ui/core` and surfaced from the Ecosystem grid (docs/
 * templates.md §4). Templates are richer than the flat `ECOSYSTEM` items in
 * `data.ts` (each owns a lazy-loaded render, a stack list and a source path),
 * so they live in their own module rather than alongside the landing copy.
 *
 * This is the FOUNDATION only: the metadata model, the category taxonomy and an
 * (intentionally empty) `TEMPLATES` array. The catalogue rows (§6) and their
 * co-located render components land in later tasks (T2/T3+).
 */

import type { Component } from 'vue'

/**
 * The categories that drive the gallery filter (docs/templates.md §6). The free
 * tier ships six; the pro tier (§10) widens this later — keep additions in sync
 * with `TEMPLATE_CATEGORIES`.
 */
export type TemplateCategory =
  | 'dashboards'
  | 'auth'
  | 'marketing'
  | 'commerce'
  | 'content'
  | 'utility'

/**
 * Metadata describing one template. The render itself is a lazy-loaded
 * component (`load`) so the gallery and detail pages stay light — only the
 * previewed template's bundle is fetched.
 */
export interface TemplateMeta {
  /** URL slug, e.g. 'analytics-dashboard'. Unique across `TEMPLATES`. */
  slug: string
  /** Display name, e.g. 'Analytics Dashboard'. */
  name: string
  /** One-line description for the gallery card + detail header. */
  blurb: string
  /** Primary category — drives the gallery filter. */
  category: TemplateCategory
  /** The `@dzup-ui/core` components this template is built from ("Built with"). */
  stack: string[]
  /** ICONS registry key (see icons.ts) for the card when no thumbnail is ready. */
  icon: string
  /** Optional static thumbnail (screenshot) path; falls back to a live render. */
  thumbnail?: string
  /** Lazy import of the full-page (chromeless) template component. */
  load: () => Promise<{ default: Component }>
  /** Path to the source file, for the "View source" deep-link. */
  source: string
  /** Pricing tier. 'free' for all of these — 'pro' is reserved for the paid tier. */
  tier: 'free'
  /** Marks the strongest templates to feature first on the gallery. */
  featured?: boolean
  /**
   * Optional decorative-palette override for this template's gallery card. When
   * set, the card tints with this palette instead of its category accent — used
   * by the few templates that re-skin to a specific colourway (e.g. the teal
   * order-tracking page). See `PALETTE_CONFIGS` in `@dzup-ui/tokens`.
   */
  accent?: TemplateAccent
}

/**
 * The decorative-spectrum palettes the gallery tints cards with (a subset of the
 * `@dzup-ui/tokens` decorative spectrum). Each resolves to `--dz-colors-{name}-*`
 * shades at render time, so adding one only needs the palette to exist in tokens.
 */
export type TemplateAccent =
  | 'blue'
  | 'violet'
  | 'pink'
  | 'emerald'
  | 'amber'
  | 'cyan'
  | 'teal'
  | 'rose'
  | 'indigo'

/**
 * Category keys paired with their display labels and a gallery accent. Order =
 * filter display order. The `accent` tints every card in that category with a
 * distinct hue from the decorative spectrum so the grid reads as a spread of
 * colours rather than a wall of one brand tone; hues are spaced around the OKLCH
 * wheel (amber 75° → emerald 165° → cyan 210° → blue 258° → violet 292° → pink
 * 350°) so adjacent categories stay visually separable. Individual templates can
 * override via `TemplateMeta.accent`.
 */
export const TEMPLATE_CATEGORIES: { key: TemplateCategory; label: string; accent: TemplateAccent }[] = [
  { key: 'dashboards', label: 'Dashboards & Apps', accent: 'blue' },
  { key: 'auth', label: 'Auth & Account', accent: 'violet' },
  { key: 'marketing', label: 'Marketing', accent: 'pink' },
  { key: 'commerce', label: 'Commerce', accent: 'emerald' },
  { key: 'content', label: 'Content', accent: 'amber' },
  { key: 'utility', label: 'Utility', accent: 'cyan' },
]

/**
 * The template catalogue — one entry per §6 row. The three featured (⭐) starters
 * land first as the canonical references later batches copy (T3); the remaining
 * rows are added as their render components are authored (T4+).
 */
export const TEMPLATES: TemplateMeta[] = [
  {
    slug: 'analytics-dashboard',
    name: 'Analytics Dashboard',
    blurb:
      'A full app shell — sidebar nav, KPI row, revenue chart and a members table — wired and themed out of the box.',
    category: 'dashboards',
    stack: [
      'DzAppShell',
      'DzSidebar',
      'DzStatCard',
      'DzCard',
      'DzTable',
      'DzProgress',
      'DzBadge',
      'DzSegmented',
      'DzSearchInput',
      'DzAvatar',
    ],
    icon: 'LayoutDashboard',
    load: () => import('./analytics-dashboard/AnalyticsDashboard.vue'),
    source: 'apps/landing/src/templates/analytics-dashboard/AnalyticsDashboard.vue',
    tier: 'free',
    featured: true,
  },
  {
    slug: 'sign-in',
    name: 'Sign In',
    blurb:
      'A polished split-screen authentication page with a form card, social providers and a marketing panel.',
    category: 'auth',
    stack: [
      'DzCard',
      'DzFormField',
      'DzInput',
      'DzPasswordInput',
      'DzCheckbox',
      'DzButton',
      'DzDivider',
    ],
    icon: 'LogIn',
    load: () => import('./sign-in/SignIn.vue'),
    source: 'apps/landing/src/templates/sign-in/SignIn.vue',
    tier: 'free',
    featured: true,
  },
  {
    slug: 'saas-landing',
    name: 'SaaS Landing',
    blurb:
      'A conversion-ready marketing page — hero, feature grid, testimonial carousel, pricing teaser and an FAQ.',
    category: 'marketing',
    stack: ['DzButton', 'DzCard', 'DzBadge', 'DzAvatar', 'DzAccordion', 'DzCarousel', 'DzImage'],
    icon: 'Rocket',
    load: () => import('./saas-landing/SaasLanding.vue'),
    source: 'apps/landing/src/templates/saas-landing/SaasLanding.vue',
    tier: 'free',
    featured: true,
  },
  {
    slug: 'blog-post',
    name: 'Blog Post / Article',
    blurb:
      'A long-form editorial page — byline, token-painted cover, a sticky table-of-contents, rich prose with a blockquote and code, an author bio and related posts.',
    category: 'content',
    stack: [
      'DzHeading',
      'DzText',
      'DzBlockquote',
      'DzCodeBlock',
      'DzAnchor',
      'DzImage',
      'DzImageCard',
      'DzAvatar',
      'DzTag',
      'DzDivider',
      'DzCard',
      'DzButton',
    ],
    icon: 'PenLine',
    load: () => import('./blog-post/BlogPost.vue'),
    source: 'apps/landing/src/templates/blog-post/BlogPost.vue',
    tier: 'free',
    featured: true,
  },
  {
    slug: 'blog-index',
    name: 'Blog Index',
    blurb:
      'A magazine landing — searchable, category-filtered grid of article cards with a featured hero, bylines and pagination.',
    category: 'content',
    stack: [
      'DzImageCard',
      'DzSearchInput',
      'DzTag',
      'DzPagination',
      'DzAvatar',
      'DzHeading',
      'DzText',
      'DzButton',
    ],
    icon: 'Newspaper',
    load: () => import('./blog-index/BlogIndex.vue'),
    source: 'apps/landing/src/templates/blog-index/BlogIndex.vue',
    tier: 'free',
  },
  {
    slug: 'help-center',
    name: 'Help Center / FAQ',
    blurb:
      'A support hub — a search hero with popular queries, a topic-card grid, a live-filtered FAQ accordion and a "still need help" panel with the support team.',
    category: 'content',
    stack: [
      'DzSearchInput',
      'DzCard',
      'DzAccordion',
      'DzAlert',
      'DzTag',
      'DzBadge',
      'DzAvatar',
      'DzButton',
    ],
    icon: 'LifeBuoy',
    load: () => import('./help-center/HelpCenter.vue'),
    source: 'apps/landing/src/templates/help-center/HelpCenter.vue',
    tier: 'free',
  },
  {
    slug: 'changelog',
    name: 'Changelog / Releases',
    blurb:
      'A release feed on a vertical timeline — version badges, a "Latest" marker, changes tagged by type (Added / Fixed / Improved) and a code snippet, filterable by type.',
    category: 'content',
    stack: [
      'DzTimeline',
      'DzCard',
      'DzBadge',
      'DzTag',
      'DzCodeBlock',
      'DzDivider',
      'DzButton',
    ],
    icon: 'GitMerge',
    load: () => import('./changelog/Changelog.vue'),
    source: 'apps/landing/src/templates/changelog/Changelog.vue',
    tier: 'free',
  },
  {
    slug: 'docs-guide',
    name: 'Docs / Guide',
    blurb:
      'A documentation page — a grouped sidebar nav, breadcrumb trail, a prose article with note / caution callouts and code blocks, a sticky on-this-page rail and prev/next pager.',
    category: 'content',
    stack: [
      'DzBreadcrumb',
      'DzAnchor',
      'DzAlert',
      'DzCodeBlock',
      'DzSearchInput',
      'DzBadge',
      'DzDivider',
      'DzButton',
    ],
    icon: 'BookText',
    load: () => import('./docs-guide/DocsGuide.vue'),
    source: 'apps/landing/src/templates/docs-guide/DocsGuide.vue',
    tier: 'free',
  },
  {
    slug: 'newsroom',
    name: 'Newsroom / Press',
    blurb:
      'A press hub — a media-contact card, a pinned announcement, an "as featured in" wordmark row, downloadable press-kit cards and a dated release list with category badges.',
    category: 'content',
    stack: [
      'DzCard',
      'DzList',
      'DzBadge',
      'DzAvatar',
      'DzDivider',
      'DzButton',
      'DzHeading',
      'DzText',
    ],
    icon: 'Megaphone',
    load: () => import('./newsroom/Newsroom.vue'),
    source: 'apps/landing/src/templates/newsroom/Newsroom.vue',
    tier: 'free',
  },
  {
    slug: 'admin-crm',
    name: 'Admin / CRM',
    blurb:
      'A sales workspace — sidebar nav, lifecycle tabs, a searchable contacts data grid with row actions and pagination.',
    category: 'dashboards',
    stack: [
      'DzAppShell',
      'DzSidebar',
      'DzDataGrid',
      'DzPagination',
      'DzSearchInput',
      'DzDropdownMenu',
      'DzAvatar',
      'DzBadge',
      'DzTabs',
      'DzButton',
    ],
    icon: 'Contact',
    load: () => import('./admin-crm/AdminCrm.vue'),
    source: 'apps/landing/src/templates/admin-crm/AdminCrm.vue',
    tier: 'free',
  },
  {
    slug: 'project-board',
    name: 'Project / Task Board',
    blurb:
      'A kanban board with status lanes, checkable tasks, label tags, priority badges, assignee avatars and a list view.',
    category: 'dashboards',
    stack: [
      'DzAppShell',
      'DzCard',
      'DzList',
      'DzCheckbox',
      'DzAvatarGroup',
      'DzTag',
      'DzProgress',
      'DzTabs',
      'DzBadge',
    ],
    icon: 'FolderKanban',
    load: () => import('./project-board/ProjectBoard.vue'),
    source: 'apps/landing/src/templates/project-board/ProjectBoard.vue',
    tier: 'free',
  },
  {
    slug: 'app-settings',
    name: 'App Settings',
    blurb:
      'A tabbed settings surface — profile fields, notification switches and an appearance picker, wired with form controls.',
    category: 'dashboards',
    stack: [
      'DzAppShell',
      'DzTabs',
      'DzFormField',
      'DzInput',
      'DzSwitch',
      'DzSelect',
      'DzRadioGroup',
      'DzDivider',
      'DzButton',
    ],
    icon: 'Settings',
    load: () => import('./app-settings/AppSettings.vue'),
    source: 'apps/landing/src/templates/app-settings/AppSettings.vue',
    tier: 'free',
  },
  {
    slug: 'user-profile',
    name: 'User Profile',
    blurb:
      'A profile page — banner card with avatar and stats, a details description grid and an activity timeline across tabs.',
    category: 'dashboards',
    stack: [
      'DzCard',
      'DzAvatar',
      'DzDescriptions',
      'DzTabs',
      'DzBadge',
      'DzTimeline',
      'DzButton',
    ],
    icon: 'UserRound',
    load: () => import('./user-profile/UserProfile.vue'),
    source: 'apps/landing/src/templates/user-profile/UserProfile.vue',
    tier: 'free',
  },
  {
    slug: 'billing-plans',
    name: 'Billing & Plans',
    blurb:
      'A billing page — trial alert, monthly/yearly toggle, plan cards, a seat meter with usage bars and an invoices table.',
    category: 'dashboards',
    stack: [
      'DzCard',
      'DzTable',
      'DzBadge',
      'DzButton',
      'DzProgress',
      'DzMeterGroup',
      'DzAlert',
      'DzSegmented',
    ],
    icon: 'CreditCard',
    load: () => import('./billing-plans/BillingPlans.vue'),
    source: 'apps/landing/src/templates/billing-plans/BillingPlans.vue',
    tier: 'free',
  },
  {
    slug: 'team-members',
    name: 'Team Members',
    blurb:
      'A team directory — a members data grid with role and status badges, row actions, and an invite dialog with a team picker.',
    category: 'dashboards',
    stack: [
      'DzDataGrid',
      'DzAvatar',
      'DzBadge',
      'DzDropdownMenu',
      'DzDialog',
      'DzMultiSelect',
      'DzButton',
    ],
    icon: 'Users',
    load: () => import('./team-members/TeamMembers.vue'),
    source: 'apps/landing/src/templates/team-members/TeamMembers.vue',
    tier: 'free',
  },
  {
    slug: 'inbox-notifications',
    name: 'Inbox / Notifications',
    blurb:
      'A notifications feed — folder sidebar, All/Unread/Mentions tabs, an actor list with unread markers and a caught-up empty state.',
    category: 'dashboards',
    stack: ['DzAppShell', 'DzList', 'DzAvatar', 'DzBadge', 'DzTabs', 'DzEmpty', 'DzButton'],
    icon: 'Bell',
    load: () => import('./inbox-notifications/InboxNotifications.vue'),
    source: 'apps/landing/src/templates/inbox-notifications/InboxNotifications.vue',
    tier: 'free',
  },
  {
    slug: 'states-pack',
    name: 'Empty & Error States',
    blurb:
      'A reference page of the states every app needs — empty placeholders and success / error / warning results, each framed in a card with a clear next step.',
    category: 'utility',
    stack: ['DzEmpty', 'DzResult', 'DzCard', 'DzButton', 'DzHeading', 'DzText'],
    icon: 'FileSearch',
    load: () => import('./states-pack/StatesPack.vue'),
    source: 'apps/landing/src/templates/states-pack/StatesPack.vue',
    tier: 'free',
    featured: true,
  },
  {
    slug: 'not-found',
    name: '404 — Page Not Found',
    blurb:
      'A polished, centered 404 page — an oversized glyph, a DzResult headline with recovery actions and a card of helpful destinations.',
    category: 'utility',
    stack: ['DzResult', 'DzCard', 'DzButton', 'DzDivider', 'DzText'],
    icon: 'Compass',
    load: () => import('./not-found/NotFound.vue'),
    source: 'apps/landing/src/templates/not-found/NotFound.vue',
    tier: 'free',
  },
  {
    slug: 'system-status',
    name: 'System Status',
    blurb:
      'A public status page — a success-toned health summary, a service list with status badges and 90-day uptime bars, and a timeline of past incidents.',
    category: 'utility',
    stack: [
      'DzAlert',
      'DzCard',
      'DzBadge',
      'DzProgress',
      'DzTimeline',
      'DzDivider',
      'DzHeading',
      'DzText',
      'DzButton',
    ],
    icon: 'Activity',
    load: () => import('./system-status/SystemStatus.vue'),
    source: 'apps/landing/src/templates/system-status/SystemStatus.vue',
    tier: 'free',
  },
  {
    slug: 'maintenance',
    name: 'Scheduled Maintenance',
    blurb:
      "A centered \"we'll be right back\" page — an amber status badge, a live progress bar with an ETA, and a notify-me card pairing an email input with a call to action.",
    category: 'utility',
    stack: [
      'DzCard',
      'DzProgress',
      'DzInput',
      'DzButton',
      'DzBadge',
      'DzDivider',
      'DzHeading',
      'DzText',
    ],
    icon: 'Wrench',
    load: () => import('./maintenance/Maintenance.vue'),
    source: 'apps/landing/src/templates/maintenance/Maintenance.vue',
    tier: 'free',
  },
  {
    slug: 'product-detail',
    name: 'Product Detail',
    blurb:
      'A storefront product page — a gallery that re-tints with the colourway, a buy box with rating, swatches and quantity, plus tabs for specs and reviews.',
    category: 'commerce',
    stack: [
      'DzBreadcrumb',
      'DzImage',
      'DzRating',
      'DzBadge',
      'DzNumberInput',
      'DzButton',
      'DzTag',
      'DzTabs',
      'DzAccordion',
      'DzCard',
      'DzAvatar',
    ],
    icon: 'Headphones',
    load: () => import('./product-detail/ProductDetail.vue'),
    source: 'apps/landing/src/templates/product-detail/ProductDetail.vue',
    tier: 'free',
    featured: true,
  },
  {
    slug: 'product-listing',
    name: 'Product Listing',
    blurb:
      'A storefront catalogue — colour and feature filters, a price-range slider, sortable image cards with ratings and sale badges, and pagination.',
    category: 'commerce',
    stack: [
      'DzImageCard',
      'DzBadge',
      'DzRating',
      'DzSelect',
      'DzCheckboxGroup',
      'DzRangeSlider',
      'DzPagination',
      'DzEmpty',
      'DzButton',
    ],
    icon: 'Store',
    load: () => import('./product-listing/ProductListing.vue'),
    source: 'apps/landing/src/templates/product-listing/ProductListing.vue',
    tier: 'free',
  },
  {
    slug: 'checkout',
    name: 'Checkout',
    blurb:
      'A single-page grocery checkout — a stepper funnel, contact and shipping forms, a delivery picker, card payment, and a sticky order summary with editable quantities, a working promo code, live totals and a free-shipping nudge. Re-skinned emerald via tokens.',
    category: 'commerce',
    stack: [
      'DzStepper',
      'DzFormField',
      'DzInput',
      'DzSelect',
      'DzRadioGroup',
      'DzNumberInput',
      'DzCheckbox',
      'DzAlert',
      'DzCard',
      'DzBadge',
      'DzButton',
    ],
    icon: 'ShoppingCart',
    load: () => import('./checkout/Checkout.vue'),
    source: 'apps/landing/src/templates/checkout/Checkout.vue',
    tier: 'free',
  },
  {
    slug: 'order-tracking',
    name: 'Order Tracking',
    blurb:
      'A post-purchase page — a DzResult success header, a horizontal delivery tracker, an ordered-items card with totals, an order-facts grid with the shipping address, and a timeline of the shipment history. Re-skinned teal via tokens.',
    category: 'commerce',
    stack: [
      'DzResult',
      'DzStepper',
      'DzTimeline',
      'DzDescriptions',
      'DzCard',
      'DzBadge',
      'DzDivider',
      'DzButton',
    ],
    icon: 'PackageCheck',
    load: () => import('./order-tracking/OrderTracking.vue'),
    source: 'apps/landing/src/templates/order-tracking/OrderTracking.vue',
    tier: 'free',
    // The page itself re-skins teal via tokens — preview the same colourway.
    accent: 'teal',
  },
]

/** Resolve a template by its slug, or `undefined` if unknown. */
export function getTemplate(slug: string): TemplateMeta | undefined {
  return TEMPLATES.find((t) => t.slug === slug)
}

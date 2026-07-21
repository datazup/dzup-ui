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
export type TemplateCategory
  = | 'dashboards'
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
  /**
   * Free-text facets for gallery search + tag filtering. Drawn from the
   * controlled `TEMPLATE_TAGS` vocabulary (the `TemplateTag` union enforces this
   * at compile time so the catalogue stays a closed set, not a free-for-all).
   * Orthogonal to `category` — a row carries its category as a tag *plus* its
   * dominant patterns and notable traits (3–6 each), so the tag filter composes
   * with the category filter rather than duplicating it.
   */
  tags?: TemplateTag[]
  /**
   * ISO date ('YYYY-MM-DD') the template was added — drives recency sort and the
   * "New" badge (see `isNew`). Optional so pre-existing rows stay valid; new
   * rows should set it to their ship date.
   */
  createdAt?: string
}

/**
 * The decorative-spectrum palettes the gallery tints cards with (a subset of the
 * `@dzup-ui/tokens` decorative spectrum). Each resolves to `--dz-colors-{name}-*`
 * shades at render time, so adding one only needs the palette to exist in tokens.
 */
export type TemplateAccent
  = | 'blue'
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
export const TEMPLATE_CATEGORIES: { key: TemplateCategory, label: string, accent: TemplateAccent }[] = [
  { key: 'dashboards', label: 'Dashboards & Apps', accent: 'blue' },
  { key: 'auth', label: 'Auth & Account', accent: 'violet' },
  { key: 'marketing', label: 'Marketing', accent: 'pink' },
  { key: 'commerce', label: 'Commerce', accent: 'emerald' },
  { key: 'content', label: 'Content', accent: 'amber' },
  { key: 'utility', label: 'Utility', accent: 'cyan' },
]

/**
 * The controlled tag vocabulary the gallery's search + tag filter draw from
 * (docs/templates.md §2 "discovery", §4). Tags are an orthogonal facet to
 * `TEMPLATE_CATEGORIES`: a row tags its category *and* its dominant patterns and
 * notable traits, so the two filters AND-compose instead of overlapping. Keeping
 * this a closed list (the `TemplateTag` union below is derived from these keys)
 * means a typo in a row's `tags` is a type error, and E2 can render the filter
 * chips straight from this array without inventing labels. Grouped by facet for
 * readability; `key` is the kebab-case filter value, `label` the display chip.
 * Order = display order in the tag filter.
 */
export const TEMPLATE_TAGS = [
  // Category facets (mirror `TEMPLATE_CATEGORIES`, so tag-only search still hits a category).
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'auth', label: 'Auth' },
  { key: 'marketing', label: 'Marketing' },
  { key: 'commerce', label: 'Commerce' },
  { key: 'content', label: 'Content' },
  { key: 'utility', label: 'Utility' },
  // Layout / structure facets — the page's skeleton.
  { key: 'app-shell', label: 'App shell' },
  { key: 'sidebar', label: 'Sidebar' },
  { key: 'split-layout', label: 'Split layout' },
  { key: 'centered', label: 'Centered' },
  { key: 'grid', label: 'Grid' },
  { key: 'timeline', label: 'Timeline' },
  { key: 'kanban', label: 'Kanban' },
  { key: 'stepper', label: 'Stepper' },
  { key: 'tabs', label: 'Tabs' },
  // Component / interaction facets — the dominant building block.
  { key: 'form', label: 'Form' },
  { key: 'data-table', label: 'Data table' },
  { key: 'search', label: 'Search' },
  { key: 'pagination', label: 'Pagination' },
  { key: 'filters', label: 'Filters' },
  { key: 'accordion', label: 'Accordion' },
  { key: 'carousel', label: 'Carousel' },
  // Domain facets — what the page is *for*.
  { key: 'pricing', label: 'Pricing' },
  { key: 'billing', label: 'Billing' },
  { key: 'checkout', label: 'Checkout' },
  { key: 'product', label: 'Product' },
  { key: 'profile', label: 'Profile' },
  { key: 'settings', label: 'Settings' },
  { key: 'error-page', label: 'Error page' },
  { key: 'empty-state', label: 'Empty state' },
  // Trait facets — notable qualities worth filtering on.
  { key: 'responsive', label: 'Responsive' },
  { key: 'dark-mode', label: 'Dark mode' },
  { key: 'form-heavy', label: 'Form-heavy' },
  { key: 'typography', label: 'Typography' },
  { key: 're-skin', label: 'Re-skin' },
] as const

/**
 * The allowed tag keys, derived from `TEMPLATE_TAGS` so the vocabulary has a
 * single source of truth. `TemplateMeta.tags` is typed to this union, so any tag
 * not in the list above fails `yarn typecheck`.
 */
export type TemplateTag = (typeof TEMPLATE_TAGS)[number]['key']

/** Number of days a template stays "New" after its `createdAt`. */
const NEW_WINDOW_DAYS = 30

/**
 * True when `t` was added within the last {@link NEW_WINDOW_DAYS} days — drives
 * the gallery's "New" badge (E2). Pure and side-effect-free: pass `now` to make
 * it deterministic in tests; it only falls back to a fresh `Date` when omitted
 * (never at module load, so importing this file does no clock reads). Rows
 * without a `createdAt`, or with an unparseable one, are never "new".
 */
export function isNew(t: TemplateMeta, now?: Date): boolean {
  if (!t.createdAt)
    return false
  const created = new Date(`${t.createdAt}T00:00:00`)
  if (Number.isNaN(created.getTime()))
    return false
  const reference = now ?? new Date()
  const ageMs = reference.getTime() - created.getTime()
  return ageMs >= 0 && ageMs <= NEW_WINDOW_DAYS * 24 * 60 * 60 * 1000
}

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
    tags: ['dashboard', 'app-shell', 'sidebar', 'data-table', 'responsive'],
    createdAt: '2026-04-28',
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
    tags: ['auth', 'form', 'split-layout', 'responsive'],
    createdAt: '2026-04-29',
  },
  {
    slug: 'sign-up',
    name: 'Sign Up',
    blurb:
      'A split-screen register page — name, email and a password field with a live strength meter, terms and social sign-up, beside a marketing panel.',
    category: 'auth',
    stack: [
      'DzCard',
      'DzFormField',
      'DzInput',
      'DzPasswordInput',
      'DzCheckbox',
      'DzButton',
      'DzDivider',
      'DzProgress',
    ],
    icon: 'UserPlus',
    load: () => import('./sign-up/SignUp.vue'),
    source: 'apps/landing/src/templates/sign-up/SignUp.vue',
    tier: 'free',
    featured: true,
    tags: ['auth', 'form', 'split-layout', 'form-heavy', 'responsive'],
    createdAt: '2026-06-25',
  },
  {
    slug: 'reset-password',
    name: 'Forgot / Reset Password',
    blurb:
      'A centered card with two states in one page — request a reset link, then a "check your inbox" confirmation with a resend nudge.',
    category: 'auth',
    stack: ['DzCard', 'DzFormField', 'DzInput', 'DzButton', 'DzResult', 'DzAlert'],
    icon: 'KeyRound',
    load: () => import('./reset-password/ResetPassword.vue'),
    source: 'apps/landing/src/templates/reset-password/ResetPassword.vue',
    tier: 'free',
    tags: ['auth', 'form', 'centered', 'responsive'],
    createdAt: '2026-06-25',
  },
  {
    slug: 'verify-otp',
    name: 'OTP / 2FA Verify',
    blurb:
      'A centered verification card — a six-box one-time-code input, a resend countdown, an explanatory alert and verify / back actions with a success state.',
    category: 'auth',
    stack: ['DzCard', 'DzOtpInput', 'DzButton', 'DzCountdown', 'DzText', 'DzAlert'],
    icon: 'ShieldCheck',
    load: () => import('./verify-otp/VerifyOtp.vue'),
    source: 'apps/landing/src/templates/verify-otp/VerifyOtp.vue',
    tier: 'free',
    tags: ['auth', 'form', 'centered', 'responsive'],
    createdAt: '2026-06-25',
  },
  {
    slug: 'onboarding-wizard',
    name: 'Onboarding Wizard',
    blurb:
      'A multi-step setup — Profile, Workspace and Invite panels on a stepper with a progress bar and prev/next, ending in a success state.',
    category: 'auth',
    stack: [
      'DzStepper',
      'DzFormField',
      'DzInput',
      'DzSelect',
      'DzRadioGroup',
      'DzCheckboxGroup',
      'DzProgress',
      'DzButton',
      'DzCard',
    ],
    icon: 'ListChecks',
    load: () => import('./onboarding-wizard/OnboardingWizard.vue'),
    source: 'apps/landing/src/templates/onboarding-wizard/OnboardingWizard.vue',
    tier: 'free',
    tags: ['auth', 'stepper', 'form', 'form-heavy', 'responsive'],
    createdAt: '2026-06-25',
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
    tags: ['marketing', 'pricing', 'carousel', 'accordion', 'responsive'],
    createdAt: '2026-04-30',
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
    tags: ['content', 'typography', 'responsive'],
    createdAt: '2026-05-01',
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
    tags: ['content', 'grid', 'search', 'pagination', 'responsive'],
    createdAt: '2026-05-05',
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
    tags: ['content', 'search', 'accordion', 'responsive'],
    createdAt: '2026-05-06',
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
    tags: ['content', 'timeline', 'responsive'],
    createdAt: '2026-05-07',
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
    tags: ['content', 'sidebar', 'search', 'responsive'],
    createdAt: '2026-05-08',
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
    tags: ['content', 'grid', 'responsive'],
    createdAt: '2026-05-09',
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
    tags: ['dashboard', 'app-shell', 'sidebar', 'data-table', 'tabs', 'responsive'],
    createdAt: '2026-05-10',
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
    tags: ['dashboard', 'app-shell', 'kanban', 'tabs', 'responsive'],
    createdAt: '2026-05-11',
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
    tags: ['dashboard', 'app-shell', 'settings', 'form', 'tabs', 'form-heavy'],
    createdAt: '2026-05-12',
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
    tags: ['dashboard', 'profile', 'tabs', 'timeline', 'responsive'],
    createdAt: '2026-05-13',
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
    tags: ['dashboard', 'billing', 'pricing', 'data-table', 'responsive'],
    createdAt: '2026-05-14',
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
    tags: ['dashboard', 'data-table', 'responsive'],
    createdAt: '2026-05-15',
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
    tags: ['dashboard', 'app-shell', 'tabs', 'empty-state', 'responsive'],
    createdAt: '2026-05-16',
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
    tags: ['utility', 'empty-state', 'responsive'],
    createdAt: '2026-05-02',
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
    tags: ['utility', 'error-page', 'centered', 'responsive'],
    createdAt: '2026-05-17',
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
    tags: ['utility', 'timeline', 'responsive'],
    createdAt: '2026-05-18',
  },
  {
    slug: 'maintenance',
    name: 'Scheduled Maintenance',
    blurb:
      'A centered "we\'ll be right back" page — an amber status badge, a live progress bar with an ETA, and a notify-me card pairing an email input with a call to action.',
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
    tags: ['utility', 'centered', 'form', 'responsive'],
    createdAt: '2026-05-19',
  },
  {
    slug: 'error-500',
    name: '500 — Server Error',
    blurb:
      'A centered server-error page — an oversized "500" glyph, a DzResult headline with retry / status / contact actions, a card of next steps and an incident reference.',
    category: 'utility',
    stack: ['DzResult', 'DzCard', 'DzButton', 'DzDivider', 'DzText'],
    icon: 'ServerCrash',
    load: () => import('./error-500/Error500.vue'),
    source: 'apps/landing/src/templates/error-500/Error500.vue',
    tier: 'free',
    tags: ['utility', 'error-page', 'centered', 'responsive'],
    createdAt: '2026-06-25',
  },
  {
    slug: 'error-403',
    name: '403 — Access Denied',
    blurb:
      'A centered access-denied page — an oversized "403" glyph, a DzResult with a DzAlert spelling out the missing permission, and request-access / switch-account actions with a client-side "request sent" state.',
    category: 'utility',
    stack: ['DzResult', 'DzCard', 'DzButton', 'DzText', 'DzAlert'],
    icon: 'ShieldAlert',
    load: () => import('./error-403/Error403.vue'),
    source: 'apps/landing/src/templates/error-403/Error403.vue',
    tier: 'free',
    tags: ['utility', 'error-page', 'centered', 'responsive'],
    createdAt: '2026-06-25',
  },
  {
    slug: 'coming-soon',
    name: 'Coming Soon',
    blurb:
      'A launch page — a status badge, a live countdown to launch in day/hour/minute/second segments, and a notify-me email capture that flips to a success state, with brand and social links.',
    category: 'utility',
    stack: [
      'DzCard',
      'DzCountdown',
      'DzInput',
      'DzButton',
      'DzBadge',
      'DzHeading',
      'DzText',
      'DzDivider',
    ],
    icon: 'Hourglass',
    load: () => import('./coming-soon/ComingSoon.vue'),
    source: 'apps/landing/src/templates/coming-soon/ComingSoon.vue',
    tier: 'free',
    tags: ['utility', 'centered', 'form', 'responsive'],
    createdAt: '2026-06-25',
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
    tags: ['commerce', 'product', 'tabs', 'accordion', 're-skin', 'responsive'],
    createdAt: '2026-05-03',
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
    tags: ['commerce', 'grid', 'filters', 'pagination', 'responsive'],
    createdAt: '2026-05-20',
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
    tags: ['commerce', 'checkout', 'stepper', 'form', 'form-heavy', 're-skin'],
    createdAt: '2026-05-21',
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
    tags: ['commerce', 'timeline', 'stepper', 're-skin', 'responsive'],
    createdAt: '2026-05-22',
  },
  {
    slug: 'pricing',
    name: 'Pricing Page',
    blurb:
      'A conversion-ready pricing page — a live monthly/annual toggle that re-prices three plan cards, a grouped feature-comparison matrix with tooltip explainers and an FAQ teaser. Re-skinned violet via tokens.',
    category: 'marketing',
    stack: [
      'DzCard',
      'DzBadge',
      'DzSegmented',
      'DzButton',
      'DzTable',
      'DzTooltip',
      'DzDivider',
    ],
    icon: 'BadgeDollarSign',
    load: () => import('./pricing/Pricing.vue'),
    source: 'apps/landing/src/templates/pricing/Pricing.vue',
    tier: 'free',
    featured: true,
    // The page re-skins violet via tokens — preview the same colourway.
    accent: 'violet',
    tags: ['marketing', 'pricing', 'data-table', 're-skin', 'responsive'],
    createdAt: '2026-06-25',
  },
  {
    slug: 'feature-product',
    name: 'Feature / Product',
    blurb:
      'A product deep-dive — a hero with a token-painted mock, alternating feature rows, a tabbed feature explorer, a before/after reveal slider and a closing CTA.',
    category: 'marketing',
    stack: [
      'DzCard',
      'DzTabs',
      'DzImage',
      'DzImageComparison',
      'DzBadge',
      'DzHeading',
      'DzText',
    ],
    icon: 'LayoutTemplate',
    load: () => import('./feature-product/FeatureProduct.vue'),
    source: 'apps/landing/src/templates/feature-product/FeatureProduct.vue',
    tier: 'free',
    tags: ['marketing', 'product', 'tabs', 'responsive'],
    createdAt: '2026-06-25',
  },
  {
    slug: 'contact',
    name: 'Contact',
    blurb:
      'A two-column contact page — a client-side-validated enquiry form that flips to a success state, beside direct channels, a token-painted map and office hours.',
    category: 'marketing',
    stack: [
      'DzCard',
      'DzFormField',
      'DzInput',
      'DzTextarea',
      'DzSelect',
      'DzButton',
      'DzAlert',
      'DzDivider',
    ],
    icon: 'Contact',
    load: () => import('./contact/Contact.vue'),
    source: 'apps/landing/src/templates/contact/Contact.vue',
    tier: 'free',
    tags: ['marketing', 'form', 'form-heavy', 'responsive'],
    createdAt: '2026-06-25',
  },
  {
    slug: 'about-faq',
    name: 'About & FAQ',
    blurb:
      'A company page — a mission hero with headline stats, a founding-to-today story timeline, values cards, a leadership grid and an FAQ accordion.',
    category: 'marketing',
    stack: [
      'DzHeading',
      'DzText',
      'DzAccordion',
      'DzCard',
      'DzAvatar',
      'DzAvatarGroup',
      'DzTimeline',
      'DzDivider',
    ],
    icon: 'Users',
    load: () => import('./about-faq/AboutFaq.vue'),
    source: 'apps/landing/src/templates/about-faq/AboutFaq.vue',
    tier: 'free',
    tags: ['marketing', 'timeline', 'accordion', 'grid', 'responsive'],
    createdAt: '2026-06-25',
  },
  {
    slug: 'chat-messages',
    name: 'Chat / Messages',
    blurb:
      'A messaging app — a conversation list with search, presence dots and unread badges beside a thread of day-separated message bubbles with read receipts, and an attach-and-send composer. Re-skinned cyan via tokens.',
    category: 'dashboards',
    stack: [
      'DzAppShell',
      'DzList',
      'DzAvatar',
      'DzBadge',
      'DzScrollArea',
      'DzTextarea',
      'DzInput',
      'DzButton',
      'DzSearchInput',
      'DzDropdownMenu',
    ],
    icon: 'MessagesSquare',
    load: () => import('./chat-messages/ChatMessages.vue'),
    source: 'apps/landing/src/templates/chat-messages/ChatMessages.vue',
    tier: 'free',
    featured: true,
    // The page re-skins cyan via tokens — preview the same colourway.
    accent: 'cyan',
    tags: ['dashboard', 'app-shell', 'sidebar', 'search', 're-skin', 'responsive'],
    createdAt: '2026-06-25',
  },
  {
    slug: 'calendar-scheduler',
    name: 'Calendar / Scheduler',
    blurb:
      'A calendar app — a month/week DzCalendar with token-coloured event dots, a colour-coded calendar legend, a day agenda where each event opens a details popover, and a quick-add new-event dialog. Re-skinned indigo via tokens.',
    category: 'dashboards',
    stack: [
      'DzAppShell',
      'DzCalendar',
      'DzSegmented',
      'DzBadge',
      'DzPopover',
      'DzButton',
      'DzAvatarGroup',
      'DzDialog',
    ],
    icon: 'CalendarRange',
    load: () => import('./calendar-scheduler/CalendarScheduler.vue'),
    source: 'apps/landing/src/templates/calendar-scheduler/CalendarScheduler.vue',
    tier: 'free',
    // The page re-skins indigo via tokens — preview the same colourway.
    accent: 'indigo',
    tags: ['dashboard', 'app-shell', 'sidebar', 'grid', 're-skin', 'responsive'],
    createdAt: '2026-06-25',
  },
  {
    slug: 'file-manager',
    name: 'File Manager',
    blurb:
      'A cloud-drive workspace — a folder tree sidebar with a storage meter, a breadcrumb path, and a list/grid file browser with type icons, size and modified badges, right-click and per-row action menus, and search.',
    category: 'dashboards',
    stack: [
      'DzAppShell',
      'DzSidebar',
      'DzTree',
      'DzDataView',
      'DzBreadcrumb',
      'DzDropdownMenu',
      'DzContextMenu',
      'DzButton',
      'DzSearchInput',
      'DzBadge',
    ],
    icon: 'FolderTree',
    load: () => import('./file-manager/FileManager.vue'),
    source: 'apps/landing/src/templates/file-manager/FileManager.vue',
    tier: 'free',
    tags: ['dashboard', 'app-shell', 'sidebar', 'grid', 'search', 'responsive'],
    createdAt: '2026-06-25',
  },
  {
    slug: 'tasks-todo',
    name: 'Tasks / To-Do',
    blurb:
      'A personal to-do app — a left rail of lists, a My Day task list with completion checkboxes, priority badges and label tags, a quick-add field, a Today / Upcoming / Done view switcher and a per-task menu.',
    category: 'dashboards',
    stack: [
      'DzAppShell',
      'DzList',
      'DzCheckbox',
      'DzTag',
      'DzBadge',
      'DzInput',
      'DzDropdownMenu',
      'DzSegmented',
      'DzButton',
    ],
    icon: 'ListTodo',
    load: () => import('./tasks-todo/TasksTodo.vue'),
    source: 'apps/landing/src/templates/tasks-todo/TasksTodo.vue',
    tier: 'free',
    tags: ['dashboard', 'app-shell', 'sidebar', 'form', 'responsive'],
    createdAt: '2026-06-25',
  },
  {
    slug: 'data-table',
    name: 'Data Table (CRUD list)',
    blurb:
      'A working customer ledger — a filter bar with a search field and plan/status facets, a sortable, paginated, multi-select data grid with status badges and row actions, a bulk-action bar and a "New customer" dialog that appends a real row.',
    category: 'dashboards',
    stack: [
      'DzAppShell',
      'DzDataGrid',
      'DzSearchInput',
      'DzMultiSelect',
      'DzDropdownMenu',
      'DzPagination',
      'DzDialog',
      'DzButton',
      'DzBadge',
      'DzCheckbox',
    ],
    icon: 'Table2',
    load: () => import('./data-table/DataTable.vue'),
    source: 'apps/landing/src/templates/data-table/DataTable.vue',
    tier: 'free',
    featured: true,
    tags: ['dashboard', 'app-shell', 'data-table', 'filters', 'pagination', 'responsive'],
    createdAt: '2026-06-25',
  },
  {
    slug: 'invoice',
    name: 'Invoice',
    blurb:
      'A printable studio invoice — a branded header with a status badge, from / bill-to / details description grids, a line-item table and a derived totals block where every figure is computed from the lines, plus payment notes and download / print / send actions.',
    category: 'commerce',
    stack: [
      'DzCard',
      'DzTable',
      'DzDescriptions',
      'DzDivider',
      'DzBadge',
      'DzButton',
      'DzHeading',
      'DzText',
    ],
    icon: 'ReceiptText',
    load: () => import('./invoice/Invoice.vue'),
    source: 'apps/landing/src/templates/invoice/Invoice.vue',
    tier: 'free',
    tags: ['commerce', 'billing', 'data-table', 'responsive'],
    createdAt: '2026-06-25',
  },
  {
    slug: 'shopping-cart',
    name: 'Shopping Cart',
    blurb:
      'A grocery cart page — editable line items with image thumbnails, a quantity stepper and remove, a working promo code, a free-shipping progress nudge and a sticky summary with live totals, plus an empty-cart state and a one-click "add" cross-sell rail. Re-skinned emerald via tokens.',
    category: 'commerce',
    stack: [
      'DzCard',
      'DzList',
      'DzNumberInput',
      'DzButton',
      'DzBadge',
      'DzAlert',
      'DzInput',
      'DzDivider',
      'DzImage',
    ],
    icon: 'ShoppingBag',
    load: () => import('./shopping-cart/ShoppingCart.vue'),
    source: 'apps/landing/src/templates/shopping-cart/ShoppingCart.vue',
    tier: 'free',
    // The page re-skins emerald via tokens — preview the same colourway.
    accent: 'emerald',
    tags: ['commerce', 'checkout', 'empty-state', 're-skin', 'responsive'],
    createdAt: '2026-06-25',
  },
  {
    slug: 'account-settings',
    name: 'Account Centre',
    blurb:
      'A multi-tab account hub in an app shell — Profile with avatar upload, Security with a password change, 2FA and revocable sessions, a notification channel matrix, and Billing with the current plan, payment method and invoices. A sticky save bar confirms client-side.',
    category: 'dashboards',
    stack: [
      'DzAppShell',
      'DzTabs',
      'DzFormField',
      'DzInput',
      'DzSwitch',
      'DzSelect',
      'DzAvatar',
      'DzButton',
      'DzDivider',
      'DzAlert',
      'DzBadge',
      'DzDescriptions',
    ],
    icon: 'UserCog',
    load: () => import('./account-settings/AccountSettings.vue'),
    source: 'apps/landing/src/templates/account-settings/AccountSettings.vue',
    tier: 'free',
    tags: ['dashboard', 'app-shell', 'settings', 'profile', 'billing', 'tabs'],
    createdAt: '2026-06-25',
  },
  {
    slug: 'order-history',
    name: 'Order History',
    blurb:
      'An account orders page — a searchable, status-filtered, sortable and paginated DzDataView of past orders, each with its products, total, a status badge and view / reorder actions (Reorder confirms live). Re-skinned emerald via tokens.',
    category: 'commerce',
    stack: [
      'DzCard',
      'DzDataView',
      'DzList',
      'DzBadge',
      'DzTag',
      'DzPagination',
      'DzSearchInput',
      'DzButton',
    ],
    icon: 'PackageSearch',
    load: () => import('./order-history/OrderHistory.vue'),
    source: 'apps/landing/src/templates/order-history/OrderHistory.vue',
    tier: 'free',
    // The page re-skins emerald via tokens — preview the same colourway.
    accent: 'emerald',
    tags: ['commerce', 'search', 'pagination', 'filters', 're-skin', 'responsive'],
    createdAt: '2026-06-25',
  },
]

/**
 * Public-URL directory for the committed gallery thumbnails — the single source
 * of truth shared with the screenshot pipeline (`scripts/shoot-thumbnails.mts`,
 * which writes the files into `public/` + this path). Root-relative so it is a
 * stable, un-hashed URL: the gallery derives the dark variant by inserting
 * `-dark` before the extension (`<slug>.webp` → `<slug>-dark.webp`), and the
 * detail route reuses it verbatim as the per-template `og:image`.
 */
export const THUMBNAIL_DIR = '/templates/thumbnails'

// Wire each row's static thumbnail by slug CONVENTION rather than a
// hand-maintained path, so a new template is covered the moment `yarn
// thumbnails` generates its screenshots. Until those files exist the gallery's
// <img onerror> handler falls back to the row's icon, so the derived path is
// safe to set unconditionally (a missing file is a graceful gap, not a break).
for (const template of TEMPLATES) {
  template.thumbnail = `${THUMBNAIL_DIR}/${template.slug}.webp`
}

/** Resolve a template by its slug, or `undefined` if unknown. */
export function getTemplate(slug: string): TemplateMeta | undefined {
  return TEMPLATES.find(t => t.slug === slug)
}

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
}

/**
 * Category keys paired with their display labels. Order = filter display order.
 */
export const TEMPLATE_CATEGORIES: { key: TemplateCategory; label: string }[] = [
  { key: 'dashboards', label: 'Dashboards & Apps' },
  { key: 'auth', label: 'Auth & Account' },
  { key: 'marketing', label: 'Marketing' },
  { key: 'commerce', label: 'Commerce' },
  { key: 'content', label: 'Content' },
  { key: 'utility', label: 'Utility' },
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
]

/** Resolve a template by its slug, or `undefined` if unknown. */
export function getTemplate(slug: string): TemplateMeta | undefined {
  return TEMPLATES.find((t) => t.slug === slug)
}

/**
 * GENERATED FILE — do not edit by hand. Written by `scripts/build-og-images.ts`
 * (runs from the landing `build` script ahead of the bundler).
 *
 * Lists exactly which images exist on disk, so the app never advertises one that
 * would 404 — `src/router.ts` for share cards, `TemplatesPage` for dark-mode
 * gallery thumbnails.
 */

/** Block ids with a committed 1200×630 OG card at `/og/<id>.png` (`yarn og`). */
export const BLOCK_OG_IDS: ReadonlySet<string> = new Set([])

/** Template slugs with a derived 1200×630 PNG at `/og-templates/<slug>.png`. */
export const TEMPLATE_OG_SLUGS: ReadonlySet<string> = new Set([
  'about-faq',
  'account-settings',
  'admin-crm',
  'analytics-dashboard',
  'app-settings',
  'billing-plans',
  'blog-index',
  'blog-post',
  'calendar-scheduler',
  'changelog',
  'chat-messages',
  'checkout',
  'coming-soon',
  'contact',
  'data-table',
  'docs-guide',
  'error-403',
  'error-500',
  'feature-product',
  'file-manager',
  'help-center',
  'inbox-notifications',
  'invoice',
  'maintenance',
  'newsroom',
  'not-found',
  'onboarding-wizard',
  'order-history',
  'order-tracking',
  'pricing',
  'product-detail',
  'product-listing',
  'project-board',
  'reset-password',
  'saas-landing',
  'shopping-cart',
  'sign-in',
  'sign-up',
  'states-pack',
  'system-status',
  'tasks-todo',
  'team-members',
  'user-profile',
  'verify-otp',
])

/**
 * Template slugs with a committed dark thumbnail at
 * `/templates/thumbnails/<slug>-dark.webp`. A slug missing here has no dark
 * screenshot, so the gallery keeps showing its LIGHT thumbnail in dark mode rather
 * than requesting a file that 404s and collapsing to an icon. Regenerate with
 * `yarn thumbnails`.
 */
export const TEMPLATE_DARK_THUMB_SLUGS: ReadonlySet<string> = new Set([
  'admin-crm',
  'analytics-dashboard',
  'app-settings',
  'billing-plans',
  'blog-index',
  'blog-post',
  'changelog',
  'checkout',
  'docs-guide',
  'help-center',
  'inbox-notifications',
  'maintenance',
  'newsroom',
  'not-found',
  'onboarding-wizard',
  'order-tracking',
  'product-detail',
  'product-listing',
  'project-board',
  'reset-password',
  'saas-landing',
  'sign-in',
  'sign-up',
  'states-pack',
  'system-status',
  'team-members',
  'user-profile',
  'verify-otp',
])

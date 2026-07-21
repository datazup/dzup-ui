/**
 * GENERATED FILE — do not edit by hand. Written by `scripts/build-og-images.ts`
 * (runs from the landing `build` script ahead of the bundler).
 *
 * Lists exactly which share-card images exist on disk, so `src/router.ts` never
 * advertises an `og:image` that would 404. (Dark gallery thumbnails are no longer
 * inventoried here: `scripts/check-template-previews.ts` fails the build unless
 * EVERY template has both a light and a dark thumbnail, so the gallery derives the
 * dark path unconditionally — FREE2-09.)
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

/**
 * Sample content for the Help Center template (docs/templates.md §6.5).
 * Co-located so the template is self-contained (§7). No painted artwork — the
 * page is icon- and token-driven, so this file carries content only and no raw
 * hex. Category icons are referenced by string key into the central ICONS
 * registry (icons.ts) to keep data import-free of components.
 */

/** A help category card in the topic grid. */
export interface HelpCategory {
  /** ICONS registry key for the card glyph. */
  icon: string
  title: string
  description: string
  /** Article count shown as a subtle badge. */
  articles: number
}

/** A frequently-asked question rendered in the accordion. */
export interface Faq {
  /** Unique accordion item value. */
  value: string
  q: string
  a: string
}

/** Quick search suggestions surfaced under the hero search. */
export const POPULAR_SEARCHES: string[] = [
  'Reset password',
  'Update billing',
  'Invite a teammate',
  'API keys',
  'Export data',
]

export const CATEGORIES: HelpCategory[] = [
  {
    icon: 'Rocket',
    title: 'Getting started',
    description: 'Set up your workspace, invite your team and ship your first project.',
    articles: 18,
  },
  {
    icon: 'CreditCard',
    title: 'Billing & plans',
    description: 'Manage subscriptions, seats, invoices and payment methods.',
    articles: 24,
  },
  {
    icon: 'UserRound',
    title: 'Account & profile',
    description: 'Security, sign-in options, notifications and personal settings.',
    articles: 15,
  },
  {
    icon: 'Boxes',
    title: 'Integrations',
    description: 'Connect the tools you already use and automate your workflow.',
    articles: 31,
  },
  {
    icon: 'Braces',
    title: 'Developer & API',
    description: 'Authentication, endpoints, webhooks and SDK references.',
    articles: 42,
  },
  {
    icon: 'Settings',
    title: 'Troubleshooting',
    description: 'Fix common errors, recover access and diagnose sync issues.',
    articles: 27,
  },
]

export const FAQS: Faq[] = [
  {
    value: 'reset',
    q: 'How do I reset my password?',
    a: 'Open the sign-in page and choose “Forgot password”. We’ll email a secure link that lets you set a new password — it expires after 60 minutes for your safety.',
  },
  {
    value: 'seats',
    q: 'Can I add or remove seats mid-cycle?',
    a: 'Yes. Seat changes take effect immediately and we prorate the difference against your next invoice, so you only ever pay for what you use.',
  },
  {
    value: 'export',
    q: 'How do I export my data?',
    a: 'Head to Settings → Data and request an export. We package everything as JSON and email a download link once it’s ready, usually within a few minutes.',
  },
  {
    value: 'sso',
    q: 'Do you support single sign-on?',
    a: 'SAML and OIDC single sign-on are available on the Business and Enterprise plans. You can enforce SSO for your whole organisation from the Security tab.',
  },
  {
    value: 'cancel',
    q: 'What happens when I cancel?',
    a: 'Your workspace stays active until the end of the current billing period. After that it switches to read-only for 30 days so you can re-activate or export before anything is removed.',
  },
]

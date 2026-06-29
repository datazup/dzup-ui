/**
 * Sample content for the Pricing Page template (docs/templates.md §6.2).
 * Co-located so the template is self-contained (§7) — plans, the live-toggled
 * price model, the feature comparison matrix and an FAQ teaser. Prices are plain
 * monthly numbers; the template derives the annual (effective per-month) figure
 * so the monthly/annual DzSegmented toggle can update the cards live. No raw
 * colour or asset lives here — the page is painted entirely from `--dz-*` tokens.
 */

/** One pricing tier rendered as a plan card. */
export interface Plan {
  /** Stable key + comparison-matrix column id. */
  id: 'starter' | 'pro' | 'business'
  /** Display name. */
  name: string
  /** One-line positioning under the name. */
  blurb: string
  /**
   * List price per seat / month, billed monthly. `null` = bespoke pricing
   * (Enterprise-style "let's talk"), which the card renders as "Custom".
   */
  monthly: number | null
  /** 3–4 headline inclusions shown on the card. */
  highlights: string[]
  /** Marks the recommended tier (solid "Most popular" badge + outline ring). */
  popular?: boolean
  /** Call-to-action label. */
  cta: string
}

export const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    blurb: 'For solo makers shipping their first project.',
    monthly: 0,
    highlights: ['3 projects', '1 GB storage', 'Community support'],
    cta: 'Start for free',
  },
  {
    id: 'pro',
    name: 'Pro',
    blurb: 'For growing teams that need room to scale.',
    monthly: 24,
    highlights: ['Unlimited projects', '50 GB storage', 'Audit logs', 'Priority support'],
    popular: true,
    cta: 'Start 14-day trial',
  },
  {
    id: 'business',
    name: 'Business',
    blurb: 'For organisations with security & compliance needs.',
    monthly: 64,
    highlights: ['Everything in Pro', 'SSO & SAML', 'Custom roles', '99.99% uptime SLA'],
    cta: 'Start 14-day trial',
  },
]

/** Annual billing applies a 20% discount, advertised on the toggle. */
export const ANNUAL_DISCOUNT = 0.2

/** The two billing cycles wired to the DzSegmented toggle. */
export const BILLING_CYCLES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual', label: 'Annual · −20%' },
] as const

export type BillingCycle = (typeof BILLING_CYCLES)[number]['value']

/**
 * A cell in the comparison matrix: either a literal value (string), or a
 * boolean that renders as a check / dash so "what's included" reads at a glance.
 */
export type MatrixCell = string | boolean

/** One feature row of the comparison matrix, with per-plan values. */
export interface MatrixRow {
  /** Feature label shown in the first column. */
  feature: string
  /**
   * Optional plain-language explainer surfaced via a DzTooltip help affordance —
   * present only on rows where the term isn't self-evident.
   */
  hint?: string
  /** Value for each plan, keyed by `Plan.id`. */
  values: Record<Plan['id'], MatrixCell>
}

/** Grouped comparison matrix — the heart of the "compare plans" section. */
export interface MatrixGroup {
  /** Section label, e.g. "Usage". */
  group: string
  rows: MatrixRow[]
}

export const COMPARISON: MatrixGroup[] = [
  {
    group: 'Usage',
    rows: [
      {
        feature: 'Projects',
        values: { starter: '3', pro: 'Unlimited', business: 'Unlimited' },
      },
      {
        feature: 'Team members',
        values: { starter: '1', pro: '10', business: 'Unlimited' },
      },
      {
        feature: 'Storage',
        hint: 'Total space for uploads, exports and backups across the workspace.',
        values: { starter: '1 GB', pro: '50 GB', business: '1 TB' },
      },
      {
        feature: 'Analytics retention',
        hint: 'How far back dashboards and event history stay queryable.',
        values: { starter: '7 days', pro: '1 year', business: 'Unlimited' },
      },
    ],
  },
  {
    group: 'Collaboration',
    rows: [
      {
        feature: 'API access',
        hint: 'A typed REST + webhook API for automating your workspace.',
        values: { starter: true, pro: true, business: true },
      },
      {
        feature: 'Audit logs',
        hint: 'An immutable, exportable record of every change made in the workspace.',
        values: { starter: false, pro: true, business: true },
      },
      {
        feature: 'Custom roles',
        values: { starter: false, pro: false, business: true },
      },
    ],
  },
  {
    group: 'Security & support',
    rows: [
      {
        feature: 'SSO & SAML',
        hint: 'Sign in with your identity provider (Okta, Entra ID, Google).',
        values: { starter: false, pro: false, business: true },
      },
      {
        feature: 'Priority support',
        hint: 'A 4-hour first-response target with a named success contact.',
        values: { starter: false, pro: true, business: true },
      },
      {
        feature: 'Uptime SLA',
        values: { starter: '—', pro: '99.9%', business: '99.99%' },
      },
    ],
  },
]

/** Short FAQ teaser closing the page. */
export interface PricingFaq {
  q: string
  a: string
}

export const PRICING_FAQS: PricingFaq[] = [
  {
    q: 'Can I change plans later?',
    a: 'Yes — upgrade, downgrade or switch between monthly and annual billing at any time. Changes are prorated to the day.',
  },
  {
    q: 'What happens when my trial ends?',
    a: 'Your workspace drops to the free Starter tier automatically — you keep your data and can add a card whenever you are ready.',
  },
  {
    q: 'Do you offer discounts?',
    a: 'Annual billing saves 20%, and we offer further discounts for non-profits, students and early-stage startups. Just reach out.',
  },
  {
    q: 'Which payment methods do you accept?',
    a: 'All major cards and, on Business, invoicing by ACH or wire with net-30 terms.',
  },
]

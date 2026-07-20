/**
 * Sign Up — co-located sample content (docs/templates.md §6.1).
 *
 * Marketing-panel copy and the password-strength scale used by the register
 * page. Kept beside the template so the component stays a thin view and the
 * realistic content lives in one obvious place (mirrors the shipped data files).
 */
import type { CanonicalTone } from '@dzup-ui/contracts'

/** A single proof-point shown in the marketing aside. */
export interface SignUpPerk {
  /** Short headline. */
  title: string
  /** One-line supporting detail. */
  detail: string
}

/** Reasons to sign up, surfaced beside the form on wide screens. */
export const PERKS: SignUpPerk[] = [
  { title: 'Free for 14 days', detail: 'Full access, no card required — cancel any time.' },
  { title: 'Onboard in minutes', detail: 'Import your data and invite the team in one flow.' },
  { title: 'Enterprise-grade security', detail: 'SOC 2 Type II, SSO and audit logs on every plan.' },
]

/** Social proof avatars (initials) shown under the marketing headline. */
export const SOCIAL_PROOF = ['AK', 'MР', 'JT', 'LS', 'DN'] as const

/**
 * One rung of the password-strength meter. `min` is the inclusive lower score
 * bound (0–4) the rung covers; the first matching rung from strongest down wins.
 */
export interface StrengthLevel {
  /** Minimum score (0–4) this level applies from. */
  min: number
  /** Human label shown beside the meter. */
  label: string
  /** Token tone driving the DzProgress colour. */
  tone: CanonicalTone
}

/**
 * Strength rungs from strongest to weakest. `scorePassword` returns a 0–4 score;
 * the meter picks the first rung whose `min` it meets, so order matters here.
 */
export const STRENGTH_LEVELS: StrengthLevel[] = [
  { min: 4, label: 'Strong', tone: 'success' },
  { min: 3, label: 'Good', tone: 'success' },
  { min: 2, label: 'Fair', tone: 'warning' },
  { min: 1, label: 'Weak', tone: 'danger' },
  { min: 0, label: 'Too short', tone: 'danger' },
]

/**
 * Score a password 0–4 from four independent signals (length, mixed case,
 * digits, symbols). Pure and deterministic — no zxcvbn dependency, just enough
 * to drive a believable demo meter.
 */
export function scorePassword(value: string): number {
  if (!value)
    return 0
  let score = 0
  if (value.length >= 8)
    score++
  if (/[a-z]/.test(value) && /[A-Z]/.test(value))
    score++
  if (/\d/.test(value))
    score++
  if (/[^A-Z0-9]/i.test(value))
    score++
  // A very short password can never read as strong, regardless of variety.
  if (value.length < 6)
    return Math.min(score, 1)
  return score
}

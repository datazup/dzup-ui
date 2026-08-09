/**
 * Block trust marks — the single source of truth for what the catalog *certifies*
 * about every block, and the contract the CI a11y suite enforces.
 *
 * docs/blocks.md §3.6 is explicit: a trust signal "only ships if … backs it" — a
 * mark is earned by an automated check, never a manual claim. So this module pairs
 * each rendered mark with the exact guarantee a check makes, and `a11y.spec.ts`
 * imports the SAME constants to prove every guarantee per block. Accessibility
 * and theme coverage come from `a11y.spec.ts`; responsive and RTL coverage come
 * from the real Chromium layout pass in `e2e/block-responsive.spec.ts`. Meta-tests
 * assert the marks, browser matrix, declared reflow probes, and CI command cannot
 * drift.
 */

import { CERTIFIED_DIRECTIONS, RESPONSIVE_VIEWPORTS } from './responsiveCertification.ts'

/**
 * Themes the a11y suite mounts every block under and runs axe against. The
 * "Light + dark" mark is earned only because the audit renders BOTH — keep this
 * list and the suite's per-theme loop in lockstep (the meta-test enforces it).
 */
export const AUDITED_THEMES = ['light', 'dark'] as const

export type AuditedTheme = (typeof AUDITED_THEMES)[number]

/** Stable identifier for a trust mark, shared by the UI and the suite's meta-test. */
export type CertificationId = 'accessible' | 'light-dark' | 'responsive' | 'rtl'

/** A single earned trust mark rendered on BlockCard / BlockPreview. */
export interface Certification {
  /** Stable id; the a11y suite's meta-test asserts each has a backing check. */
  id: CertificationId
  /** Visible, text label — the badge's accessible name (never color-only). */
  label: string
  /**
   * The precise guarantee the CI check makes. Surfaced as the badge's `title`
   * (hover) and bundled into its accessible description, so the claim travels
   * with the mark — visitors and AT users alike can read exactly what was tested.
   */
  certifies: string
}

/**
 * The marks the catalog renders — and ONLY these, because each is backed by an
 * assertion `a11y.spec.ts` runs against every block:
 *   • `accessible` ← axe finds zero serious/critical violations.
 *   • `light-dark` ← that audit runs under every `AUDITED_THEMES` value.
 *   • `responsive` ← Playwright renders every block at each certified viewport,
 *     asserts containment/no horizontal overflow, and verifies declared reflow.
 *   • `rtl` ← the same browser matrix proves `dir="rtl"` reaches block content
 *     without introducing overflow or clipping.
 */
export const CERTIFICATIONS: readonly Certification[] = [
  {
    id: 'accessible',
    label: 'Accessible',
    certifies:
      'Audited every CI run with axe-core: zero serious or critical WCAG 2.1 A/AA violations.',
  },
  {
    id: 'light-dark',
    label: 'Light + dark',
    certifies: `Rendered and axe-audited under both ${AUDITED_THEMES.join(' and ')} themes.`,
  },
  {
    id: 'responsive',
    label: 'Responsive',
    certifies:
      `Rendered in Chromium at ${RESPONSIVE_VIEWPORTS.map(viewport => `${viewport.label} ${viewport.width}px`).join(', ')}; `
      + `CI verifies meaningful content, viewport containment, no page or frame horizontal overflow, and every declared mobile reflow under ${CERTIFIED_DIRECTIONS.map(direction => direction.label).join(' and ')}.`,
  },
  {
    id: 'rtl',
    label: 'RTL',
    certifies:
      `Rendered in Chromium with dir="rtl" at ${RESPONSIVE_VIEWPORTS.map(viewport => `${viewport.label} ${viewport.width}px`).join(', ')}; `
      + 'CI verifies the requested direction reaches block content with meaningful rendering, viewport containment, and no page or frame horizontal overflow or clipping.',
  },
] as const

/**
 * Known accessibility debt — blocks whose ONLY serious/critical violations come
 * from inside an `@dzup-ui/core` component's own markup (NOT the block's
 * authoring), tracked here until the upstream fix lands.
 *
 * The honesty contract (docs/blocks.md §3.6) cuts both ways: just as a mark must
 * be earned, a block the audit can't clear must NOT wear one. So these blocks
 * render NO trust marks, and `a11y.spec.ts` routes them to a bounded-debt check —
 * it still runs axe and fails on any NEW rule, but tolerates exactly the listed
 * `rules`, so the catalog stays green without papering over the gap. Delete an
 * entry once its core fix ships; the audit will then certify the block normally.
 */
export interface A11yDebt {
  /** axe rule ids tolerated for this block (every other serious/critical fails). */
  rules: string[]
  /** Where the defect actually lives — the core component to fix, with line refs. */
  ref: string
}

export const KNOWN_A11Y_DEBT: Readonly<Record<string, A11yDebt>> = {}

/**
 * Whether the catalog can honestly show trust marks for this block — true unless
 * it carries known core-component a11y debt. The marks UI and the suite share
 * this one predicate so a block is never marked-but-unaudited or audited-but-debt.
 */
export function isCertified(blockId: string): boolean {
  return !(blockId in KNOWN_A11Y_DEBT)
}

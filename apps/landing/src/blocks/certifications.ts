/**
 * Block trust marks — the single source of truth for what the catalog *certifies*
 * about every block, and the contract the CI a11y suite enforces.
 *
 * docs/blocks.md §3.6 is explicit: a trust signal "only ships if … backs it" — a
 * mark is earned by an automated check, never a manual claim. So this module pairs
 * each rendered mark with the exact guarantee a check makes, and `a11y.spec.ts`
 * imports the SAME constants to prove every guarantee per block. The meta-test in
 * that suite asserts the rendered marks and the enforced checks can't drift: you
 * cannot add a `Certification` here without a backing assertion, and the audit can
 * only claim the themes listed in `AUDITED_THEMES`.
 *
 * Deliberately *absent*: a "Responsive" mark. Reflow at the `900px`/`560px`
 * breakpoints (docs §3.7) needs a real layout engine to verify; jsdom has none, so
 * no Vitest check can honestly back it. Per §3.6 we withhold the mark rather than
 * decorate the card — earning it is a follow-up for a Playwright viewport pass.
 */

/**
 * Themes the a11y suite mounts every block under and runs axe against. The
 * "Light + dark" mark is earned only because the audit renders BOTH — keep this
 * list and the suite's per-theme loop in lockstep (the meta-test enforces it).
 */
export const AUDITED_THEMES = ['light', 'dark'] as const

export type AuditedTheme = (typeof AUDITED_THEMES)[number]

/** Stable identifier for a trust mark, shared by the UI and the suite's meta-test. */
export type CertificationId = 'accessible' | 'light-dark'

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

export const KNOWN_A11Y_DEBT: Readonly<Record<string, A11yDebt>> = {
  'booking-form': {
    rules: ['aria-allowed-attr', 'nested-interactive'],
    ref: 'DzTimePicker trigger nests <span role="button"> inside its <button> '
      + '(packages/core/src/components/forms/DzTimePicker.vue:451); DzDatePicker/DzFormField '
      + 'wire aria-describedby onto a non-supporting wrapper.',
  },
  'access-transfer': {
    rules: ['aria-required-parent', 'nested-interactive'],
    ref: 'DzTransfer renders <div role="option"> with no role="listbox" parent and an '
      + '<input type="checkbox"> inside each option '
      + '(packages/core/src/components/forms/DzTransfer.vue:187,193,281,287).',
  },
}

/**
 * Whether the catalog can honestly show trust marks for this block — true unless
 * it carries known core-component a11y debt. The marks UI and the suite share
 * this one predicate so a block is never marked-but-unaudited or audited-but-debt.
 */
export function isCertified(blockId: string): boolean {
  return !(blockId in KNOWN_A11Y_DEBT)
}

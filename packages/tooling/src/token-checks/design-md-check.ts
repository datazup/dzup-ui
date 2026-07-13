/**
 * DESIGN.md compliance gate (plan §3.5)
 *
 * Three checks, folded into `validate:tokens`:
 *
 *   1. Freshness — regenerate DESIGN.md from the live token maps and fail if the
 *      committed file differs. Because it is co-generated, this replaces a heavy
 *      diff-validator: any token change that wasn't followed by `tokens:generate`
 *      is caught here (the committed-dist discipline of ADR-12).
 *   2. Token-reference integrity — every concrete `--dz-*` referenced in the body
 *      must be a real token (and every `--dz-foo-*` prefix must match one).
 *   3. Contrast — every semantic color pair DESIGN.md advertises must meet the
 *      WCAG 2.2 AA threshold for its role: 4.5:1 for text (SC 1.4.3), 3:1 for
 *      the focus ring (SC 1.4.11), asserted in both light and dark.
 *
 * Usage: tsx packages/tooling/src/token-checks/design-md-check.ts
 * Exit code 1 on any issue.
 */

import { existsSync, readFileSync } from 'node:fs'
import process from 'node:process'

import {
  allTokenNames,
  buildDesignMd,
  DESIGN_MD_PATH,
  resolvedSemanticColor,
} from '../../../tokens/src/design-md.js'
import { contrastRatio } from './oklch-contrast.js'

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

export interface DesignMdIssue {
  readonly check: 'freshness' | 'ref-integrity' | 'contrast'
  readonly message: string
}

export interface DesignMdCheckResult {
  readonly ok: boolean
  readonly issues: DesignMdIssue[]
  readonly stats: { refsChecked: number, pairsChecked: number }
}

/**
 * WCAG 2.2 success criteria this gate asserts against. Each threshold carries
 * the criterion it maps to, so a failure message can explain *why* a number is
 * the number and no ratio in this file is arbitrary.
 */
const WCAG = {
  /** SC 1.4.3 — normal-size text and images of text. */
  bodyText: { min: 4.5, criterion: 'WCAG 2.2 AA, 1.4.3 body text' },
  /** SC 1.4.11 — focus indicators and other non-text UI state indicators. */
  nonText: { min: 3, criterion: 'WCAG 2.2 AA, 1.4.11 non-text contrast' },
} as const

/**
 * The intent families that share the uniform state set documented in
 * `design-narrative.md`. Looping these (rather than enumerating pairs by hand)
 * is what makes a future intent extend the gate automatically.
 *
 * `destructive` is deliberately absent — it is a two-token alias of `danger`,
 * not a full state set, and is asserted as a bespoke pair below.
 */
const INTENT_FAMILIES = [
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
] as const

/** Surfaces that `--dz-foreground` is documented to sit on. */
const FOREGROUND_SURFACES = [
  '--dz-background',
  '--dz-surface',
  '--dz-surface-sunken',
  '--dz-surface-raised',
  '--dz-surface-overlay',
  '--dz-card',
  '--dz-popover',
  '--dz-muted',
] as const

/** Surfaces that `--dz-link` and `--dz-muted-foreground` are documented on. */
const TEXT_SURFACES = [
  '--dz-background',
  '--dz-surface',
  '--dz-card',
  '--dz-popover',
] as const

export interface ContrastPair {
  readonly fg: string
  readonly bg: string
  readonly theme: 'light' | 'dark'
  readonly min: number
  /** The WCAG success criterion `min` is derived from. */
  readonly criterion: string
  readonly label: string
}

/**
 * Every foreground/background pair DESIGN.md advertises as meeting WCAG AA.
 *
 * Scope note (kept deliberately narrow so the claim stays true): this gate
 * covers TEXT pairs at 1.4.3 and the FOCUS RING at 1.4.11. Border, placeholder
 * and disabled tokens are *not* asserted — `--dz-border` resolves to ~1.6:1 on
 * the page and `--dz-input-border` to ~2.0:1, so gating them at 1.4.11 would
 * fail today. That gap is recorded in `design-narrative.md` rather than papered
 * over with a lowered threshold; fixing it is a token change (TASK-DS-10), not
 * a test change.
 */
export function buildContrastPairs(): ContrastPair[] {
  const pairs: ContrastPair[] = []

  const push = (
    fg: string,
    bg: string,
    theme: 'light' | 'dark',
    rule: typeof WCAG.bodyText | typeof WCAG.nonText,
    label: string,
  ): void => {
    pairs.push({ fg, bg, theme, min: rule.min, criterion: rule.criterion, label })
  }

  for (const theme of ['light', 'dark'] as const) {
    // ── Neutral text ──────────────────────────────────────────────────────
    for (const surface of FOREGROUND_SURFACES) {
      push('--dz-foreground', surface, theme, WCAG.bodyText, `body text on ${surface}`)
    }
    for (const surface of [...TEXT_SURFACES, '--dz-muted', '--dz-surface-sunken']) {
      push('--dz-muted-foreground', surface, theme, WCAG.bodyText, `muted text on ${surface}`)
    }

    // ── Links ─────────────────────────────────────────────────────────────
    for (const surface of TEXT_SURFACES) {
      push('--dz-link', surface, theme, WCAG.bodyText, `link on ${surface}`)
    }
    push('--dz-link-hover', '--dz-background', theme, WCAG.bodyText, 'hovered link on page')

    // ── Intent families (uniform — loop, don't enumerate) ─────────────────
    for (const intent of INTENT_FAMILIES) {
      // Subtle tinted background + its emphasis text.
      push(
        `--dz-${intent}-muted-foreground`,
        `--dz-${intent}-muted`,
        theme,
        WCAG.bodyText,
        `${intent} emphasis text on ${intent} subtle fill`,
      )

      // Solid fill + its guaranteed-legible text. Since TASK-DS-10 every intent
      // exposes the same two-state fill set, so this loops with no special case:
      // `warning` used to need a branch here because its legible fill is a
      // LIGHTER shade than its intent color (near-black text on `--dz-warning`
      // measures 3.51:1 in light — below AA). Both now answer to `-solid`.
      //
      // `-active` is deliberately absent: it is a pressed SURFACE color, not a
      // text-bearing fill. No component puts `{intent}-foreground` on it, and
      // `--dz-warning-active` could not carry it legibly. Asserting it would have
      // gated a pair nothing renders — the claim is scoped to what components do.
      for (const fill of [`--dz-${intent}-solid`, `--dz-${intent}-solid-hover`]) {
        push(
          `--dz-${intent}-foreground`,
          fill,
          theme,
          WCAG.bodyText,
          `${intent} text on ${fill.replace('--dz-', '')} fill`,
        )
      }
    }

    // ── Bespoke pairs (genuinely not part of a uniform family) ────────────
    push('--dz-destructive-foreground', '--dz-destructive', theme, WCAG.bodyText, 'destructive text on destructive fill')
    push('--dz-accent-foreground', '--dz-accent', theme, WCAG.bodyText, 'text on accent surface')
    push('--dz-highlight-foreground', '--dz-highlight', theme, WCAG.bodyText, 'text on selected row')

    // ── Non-text: the focus indicator must be discernible on both surfaces ─
    push('--dz-ring', '--dz-background', theme, WCAG.nonText, 'focus ring on page')
    push('--dz-ring', '--dz-surface', theme, WCAG.nonText, 'focus ring on surface')
  }

  return pairs
}

// --------------------------------------------------------------------------
// Individual checks (pure — unit-testable)
// --------------------------------------------------------------------------

/** Fail if the committed DESIGN.md differs from a fresh regeneration. */
export function checkFreshness(committed: string | null, expected: string): DesignMdIssue[] {
  if (committed === null) {
    return [{ check: 'freshness', message: 'DESIGN.md is missing — run `yarn tokens:generate`.' }]
  }
  if (committed !== expected) {
    return [{
      check: 'freshness',
      message: 'DESIGN.md is stale — it differs from a fresh generation. Run `yarn tokens:generate` and commit.',
    }]
  }
  return []
}

/**
 * Every `--dz-*` reference in the body must resolve to a real token. Concrete
 * names must exist; `--dz-foo-*` prefixes must match at least one token.
 * Returns the issues and the number of distinct references checked.
 */
export function checkTokenReferences(
  body: string,
  known: Set<string>,
): { issues: DesignMdIssue[], refsChecked: number } {
  const issues: DesignMdIssue[] = []
  const matches = body.match(/--dz-[a-z0-9-]+\*?/g) ?? []
  const seen = new Set<string>()

  for (const ref of matches) {
    if (seen.has(ref)) {
      continue
    }
    seen.add(ref)

    if (ref.endsWith('*')) {
      const prefix = ref.slice(0, -1)
      if (prefix === '--dz-') {
        continue // the whole-system `--dz-*` wildcard
      }
      const hasMatch = [...known].some(name => name.startsWith(prefix))
      if (!hasMatch) {
        issues.push({ check: 'ref-integrity', message: `No token matches prefix \`${ref}\`` })
      }
    }
    else if (!known.has(ref)) {
      issues.push({ check: 'ref-integrity', message: `Unknown token reference \`${ref}\`` })
    }
  }

  return { issues, refsChecked: seen.size }
}

/** Assert documented color pairs meet their minimum contrast ratio. */
export function checkContrast(pairs: ContrastPair[] = buildContrastPairs()): {
  issues: DesignMdIssue[]
  pairsChecked: number
} {
  const issues: DesignMdIssue[] = []
  let pairsChecked = 0

  for (const pair of pairs) {
    const fg = resolvedSemanticColor(pair.fg, pair.theme)
    const bg = resolvedSemanticColor(pair.bg, pair.theme)
    if (fg === undefined || bg === undefined) {
      continue // role not defined for this theme — nothing to assert
    }
    const ratio = contrastRatio(fg, bg)
    if (ratio === null) {
      issues.push({
        check: 'contrast',
        message: `Could not compute contrast for ${pair.fg} / ${pair.bg} (${pair.theme})`,
      })
      continue
    }
    pairsChecked++
    if (ratio < pair.min) {
      issues.push({
        check: 'contrast',
        message:
          `contrast(${pair.theme}): ${pair.fg} on ${pair.bg} = ${ratio.toFixed(2)}:1, `
          + `requires ${pair.min}:1 (${pair.criterion}) — ${pair.label}`,
      })
    }
  }

  return { issues, pairsChecked }
}

// --------------------------------------------------------------------------
// Orchestration
// --------------------------------------------------------------------------

/** Run all three DESIGN.md checks and aggregate the result. */
export function runDesignMdCheck(): DesignMdCheckResult {
  const expected = buildDesignMd()
  const committed = existsSync(DESIGN_MD_PATH) ? readFileSync(DESIGN_MD_PATH, 'utf-8') : null

  const freshness = checkFreshness(committed, expected)
  // Validate references against the freshly-built body so the check is
  // meaningful even when the committed file is stale/missing.
  const { issues: refIssues, refsChecked } = checkTokenReferences(expected, allTokenNames())
  const { issues: contrastIssues, pairsChecked } = checkContrast()

  const issues = [...freshness, ...refIssues, ...contrastIssues]
  return { ok: issues.length === 0, issues, stats: { refsChecked, pairsChecked } }
}

// --------------------------------------------------------------------------
// CLI
// --------------------------------------------------------------------------

function main(): void {
  const result = runDesignMdCheck()

  if (result.ok) {
    console.warn(
      `DESIGN.md check passed: fresh, ${result.stats.refsChecked} token refs valid, ${result.stats.pairsChecked} contrast pairs ≥ AA`,
    )
    process.exit(0)
  }

  console.error(`DESIGN.md check failed: ${result.issues.length} issue(s)\n`)
  for (const issue of result.issues) {
    console.error(`  [${issue.check}] ${issue.message}`)
  }
  console.error('')
  process.exit(1)
}

const isDirectRun = process.argv[1]?.includes('design-md-check')
if (isDirectRun) {
  main()
}

/**
 * Intent-text contrast gate
 *
 * `packages/tokens`'s `design-md-check.ts` asserts that every *token pair* the
 * system advertises clears WCAG AA. It cannot see which pairs the *components*
 * actually render — and for a while they rendered a pair that fails:
 *
 *     bg-[var(--dz-success-muted)] text-[var(--dz-success)]    → 3.74:1  ✗
 *     bg-[var(--dz-success-muted)] text-[var(--dz-success-muted-foreground)]
 *                                                              → 7.44:1  ✓
 *
 * `--dz-{intent}` is shade 500 — a **fill and border** color. Used as text it
 * fails AA on the page background (3.69–4.38:1 in light) and on its own subtle
 * fill (3.72–4.26:1). `--dz-{intent}-muted-foreground` is the readable shade
 * (shade 700 light / 300 dark) and clears AA on every documented surface
 * (7.31–10.25:1 light, 8.03–10.19:1 dark).
 *
 * The rule this gate enforces:
 *
 *     `--dz-{intent}` may back a fill (`bg-`) or a boundary (`border-`).
 *     It may never be a text color (`text-`) on a `{intent}-muted` fill.
 *
 * Scope note (deliberately narrow, so the gate stays true): only the
 * same-intent, same-class-string pair is asserted. `text-[var(--dz-primary)]`
 * on an *unknown* surface is not flagged here — some components use it to drive
 * `currentColor` for a graphic (`DzSpinner`, `DzRating`), which is SC 1.4.11 at
 * 3:1, not SC 1.4.3 at 4.5:1. Widening this gate to all intent text is tracked
 * with TASK-DS-10.
 *
 * Usage: tsx packages/tooling/src/token-checks/intent-text-contrast.ts
 * Exit code 1 on any violation.
 */

import { readdirSync, readFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

/** Repo root, from `packages/tooling/src/token-checks/`. */
const REPO_ROOT = resolve(__dirname, '..', '..', '..', '..')

/** Where component styling lives. */
const COMPONENTS_DIR = resolve(REPO_ROOT, 'packages', 'core', 'src', 'components')

/** Intents that expose the uniform `{intent}-muted` / `-muted-foreground` pair. */
const INTENTS = ['primary', 'secondary', 'success', 'warning', 'danger', 'info'] as const

export interface IntentTextViolation {
  readonly file: string
  readonly line: number
  readonly intent: string
  readonly snippet: string
}

/**
 * Match `bg-[var(--dz-X-muted)] … text-[var(--dz-X)]` in either order, within a
 * single class string (no quote may intervene, so two unrelated classes on
 * neighbouring lines cannot produce a false positive).
 *
 * `(?:[a-z-]+:)?` allows a Tailwind state prefix on the text utility
 * (`hover:`, `data-[state=checked]:` is handled by the bracket alternation).
 */
function violationPatterns(intent: string): RegExp[] {
  const bg = `bg-\\[var\\(--dz-${intent}-muted\\)\\]`
  const text = `text-\\[var\\(--dz-${intent}\\)\\]`
  const prefix = `(?:[a-z0-9-]+(?:\\[[^\\]]*\\])?:)*`
  const between = `[^'"\`]*`
  return [
    new RegExp(`${prefix}${bg}${between}${prefix}${text}`),
    new RegExp(`${prefix}${text}${between}${prefix}${bg}`),
  ]
}

/** Recursively collect styling-bearing files under a directory. */
function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { recursive: true, encoding: 'utf-8' })
    .filter(name => name.endsWith('.vue') || name.endsWith('.variants.ts'))
    .map(name => resolve(dir, name))
}

/** Scan the component tree for the failing pair. Pure over the filesystem. */
export function findIntentTextViolations(dir: string = COMPONENTS_DIR): IntentTextViolation[] {
  const violations: IntentTextViolation[] = []

  for (const file of sourceFiles(dir)) {
    const lines = readFileSync(file, 'utf-8').split('\n')
    lines.forEach((text, index) => {
      for (const intent of INTENTS) {
        if (violationPatterns(intent).some(re => re.test(text))) {
          violations.push({
            file: relative(REPO_ROOT, file).replaceAll('\\', '/'),
            line: index + 1,
            intent,
            snippet: text.trim(),
          })
        }
      }
    })
  }

  return violations
}

function main(): void {
  const violations = findIntentTextViolations()

  if (violations.length === 0) {
    console.warn('Intent-text contrast check passed: no `--dz-{intent}` text on a `{intent}-muted` fill')
    process.exit(0)
  }

  console.error(`Intent-text contrast check failed: ${violations.length} violation(s)\n`)
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}`)
    console.error(
      `    text-[var(--dz-${v.intent})] on bg-[var(--dz-${v.intent}-muted)] fails WCAG 2.2 AA `
      + '(SC 1.4.3, ~3.7–4.3:1 in light).',
    )
    console.error(`    Use text-[var(--dz-${v.intent}-muted-foreground)] instead (~7.4–8.1:1).`)
    console.error(`    ${v.snippet}\n`)
  }
  process.exit(1)
}

const isDirectRun = process.argv[1]?.includes('intent-text-contrast')
if (isDirectRun) {
  main()
}

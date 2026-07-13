/**
 * Story Status Validator (TASK-DS-08)
 *
 * The component maturity taxonomy (`experimental | beta | stable | deprecated`)
 * is declared as a `status:*` Storybook tag on each story `meta`, and it is the
 * library's honesty mechanism: it only informs anyone if EVERY component carries
 * exactly one tag. `ComponentStatus.mdx` renders `UNTAGGED_COUNT` from the same
 * source, but a dashboard that reports a gap does not prevent one — this
 * validator does.
 *
 * **Scope, stated precisely.** This checks that a tag is *present and well-formed*,
 * and that a `deprecated` component names its replacement. It cannot check that a
 * `stable` component *deserves* to be stable — the entry/exit criteria in
 * `packages/core/stories/_shared/status.ts` are reviewer-applied judgments. Keeping
 * that boundary explicit is the point: this repo's failure mode is documentation
 * that overstates enforcement.
 *
 * Only `Core/<Family>/<Component>` stories are checked. Gallery pages
 * (`Visual Refresh/*`) and guides (`Guides/*`) are not components and are skipped,
 * exactly as `apps/storybook/stories/_data/componentStatus.ts` skips them.
 *
 * Usage:
 *   tsx packages/tooling/src/validators/story-status.ts
 *
 * Exit code 1 if violations found.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

export interface StoryStatusViolation {
  file: string
  rule: string
  message: string
}

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../')
const STORIES_DIR = resolve(ROOT, 'packages/core/stories')

/** The four tiers, mirroring `ComponentStatus` in stories/_shared/status.ts. */
export const STATUSES = ['experimental', 'beta', 'stable', 'deprecated'] as const

/**
 * A status tag as authored: a quoted string literal inside `meta.tags`. Matching
 * the quotes (rather than a bare `status:`) keeps prose in a doc comment from
 * registering as a tag.
 */
const STATUS_TAG_RE = /['"]status:(experimental|beta|stable|deprecated)['"]/g

/** `title: 'Core/Buttons/DzButton'` → the title string. */
const TITLE_RE = /title:\s*['"]([^'"]+)['"]/

/** `migration: '…'` on a deprecated component's meta. */
const MIGRATION_RE = /migration:\s*['"][^'"]+['"]/

/**
 * True when a story title names a real component (`Core/<Family>/<Component>`).
 * Mirrors `parseRow()` in apps/storybook/stories/_data/componentStatus.ts.
 */
export function isComponentTitle(title: string): boolean {
  const segments = title.split('/')
  return segments[0] === 'Core' && segments.length >= 3
}

/**
 * Check one story file's source. `file` is used only for the violation message.
 * Pure — this is what the unit tests drive.
 */
export function checkStorySource(file: string, source: string): StoryStatusViolation[] {
  const title = source.match(TITLE_RE)?.[1]
  if (!title || !isComponentTitle(title))
    return []

  const violations: StoryStatusViolation[] = []
  const tags = [...source.matchAll(STATUS_TAG_RE)].map(m => m[1]!)

  if (tags.length === 0) {
    violations.push({
      file,
      rule: 'missing-status-tag',
      message: `"${title}" carries no status:* tag. Add exactly one of `
        + `${STATUSES.map(s => `status:${s}`).join(', ')} to its meta.tags. `
        + `See stories/_shared/status.ts for each tier's entry criteria.`,
    })
    return violations
  }

  if (tags.length > 1) {
    violations.push({
      file,
      rule: 'multiple-status-tags',
      message: `"${title}" carries ${tags.length} status tags `
        + `(${tags.map(t => `status:${t}`).join(', ')}). A component has exactly one maturity.`,
    })
  }

  if (tags.includes('deprecated') && !MIGRATION_RE.test(source)) {
    violations.push({
      file,
      rule: 'deprecated-without-migration',
      message: `"${title}" is status:deprecated but names no replacement. Add a `
        + `migration: '…' string to its meta.parameters so the upgrade guide on `
        + `ComponentStatus.mdx can point users somewhere.`,
    })
  }

  return violations
}

/** Recursively collect `*.stories.ts` under `dir`. */
export function collectStoryFiles(dir: string): string[] {
  const files: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      if (entry === 'node_modules')
        continue
      files.push(...collectStoryFiles(full))
    }
    else if (entry.endsWith('.stories.ts')) {
      files.push(full)
    }
  }
  return files
}

/** Run every rule over every core story file. */
export function checkStoryStatus(storiesDir: string = STORIES_DIR): StoryStatusViolation[] {
  return collectStoryFiles(storiesDir).flatMap((full) => {
    // Normalize to forward slashes so messages are identical on win32 and posix.
    const rel = relative(ROOT, full).replaceAll('\\', '/')
    return checkStorySource(rel, readFileSync(full, 'utf8'))
  })
}

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
const isMain = process.argv[1]
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const violations = checkStoryStatus()
  if (violations.length === 0) {
    console.warn('✓ story-status: every Core component story carries exactly one status:* tag')
    process.exit(0)
  }
  for (const v of violations)
    console.error(`✗ ${v.file} [${v.rule}]\n  ${v.message}`)
  console.error(`\n${violations.length} story-status violation(s).`)
  process.exit(1)
}
/* c8 ignore stop */

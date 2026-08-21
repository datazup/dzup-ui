/**
 * Fixture-backed documentation snippets (TASK-OSS-P1-04).
 *
 * Install documentation that nothing executes drifts, and drifted install
 * documentation is worse than none: it costs a reader an afternoon before they
 * conclude the library is broken. This repository has just paid that bill twice
 * retired-name-ok: names the package the docs used to advertise.
 * over — the docs advertised `includePro: true` against `@dzup-ui/pro`, a
 * package that has never existed, and the module loaded a stylesheet path the
 * tokens package does not export.
 *
 * So every install snippet is copied from a file a test actually builds, and
 * this validator fails when the two diverge.
 *
 * Mark a snippet with the fixture it came from, on the line before the fence:
 *
 *     <!-- fixture: packages/nuxt/test/fixtures/core-pro/nuxt.config.ts -->
 *     ```ts
 *     …
 *     ```
 *
 * MDX cannot carry HTML comments, so it uses the JSX comment form instead:
 *
 *     {\/* fixture: packages/nuxt/test/fixtures/core-pro/nuxt.config.ts *\/}
 *
 * Append `#name` to compare against a named region of the fixture, delimited by
 * `// #region name` and `// #endregion`, for files whose whole contents are not
 * meant to be pasted.
 *
 * Usage:
 *   tsx packages/tooling/scripts/validate-doc-snippets.ts
 *
 * Exit code 1 if any snippet has drifted from its fixture.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../')

/** Where documentation lives. Everything else is not install documentation. */
const DOC_ROOTS = [
  'README.md',
  'packages/core/README.md',
  'packages/nuxt/README.md',
  'packages/tokens/README.md',
  'apps/storybook/stories',
  'apps/landing/src',
]

const SKIP_DIRS = new Set(['node_modules', 'dist', '.nuxt', '.output', 'storybook-static'])

// Matches an HTML comment marker and the JSX comment form MDX requires.
// The path may carry a trailing `#region`.
const MARKER_RE = /(?:<!--|\{\/\*)\s*fixture:\s*([^\s*}]+)\s*(?:-->|\*\/\})/

export interface SnippetViolation {
  file: string
  line: number
  fixture: string
  reason: string
}

/** Extract `// #region name` … `// #endregion` from a fixture. */
export function extractRegion(source: string, region: string): string | undefined {
  const lines = source.split(/\r?\n/)
  const start = lines.findIndex(line => line.includes(`#region ${region}`))
  if (start === -1)
    return undefined
  const end = lines.findIndex((line, index) => index > start && line.includes('#endregion'))
  if (end === -1)
    return undefined
  return lines.slice(start + 1, end).join('\n')
}

/** Trailing whitespace and surrounding blank lines are not drift. */
function normalise(text: string): string {
  return text
    .split(/\r?\n/)
    .map(line => line.replace(/\s+$/, ''))
    .join('\n')
    .replace(/^\n+|\n+$/g, '')
}

/**
 * Check one document.
 *
 * Pure over its inputs except for reading the fixture, which is deliberate: the
 * comparison is against what is on disk, and mocking that would defeat the gate.
 */
export function checkDocument(file: string, source: string): SnippetViolation[] {
  const violations: SnippetViolation[] = []
  const lines = source.split(/\r?\n/)

  lines.forEach((line, index) => {
    const match = MARKER_RE.exec(line)
    if (match === null)
      return

    const [path, region] = (match[1] ?? '').split('#')
    const fixturePath = resolve(ROOT, path ?? '')
    const at = { file, line: index + 1, fixture: match[1] ?? '' }

    if (!existsSync(fixturePath)) {
      violations.push({ ...at, reason: 'the fixture this snippet claims to come from does not exist' })
      return
    }

    // The snippet is the next fenced block. Anything else between marker and
    // fence would make the association ambiguous, so only blank lines are
    // allowed.
    let cursor = index + 1
    while (cursor < lines.length && (lines[cursor] ?? '').trim() === '')
      cursor += 1

    const opening = lines[cursor] ?? ''
    if (!opening.trimStart().startsWith('```')) {
      violations.push({ ...at, reason: 'no fenced code block follows the marker' })
      return
    }

    const closing = lines.findIndex((candidate, i) => i > cursor && candidate.trimStart().startsWith('```'))
    if (closing === -1) {
      violations.push({ ...at, reason: 'the fenced code block after the marker is never closed' })
      return
    }

    const snippet = lines.slice(cursor + 1, closing).join('\n')
    const fixtureSource = readFileSync(fixturePath, 'utf8')
    const expected = region === undefined
      ? fixtureSource
      : extractRegion(fixtureSource, region)

    if (expected === undefined) {
      violations.push({ ...at, reason: `the fixture has no "#region ${region}"` })
      return
    }

    if (normalise(snippet) !== normalise(expected)) {
      violations.push({
        ...at,
        reason: 'the snippet no longer matches its fixture. The fixture is the one a test builds, '
          + 'so copy from it — do not edit the snippet to agree.',
      })
    }
  })

  return violations
}

function collectDocs(target: string): string[] {
  const full = resolve(ROOT, target)
  if (!existsSync(full))
    return []
  if (statSync(full).isFile())
    return /\.mdx?$/.test(full) ? [full] : []

  const out: string[] = []
  for (const entry of readdirSync(full)) {
    if (SKIP_DIRS.has(entry))
      continue
    out.push(...collectDocs(join(full, entry)))
  }
  return out
}

export function checkDocSnippets(): { violations: SnippetViolation[], checked: number } {
  let checked = 0
  const violations = DOC_ROOTS.flatMap(collectDocs).flatMap((full) => {
    const file = relative(ROOT, full).replaceAll('\\', '/')
    const source = readFileSync(full, 'utf8')
    const found = checkDocument(file, source)
    checked += [...source.matchAll(new RegExp(MARKER_RE, 'g'))].length
    return found
  })

  return { violations, checked }
}

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
const isMain = process.argv[1]
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const { violations, checked } = checkDocSnippets()

  if (violations.length === 0) {
    console.warn(`✓ doc-snippets: ${checked} fixture-backed snippet(s) match their fixtures`)
    process.exit(0)
  }

  for (const violation of violations) {
    console.error(`✗ ${violation.file}:${violation.line} → ${violation.fixture}`)
    console.error(`  ${violation.reason}`)
  }
  console.error(`\n${violations.length} drifted snippet(s) of ${checked} checked.`)
  process.exit(1)
}
/* c8 ignore stop */

/**
 * Retired package-name validator (TASK-OSS-P1-01).
 *
 * Fails when a name this repository has retired reappears outside the places
 * allowed to record history.
 *
 * The validator is part of the fix, not a nicety. The retired name it was
 * written for was not a typo in one file: the Nuxt module transpiled it, the
 * resolver emitted it, and the resolver *spec asserted it* — so the gate that
 * should have caught the defect certified it instead. A one-line correction
 * with no guard would drift back the same way, exactly as the handwritten Pro
 * component lists already did.
 *
 * Configuration is data (`retired-package-names.json`), so retiring the next
 * name is an edit to a JSON file rather than a change to this script.
 *
 * Three ways a mention is legitimate:
 *   1. the path is allowlisted — changelogs, changesets, ADRs, audit findings,
 *      build output, and the program docs that specify this repair;
 *   2. `retired-name-ok: <reason>` appears on the same line, or the line above
 *      (the two-line form is what makes this usable in Markdown and MDX prose);
 *   3. the occurrence is part of a longer package name — `@dzup-ui/pro-components`
 *      is a different package and is not matched.
 *
 * Usage:
 *   tsx packages/tooling/scripts/validate-package-names.ts
 *
 * Exit code 1 if violations found.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../')

export const CONFIG_PATH = resolve(ROOT, 'packages/tooling/scripts/retired-package-names.json')

/** Directories never worth scanning: generated, vendored, or reporting output. */
const SKIP_DIRS = new Set([
  '.git',
  '.yarn',
  'node_modules',
  'dist',
  'coverage',
  'storybook-static',
  'test-results',
  'playwright-report',
  '.nuxt',
  '.output',
])

const SCANNED_EXTENSIONS = [
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.vue',
  '.md',
  '.mdx',
  '.json',
  '.yml',
  '.yaml',
]

export interface RetiredName {
  name: string
  replacement: string
  retiredOn?: string
  reason?: string
}

export interface RetiredNamesConfig {
  retired: RetiredName[]
  allowlist: string[]
  escapeMarker: string
}

export interface PackageNameViolation {
  file: string
  line: number
  name: string
  replacement: string
  text: string
}

export function readConfig(path: string = CONFIG_PATH): RetiredNamesConfig {
  const parsed = JSON.parse(readFileSync(path, 'utf8')) as Partial<RetiredNamesConfig>
  return {
    retired: parsed.retired ?? [],
    allowlist: parsed.allowlist ?? [],
    escapeMarker: parsed.escapeMarker ?? 'retired-name-ok',
  }
}

/**
 * Minimal glob match for the shapes the allowlist actually uses: `**` spans
 * path segments, `*` does not, and everything else is literal. An allowlist
 * that matches too much is the worst failure available here, so the walk is
 * explicit and every non-word character is escaped rather than passed through.
 */
export function matchesGlob(path: string, pattern: string): boolean {
  let expression = ''
  let at = 0

  while (at < pattern.length) {
    const character = pattern[at]!

    if (character !== '*') {
      expression += /[\w/-]/.test(character) ? character : `\\${character}`
      at += 1
      continue
    }

    if (pattern[at + 1] === '*') {
      // `**/` spans whole segments and may match none of them; a trailing `**`
      // matches the rest of the path.
      const spansSegments = pattern[at + 2] === '/'
      expression += spansSegments ? '(?:.*/)?' : '.*'
      at += spansSegments ? 3 : 2
      continue
    }

    expression += '[^/]*'
    at += 1
  }

  return new RegExp(`^${expression}$`).test(path)
}

export function isAllowlisted(path: string, allowlist: readonly string[]): boolean {
  return allowlist.some(pattern => matchesGlob(path, pattern))
}

/**
 * True when the retired name at this position is really a *longer* package
 * name. `@dzup-ui/pro-components` contains `@dzup-ui/pro` but is not it.
 */
function isLongerName(text: string, index: number, name: string): boolean {
  const next = text[index + name.length]
  return next !== undefined && /[\w-]/.test(next)
}

/** Check one file's text. Pure — this is what the unit tests drive. */
export function checkSource(
  file: string,
  source: string,
  config: RetiredNamesConfig,
): PackageNameViolation[] {
  const violations: PackageNameViolation[] = []
  const lines = source.split(/\r?\n/)

  lines.forEach((text, index) => {
    const previous = lines[index - 1] ?? ''
    const excused = text.includes(config.escapeMarker) || previous.includes(config.escapeMarker)
    if (excused)
      return

    for (const retired of config.retired) {
      let at = text.indexOf(retired.name)
      while (at !== -1) {
        if (!isLongerName(text, at, retired.name)) {
          violations.push({
            file,
            line: index + 1,
            name: retired.name,
            replacement: retired.replacement,
            text: text.trim(),
          })
          break
        }
        at = text.indexOf(retired.name, at + retired.name.length)
      }
    }
  })

  return violations
}

/** Recursively collect scannable files under `dir`. */
export function collectFiles(dir: string): string[] {
  const files: string[] = []
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry))
      continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory())
      files.push(...collectFiles(full))
    else if (SCANNED_EXTENSIONS.some(extension => entry.endsWith(extension)))
      files.push(full)
  }
  return files
}

export function checkPackageNames(root: string = ROOT): PackageNameViolation[] {
  const config = readConfig()
  return collectFiles(root).flatMap((full) => {
    const path = relative(root, full).replaceAll('\\', '/')
    if (isAllowlisted(path, config.allowlist))
      return []
    return checkSource(path, readFileSync(full, 'utf8'), config)
  })
}

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
const isMain = process.argv[1]
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const config = readConfig()
  const violations = checkPackageNames()

  if (violations.length === 0) {
    console.warn(
      `✓ package-names: no retired package name outside history `
      + `(${config.retired.map(retired => retired.name).join(', ')})`,
    )
    process.exit(0)
  }

  for (const violation of violations) {
    console.error(`✗ ${violation.file}:${violation.line} names the retired package ${violation.name}`)
    console.error(`  ${violation.text}`)
    console.error(`  → use ${violation.replacement}, or add "${config.escapeMarker}: <reason>" `
      + 'on that line or the one above if naming the retired package is the point.')
  }
  console.error(`\n${violations.length} retired package-name occurrence(s).`)
  process.exit(1)
}
/* c8 ignore stop */

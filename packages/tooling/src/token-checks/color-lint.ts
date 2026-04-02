/**
 * Token Compliance Checker — Color Literal Lint (ADR-04)
 *
 * Scans .vue and .ts files outside `packages/tokens/` for raw color literals.
 * Flags: #hex, rgb(, rgba(, hsl(, hsla( patterns.
 *
 * Exemptions:
 *   - Files inside packages/tokens/ (token definitions are allowed)
 *   - Comments (single-line // and multi-line blocks)
 *   - String literals used in test assertions (*.spec.ts)
 *   - Common false positives: CSS variable references var(--...)
 *
 * Usage:
 *   tsx packages/tooling/src/token-checks/color-lint.ts
 *
 * Exit code 1 if violations found.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

// --- Types ---

interface ColorViolation {
  file: string
  line: number
  column: number
  match: string
  context: string
}

// --- Constants ---

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../')
const PACKAGES_DIR = resolve(ROOT, 'packages')
const TOKENS_DIR = resolve(PACKAGES_DIR, 'tokens')

/**
 * Patterns that indicate raw color literals.
 *
 * Each entry: [regex, description]
 *
 * The regexes are designed to match color values in CSS/JS contexts while
 * minimizing false positives from comments, variable names, and URLs.
 */
const COLOR_PATTERNS: Array<[RegExp, string]> = [
  // Hex colors: #rgb, #rgba, #rrggbb, #rrggbbaa (3, 4, 6, or 8 hex digits)
  // Exclude: CSS ids, anchors, sourcemap refs, numeric IDs, Vue slot shorthands (#default, #header, etc.)
  // Require at least one hex letter [a-fA-F] to avoid matching numeric IDs like #1234
  // Negative lookahead for word chars after the hex to avoid matching #default, #header, etc.
  [/(?<![&\w/])#(?=[0-9a-f]*[a-f])(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{4}|[0-9a-f]{3})(?![0-9a-z])/gi, 'hex color'],

  // rgb() and rgba()
  [/\brgba?\s*\(/g, 'rgb/rgba function'],

  // hsl() and hsla()
  [/\bhsla?\s*\(/g, 'hsl/hsla function'],
]

/**
 * Lines matching these patterns are excluded from checks.
 * These catch comments, imports, type annotations, etc.
 */
const EXCLUSION_PATTERNS: RegExp[] = [
  // Single-line comments
  /^\s*\/\//,
  // Multi-line comment markers
  /^\s*\*/,
  /^\s*\/\*/,
  // Import/require statements (might reference token packages)
  /^\s*import\s/,
  /^\s*export\s.*from/,
  // CSS variable usage (var(--dz-...)) — the whole line is likely token-based
  /var\(--dz-/,
  // Vitest/test assertions about color values
  /expect\s*\(/,
  /toContain|toBe|toEqual|toMatch/,
  // JSDoc / tsdoc containing color examples
  /^\s*\*.*@example/,
  // Escaped or template string containing var()
  /`[^`]*var\(/,
  // Inline or HTML disable comment: token-check-disable-line
  /token-check-disable-line/,
]

/**
 * File-level disable comment. When a file contains this string anywhere,
 * the entire file is exempt from color literal checks.
 * Use sparingly — only for components that inherently deal with raw colors
 * (e.g., color pickers).
 */
const FILE_DISABLE_MARKER = 'token-check-disable-file'

// --- File scanning ---

function collectFiles(dir: string, extensions: string[]): string[] {
  const results: string[] = []

  function walk(currentDir: string): void {
    // Skip tokens package entirely
    if (currentDir.startsWith(TOKENS_DIR)) {
      return
    }

    let entries: string[]
    try {
      entries = readdirSync(currentDir)
    }
    catch {
      return
    }

    for (const entry of entries) {
      const fullPath = join(currentDir, entry)

      if (entry === 'node_modules' || entry === 'dist' || entry === '.git') {
        continue
      }

      let stat
      try {
        stat = statSync(fullPath)
      }
      catch {
        continue
      }

      if (stat.isDirectory()) {
        walk(fullPath)
      }
      else if (stat.isFile() && extensions.some(ext => entry.endsWith(ext))) {
        results.push(fullPath)
      }
    }
  }

  walk(dir)
  return results
}

// --- Validation ---

function checkFile(filePath: string): ColorViolation[] {
  const violations: ColorViolation[] = []
  const content = readFileSync(filePath, 'utf-8')

  // File-level exemption
  if (content.includes(FILE_DISABLE_MARKER)) {
    return violations
  }

  const lines = content.split('\n')

  let inBlockComment = false
  let skipNextLine = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line === undefined)
      continue

    // Track multi-line comment state
    if (inBlockComment) {
      if (line.includes('*/')) {
        inBlockComment = false
      }
      continue
    }

    if (line.includes('/*') && !line.includes('*/')) {
      inBlockComment = true
      continue
    }

    // Support token-check-disable-next-line
    if (/token-check-disable-next-line/.test(line)) {
      skipNextLine = true
      continue
    }

    if (skipNextLine) {
      skipNextLine = false
      continue
    }

    // Skip lines matching exclusion patterns
    if (EXCLUSION_PATTERNS.some(p => p.test(line))) {
      continue
    }

    // Check each color pattern
    for (const [pattern, _description] of COLOR_PATTERNS) {
      // Reset regex
      pattern.lastIndex = 0
      let match: RegExpExecArray | null = pattern.exec(line)

      while (match !== null) {
        const matchStr = match[0]
        const column = match.index

        // Additional false positive checks for hex:
        // Skip if it looks like a CSS anchor (#id-name) or sourcemap
        if (matchStr.startsWith('#')) {
          // Skip if preceded by url( or in a string that looks like a URL/ID
          const before = line.slice(0, column)
          if (/url\(\s*$/.test(before) || /[a-z-]$/i.test(before)) {
            match = pattern.exec(line)
            continue
          }
        }

        // Get a trimmed context string for display
        const contextStart = Math.max(0, column - 20)
        const contextEnd = Math.min(line.length, column + matchStr.length + 20)
        const context = line.slice(contextStart, contextEnd).trim()

        violations.push({
          file: relative(ROOT, filePath),
          line: i + 1,
          column: column + 1,
          match: matchStr,
          context,
        })

        match = pattern.exec(line)
      }
    }
  }

  return violations
}

// --- Main ---

function main(): void {
  const files = collectFiles(PACKAGES_DIR, ['.ts', '.vue'])
  const allViolations: ColorViolation[] = []

  for (const file of files) {
    const violations = checkFile(file)
    allViolations.push(...violations)
  }

  if (allViolations.length === 0) {
    console.warn('Token compliance check passed: 0 raw color literals found')
    process.exit(0)
  }

  console.error(`Token compliance violations: ${allViolations.length} raw color literal(s) found\n`)

  for (const v of allViolations) {
    console.error(`  ${v.file}:${v.line}:${v.column}`)
    console.error(`    match: ${v.match}`)
    console.error(`    context: ...${v.context}...\n`)
  }

  console.error('Raw color literals are forbidden outside packages/tokens/ (ADR-04).')
  console.error('Use CSS custom properties: var(--dz-colors-*) instead.\n')

  process.exit(1)
}

main()

/**
 * Token Compliance Checker — Color Literal Lint (ADR-04)
 *
 * Scans .vue and .ts files outside `packages/tokens/` for raw color literals.
 *
 * Three groups of rule, because they need different exclusions:
 *
 * 1. **Raw CSS values** — `#hex`, `rgb()`, `hsl()`. Checked everywhere.
 * 2. **Tailwind color classes** — `text-gray-500`, `bg-blue-100`, `border-red-300`,
 *    `text-white`. Checked everywhere. These deliberately do *not* honour the
 *    `var(--dz-…)` line exclusion: a class list almost always contains a token
 *    reference alongside the raw literal, so excluding those lines would blind
 *    the rule to exactly the case it exists to catch.
 * 3. **Untokenized borders** — a bare `border` / `border-t` sets a width and
 *    inherits `currentColor`. Checked in `*.stories.ts` only: component
 *    `*.variants.ts` files legitimately carry a bare `border` in a base string
 *    and supply the colour from a separate `compoundVariants` entry.
 *
 * Stories are **not** exempt (TASK-DS-05). They are the surface where consumers
 * learn the system, and raw grays there were the dominant source of axe
 * `color-contrast` failures that kept families from enforcing a11y (TASK-DS-06).
 *
 * Exemptions:
 *   - Files inside packages/tokens/ (token definitions are allowed)
 *   - Comments (single-line // and multi-line blocks)
 *   - Test and fixture files (*.spec.ts, *.test.ts)
 *   - `token-check-disable-file` / `-line` / `-next-line` markers
 *   - For group 1 only: lines that reference var(--…)
 *
 * Usage:
 *   tsx packages/tooling/src/token-checks/color-lint.ts
 *
 * Exit code 1 if violations found.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath, pathToFileURL } from 'node:url'

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
const IGNORE_SUFFIXES = ['.spec.ts', '.test.ts']

/** Tailwind's default color ramps. Every one has a `--dz-colors-*` equivalent. */
const TAILWIND_PALETTES = [
  'gray',
  'slate',
  'zinc',
  'neutral',
  'stone',
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
].join('|')

/** Utility prefixes that take a color value. */
const TAILWIND_PREFIXES = [
  'text',
  'bg',
  'border',
  'ring',
  'from',
  'to',
  'via',
  'divide',
  'placeholder',
  'outline',
  'decoration',
  'accent',
  'caret',
  'fill',
  'stroke',
].join('|')

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
 * Raw Tailwind color utilities, with any variant prefix (`hover:`, `dark:`)
 * and any opacity modifier (`/90`). Checked without the var() line exclusion.
 */
const TAILWIND_COLOR_PATTERNS: Array<[RegExp, string]> = [
  [
    new RegExp(
      `(?<![\\w-])(?:[a-z][a-z0-9-]*:)*(?:${TAILWIND_PREFIXES})-(?:${TAILWIND_PALETTES})-\\d{2,3}(?:/\\d+)?(?![\\w-])`,
      'g',
    ),
    'raw Tailwind color class',
  ],
  [
    new RegExp(
      `(?<![\\w-])(?:[a-z][a-z0-9-]*:)*(?:${TAILWIND_PREFIXES})-(?:white|black)(?:/\\d+)?(?![\\w-])`,
      'g',
    ),
    'raw Tailwind white/black class',
  ],
]

/**
 * A bare `border` / `border-t` width utility, carrying no color.
 *
 * Only ever applied inside a `class` attribute — "border" is also an ordinary
 * English word, and story prose says things like "Card with a border outline."
 */
const BARE_BORDER_PATTERNS: Array<[RegExp, string]> = [
  [/(?<![\w-])(?:[a-z][a-z0-9-]*:)*border(?:-[tbrlxy])?(?![\w[-])/g, 'untokenized border'],
]

/** A `class="…"` / `:class="…"` attribute and the offset of its contents. */
const CLASS_ATTR_RE = /:?class\s*=\s*"([^"]*)"/g

/** A class list that already supplies a tokenized border color. */
const TOKENIZED_BORDER_RE = /border(?:-[tbrlxy])?-\[var\(/

/**
 * Lines matching these patterns are excluded from **every** check.
 * Comments, imports, and explicit disable markers.
 */
const HARD_EXCLUSION_PATTERNS: RegExp[] = [
  // Single-line comments
  /^\s*\/\//,
  // Multi-line comment markers
  /^\s*\*/,
  /^\s*\/\*/,
  // Import/require statements (might reference token packages)
  /^\s*import\s/,
  /^\s*export\s.*from/,
  // Inline or HTML disable comment: token-check-disable-line
  /token-check-disable-line/,
]

/**
 * Lines matching these are excluded from the **raw CSS value** checks only.
 *
 * A line that already references a token is usually token-based, and test
 * assertions legitimately name color values. Neither reasoning holds for a raw
 * Tailwind class: `class="text-gray-500 border-[var(--dz-border)]"` references
 * a token *and* violates ADR-04 on the same line.
 */
const SOFT_EXCLUSION_PATTERNS: RegExp[] = [
  // CSS variable usage (var(--dz-...)) — the whole line is likely token-based
  /var\(--dz-/,
  // Vitest/test assertions about color values
  /expect\s*\(/,
  /toContain|toBe|toEqual|toMatch/,
  // JSDoc / tsdoc containing color examples
  /^\s*\*.*@example/,
  // Escaped or template string containing var()
  /`[^`]*var\(/,
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
        if (IGNORE_SUFFIXES.some(suffix => entry.endsWith(suffix))) {
          continue
        }
        results.push(fullPath)
      }
    }
  }

  walk(dir)
  return results
}

// --- Validation ---

/** Collect matches for one pattern group on one line. */
function matchLine(
  line: string,
  patterns: Array<[RegExp, string]>,
  onMatch: (matchStr: string, column: number) => void,
): void {
  for (const [pattern] of patterns) {
    pattern.lastIndex = 0
    let match: RegExpExecArray | null = pattern.exec(line)

    while (match !== null) {
      const matchStr = match[0]
      const column = match.index

      // Additional false positive checks for hex:
      // Skip if it looks like a CSS anchor (#id-name) or sourcemap
      if (matchStr.startsWith('#')) {
        const before = line.slice(0, column)
        if (/url\(\s*$/.test(before) || /[a-z-]$/i.test(before)) {
          match = pattern.exec(line)
          continue
        }
      }

      onMatch(matchStr, column)
      match = pattern.exec(line)
    }
  }
}

/**
 * Check one file's contents for token-compliance violations.
 *
 * Exported so `color-lint.spec.ts` can drive it without touching the
 * filesystem or the process exit code.
 *
 * @param content - The file's source.
 * @param displayPath - Repo-relative path used in the violation report.
 */
export function checkSource(content: string, displayPath: string): ColorViolation[] {
  const violations: ColorViolation[] = []

  // File-level exemption
  if (content.includes(FILE_DISABLE_MARKER)) {
    return violations
  }

  // Bare `border` in a component's `tv()` base string gets its colour from a
  // separate compoundVariants entry, so that rule only applies to stories.
  const isStory = displayPath.endsWith('.stories.ts')

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

    if (HARD_EXCLUSION_PATTERNS.some(p => p.test(line))) {
      continue
    }

    const record = (matchStr: string, column: number): void => {
      const contextStart = Math.max(0, column - 20)
      const contextEnd = Math.min(line.length, column + matchStr.length + 20)
      violations.push({
        file: displayPath,
        line: i + 1,
        column: column + 1,
        match: matchStr,
        context: line.slice(contextStart, contextEnd).trim(),
      })
    }

    // Group 1 — raw CSS values, with the permissive exclusions.
    if (!SOFT_EXCLUSION_PATTERNS.some(p => p.test(line))) {
      matchLine(line, COLOR_PATTERNS, record)
    }

    // Group 2 — Tailwind color classes, everywhere, no var() exclusion.
    matchLine(line, TAILWIND_COLOR_PATTERNS, record)

    // Group 3 — untokenized borders, stories only, inside class attributes only.
    if (isStory) {
      CLASS_ATTR_RE.lastIndex = 0
      let attr: RegExpExecArray | null = CLASS_ATTR_RE.exec(line)
      while (attr !== null) {
        const body = attr[1] ?? ''
        if (!TOKENIZED_BORDER_RE.test(body)) {
          const bodyOffset = attr.index + attr[0].indexOf(body)
          matchLine(body, BARE_BORDER_PATTERNS, (m, col) => record(m, bodyOffset + col))
        }
        attr = CLASS_ATTR_RE.exec(line)
      }
    }
  }

  return violations
}

function checkFile(filePath: string): ColorViolation[] {
  return checkSource(readFileSync(filePath, 'utf-8'), relative(ROOT, filePath))
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
  console.error('Use CSS custom properties instead:')
  console.error('  secondary text  → text-[var(--dz-muted-foreground)]')
  console.error('  body text       → text-[var(--dz-foreground)]')
  console.error('  subtle surface  → bg-[var(--dz-muted)]')
  console.error('  borders         → border-[var(--dz-border)]')
  console.error('  status chips    → bg-[var(--dz-{intent}-muted)] text-[var(--dz-{intent}-muted-foreground)]')
  console.error('  decorative      → var(--dz-colors-{palette}-{shade})')
  console.error('\nIn packages/core/stories, `yarn codemod:story-colors` applies these for you.')
  console.error('For a genuine exception, add `token-check-disable-line` or `token-check-disable-file`.\n')

  process.exit(1)
}

// Only run when executed directly, so the spec can import `checkSource`.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}

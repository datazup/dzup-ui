/**
 * Interaction Contract Validator
 *
 * Prevents reintroduction of raw semantic focus-ring token plumbing and
 * one-off invalid outline overrides inside @dzup-ui/core component
 * implementations. Component code should use the shared interaction utilities
 * documented in packages/core/src/styles/INTERACTION_CONTRACT.md instead.
 *
 * Usage:
 *   tsx packages/tooling/src/validators/interaction-contract.ts
 *
 * Exit code 1 if violations found.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

export interface Violation {
  file: string
  line: number
  rule: string
  excerpt: string
  guidance: string
}

interface Rule {
  id: string
  pattern: RegExp
  guidance: string
}

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../')
const COMPONENTS_DIR = resolve(ROOT, 'packages/core/src/components')

const IGNORE_SUFFIXES = ['.spec.ts', '.test.ts', '.stories.ts', '.tokens.ts']
const VALID_EXTENSIONS = ['.ts', '.vue']

const RULES: Rule[] = [
  {
    id: 'raw-semantic-focus-ring-token',
    pattern: /--dz-(button|control|input)-focus-ring-(width|color|offset)/,
    guidance: 'Use semantic utilities like dz-focus-ring-button, dz-focus-ring-control, dz-focus-ring-input, dz-focus-within-ring-input, or dz-button-state-ring instead of inlining focus-ring token plumbing in component code.',
  },
  {
    id: 'raw-invalid-outline-override',
    pattern: /focus-visible:outline-\[var\(--dz-danger\)\]/,
    guidance: 'Invalid states should rely on semantic input/control focus utilities plus a danger border, not a one-off danger outline override.',
  },
]

export function collectFiles(dir: string): string[] {
  const files: string[] = []

  function walk(currentDir: string): void {
    const entries = readdirSync(currentDir)

    for (const entry of entries) {
      const fullPath = join(currentDir, entry)
      const stat = statSync(fullPath)

      if (stat.isDirectory()) {
        if (entry === 'dist' || entry === 'node_modules') {
          continue
        }
        walk(fullPath)
        continue
      }

      if (!stat.isFile()) {
        continue
      }

      if (!VALID_EXTENSIONS.some(ext => entry.endsWith(ext))) {
        continue
      }

      if (IGNORE_SUFFIXES.some(suffix => entry.endsWith(suffix))) {
        continue
      }

      files.push(fullPath)
    }
  }

  walk(dir)
  return files
}

export function validateContent(content: string, filePath: string): Violation[] {
  const lines = content.split('\n')
  const violations: Violation[] = []

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]

    if (line === undefined) {
      continue
    }

    for (const rule of RULES) {
      if (!rule.pattern.test(line)) {
        continue
      }

      violations.push({
        file: filePath,
        line: index + 1,
        rule: rule.id,
        excerpt: line.trim(),
        guidance: rule.guidance,
      })
    }
  }

  return violations
}

export function validateFile(filePath: string, rootDir = ROOT): Violation[] {
  const content = readFileSync(filePath, 'utf8')
  return validateContent(content, relative(rootDir, filePath))
}

export function runInteractionContractCheck(
  componentsDir = COMPONENTS_DIR,
  rootDir = ROOT,
): Violation[] {
  const files = collectFiles(componentsDir)
  return files.flatMap(filePath => validateFile(filePath, rootDir))
}

function main(): void {
  const violations = runInteractionContractCheck()

  if (violations.length === 0) {
    console.warn('Interaction contract check passed: 0 violations')
    process.exit(0)
  }

  console.error(`Interaction contract violations found: ${violations.length}\n`)

  for (const violation of violations) {
    console.error(`  ${violation.file}:${violation.line}`)
    console.error(`    rule: ${violation.rule}`)
    console.error(`    code: ${violation.excerpt}`)
    console.error(`    guidance: ${violation.guidance}\n`)
  }

  console.error('See packages/core/src/styles/INTERACTION_CONTRACT.md for the semantic interaction contract.\n')
  process.exit(1)
}

const isDirectRun = process.argv[1]?.includes('interaction-contract')
if (isDirectRun) {
  main()
}

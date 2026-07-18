/**
 * Scoped Style Validator (TASK-DS-09)
 *
 * ADR-04: components style through `tv()` variants in `*.variants.ts` and the
 * shared stylesheet at `packages/core/src/styles/base.css`. They never carry a
 * `<style>` block of their own.
 *
 * Before this validator existed, 27 components shipped a `<style scoped>` block
 * and 26 of them restated the *same* `@media (prefers-reduced-motion: reduce)`
 * rule that `tokens.css` already declares globally, unlayered and `!important`.
 * A policy expressed 27 times is a policy that will drift; a 28th component would
 * have copied the 27th. This check is what keeps it expressed once.
 *
 * **Why a whole-block ban rather than a reduced-motion-specific one.** A scoped
 * block is the mechanism that made the duplication possible. Banning the
 * mechanism removes the entire class of drift, and the escape hatches are better
 * anyway: a component-wide rule belongs in `base.css`, and an element-level one
 * belongs in that component's `*.variants.ts`.
 *
 * Usage:
 *   tsx packages/tooling/src/validators/scoped-style.ts
 *
 * Exit code 1 if violations found.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

export interface ScopedStyleViolation {
  file: string
  line: number
  message: string
}

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../')
const CORE_SRC = resolve(ROOT, 'packages/core/src')

/**
 * An SFC `<style>` block opener: `<style>`, `<style scoped>`, `<style lang="…">`.
 * Deliberately matches at the start of a line so the phrase `<style>` inside a
 * doc comment (as in DzThemeProvider.vue) is not mistaken for a real block.
 */
const STYLE_OPEN_RE = /^\s*<style\b/

const GUIDANCE
  = 'ADR-04 forbids <style> blocks in core components. Move a component-wide rule '
    + 'into packages/core/src/styles/base.css (dz-base or dz-components layer), or an '
    + 'element-level one into that component\'s *.variants.ts. Reduced motion is already '
    + 'handled globally by the unlayered !important rule at the end of tokens.css — do '
    + 'not restate it per component.'

/** Check one SFC's source. Pure — this is what the unit tests drive. */
export function checkVueSource(file: string, source: string): ScopedStyleViolation[] {
  const violations: ScopedStyleViolation[] = []
  source.split(/\r?\n/).forEach((text, index) => {
    if (STYLE_OPEN_RE.test(text)) {
      violations.push({
        file,
        line: index + 1,
        message: `${text.trim()} — ${GUIDANCE}`,
      })
    }
  })
  return violations
}

/** Recursively collect `*.vue` under `dir`. */
export function collectVueFiles(dir: string): string[] {
  const files: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      if (entry === 'node_modules')
        continue
      files.push(...collectVueFiles(full))
    }
    else if (entry.endsWith('.vue')) {
      files.push(full)
    }
  }
  return files
}

/** Run the check over every `.vue` under packages/core/src. */
export function checkScopedStyles(srcDir: string = CORE_SRC): ScopedStyleViolation[] {
  return collectVueFiles(srcDir).flatMap((full) => {
    // Normalize to forward slashes so messages match on win32 and posix.
    const rel = relative(ROOT, full).replaceAll('\\', '/')
    return checkVueSource(rel, readFileSync(full, 'utf8'))
  })
}

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
const isMain = process.argv[1]
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const violations = checkScopedStyles()
  if (violations.length === 0) {
    console.warn('✓ scoped-style: no <style> blocks in packages/core/src')
    process.exit(0)
  }
  for (const v of violations)
    console.error(`✗ ${v.file}:${v.line}\n  ${v.message}`)
  console.error(`\n${violations.length} <style> block(s) found.`)
  process.exit(1)
}
/* c8 ignore stop */

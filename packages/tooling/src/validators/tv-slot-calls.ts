/**
 * `tv()` slot-call validator (TASK-N2-S1, ADR-19 · closes N1-O3 finding G1).
 *
 * A `tv({ slots: … })` recipe returns an object of **functions**. Binding one
 * without calling it —
 *
 * ```vue
 * <div :class="styles.closeButton" />      <!-- wrong: a function -->
 * <div :class="styles.closeButton()" />    <!-- right: a class string -->
 * ```
 *
 * — is valid TypeScript, valid Vue and completely silent. Vue's `normalizeClass`
 * has no branch for a function, so it yields the empty string and the element
 * renders with **no classes at all**.
 *
 * This is not hypothetical. `DzLightbox` shipped **ten** of them (N1-O3 finding
 * G1): no backdrop, no blur, no sizing, no positioning, and a close control that
 * measured 16×16 because that is the size of the bare SVG inside it. Typecheck,
 * lint, the unit specs, the contract specs and the story-DoD gate all passed.
 * A repo-wide scan found it was the only component with the defect, and that
 * every one of its ten bindings had it — the shape of a mistake that is made
 * once, per component, in bulk.
 *
 * The N1 handoff's closing line was that a one-expression validator would have
 * caught it. This is that validator, written before TASK-N2-S1 added slot
 * functions to a further set of components.
 *
 * ## What it checks
 *
 * For every `.vue` under `packages/core/src`:
 *
 * 1. Collect the slot names of every `tv({ slots: { … } })` recipe in scope —
 *    the sibling `Dz{Name}.variants.ts`, any relatively-imported `*.variants.ts`,
 *    and any `tv()` written inline in the SFC.
 * 2. Find the identifiers those recipes are **bound** to:
 *    `const styles = fooVariants({ … })`,
 *    `const styles = computed(() => fooVariants({ … }))`, and the destructured
 *    form `const { root, item } = fooVariants({ … })`.
 * 3. Report every `binder.slot` / `binder.value.slot` that is **not** followed by
 *    a call, and every destructured slot identifier used inside a class binding
 *    without one.
 *
 * ## What it deliberately does not do
 *
 * It does not type-check, and it does not look at anything outside
 * `packages/core/src`. A slot function that is genuinely wanted as a *value* —
 * passed to a helper, stored, forwarded — is legal and rare; mark that line
 * `tv-slot-ok: <reason>` and the reason lives at the expression rather than in a
 * list somewhere else. That is the same escape hatch `validate:hardcoded-strings`
 * and `validate:rtl` use.
 *
 * Usage:
 *   tsx packages/tooling/src/validators/tv-slot-calls.ts
 *
 * Exit code 1 if any bound-but-uncalled slot is found.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../')
const CORE_SRC = resolve(ROOT, 'packages/core/src')

/** Line-level opt-out, mirroring `hardcoded-string-ok` / `rtl-physical-ok`. */
const OPT_OUT_RE = /tv-slot-ok:/

export interface TvSlotViolation {
  file: string
  line: number
  /** `styles.closeButton` — the expression as written. */
  expression: string
  message: string
}

// ---------------------------------------------------------------------------
// Source scanning primitives
// ---------------------------------------------------------------------------

/**
 * Blank out line, block **and HTML** comments, **preserving every offset**.
 *
 * The HTML form is not an afterthought: the natural place to write
 * `<!-- was :class="styles.overlay" before the fix -->` is the template, three
 * lines from the corrected binding, and a validator that reports its own fix
 * note as a defect is one a reader learns to ignore.
 *
 * Comments are replaced character-for-character with spaces (newlines kept), not
 * deleted. `ownership/anatomy-source.ts` deletes them because it only ever reads
 * a value back; here the offset of a match is reported to a human as a file and
 * line, so a stripped source that shortens the file reports the wrong line — the
 * first seeded run of this validator pointed at line 106 for a defect on line
 * 164, because DzLightbox carries a 58-line header comment explaining the very
 * bug being detected.
 *
 * The `[^:]` guard keeps `https://` inside a string from eating the line.
 */
export function stripComments(source: string): string {
  const blank = (text: string): string => text.replaceAll(/[^\n]/g, ' ')
  return source
    .replaceAll(/<!--[\s\S]*?-->/g, match => blank(match))
    .replaceAll(/\/\*[\s\S]*?\*\//g, match => blank(match))
    .replaceAll(/(^|[^:])(\/\/[^\n]*)/g, (_match, lead: string, comment: string) => lead + blank(comment))
}

/**
 * The balanced `{ … }` body that starts at `from` (which must index the `{`).
 *
 * Brace matching rather than a lazy regex: a `slots` block contains nested
 * arrays, template literals and objects, so "up to the first `}`" is wrong and
 * "up to the last `}`" swallows the rest of the recipe.
 */
function balancedBody(source: string, from: number): string | undefined {
  let depth = 0
  for (let index = from; index < source.length; index++) {
    const character = source[index]
    if (character === '{') {
      depth++
    }
    else if (character === '}') {
      depth--
      if (depth === 0)
        return source.slice(from + 1, index)
    }
  }
  return undefined
}

/** Top-level `key:` names of an object-literal body. */
function topLevelKeys(body: string): string[] {
  const keys: string[] = []
  let depth = 0
  let atStart = true
  for (let index = 0; index < body.length; index++) {
    // `?? ''` rather than `body[index]!`: `noUncheckedIndexedAccess` is on in
    // packages/tooling, which is NOT in `typecheck:all` (N2-A1 finding F7), so
    // this file's types are only ever checked by running `tsc -p` on the package
    // by hand — which is how this exact line was caught.
    const character = body[index] ?? ''
    if (character === '{' || character === '[' || character === '(') {
      depth++
      atStart = false
      continue
    }
    if (character === '}' || character === ']' || character === ')') {
      depth--
      continue
    }
    if (character === ',' && depth === 0) {
      atStart = true
      continue
    }
    if (depth === 0 && atStart) {
      if (/\s/.test(character))
        continue
      const rest = body.slice(index)
      // `regexp/use-ignore-case` wants the `i` flag here. It must not have it:
      // the flag applies to the WHOLE pattern, not to the one character class
      // the rule is looking at, and slot names are matched case-sensitively on
      // purpose — `styles.Root` is not `styles.root`. Accepting the autofix
      // would silently widen every match in this file. Same class as N2-A1
      // finding F8, where this exact rule would have changed a published JSON
      // Schema pattern so that clients rejected `DzButton`.
      // eslint-disable-next-line regexp/use-ignore-case -- see above
      const match = /^(?:'([^']+)'|"([^"]+)"|([A-Za-z_$][\w$]*))\s*:/.exec(rest)
      if (match !== null)
        keys.push(match[1] ?? match[2] ?? match[3] ?? '')
      atStart = false
    }
  }
  return keys
}

/**
 * Every `export const NAME = tv({ … slots: { … } … })` in a source, as
 * `NAME -> slot names`. Recipes without a `slots` block return no entry: their
 * result is a string, and binding it is correct.
 */
export function slotRecipesIn(source: string): Map<string, string[]> {
  const clean = stripComments(source)
  const recipes = new Map<string, string[]>()

  for (const match of clean.matchAll(/(?:export\s+)?const\s+([A-Za-z_$][\w$]*)\s*=\s*tv\s*\(\s*\{/g)) {
    const openBrace = match.index + match[0].length - 1
    const body = balancedBody(clean, openBrace)
    if (body === undefined)
      continue
    const slotsAt = /(?:^|[,{\s])slots\s*:\s*\{/.exec(body)
    if (slotsAt === null)
      continue
    const slotsBody = balancedBody(body, slotsAt.index + slotsAt[0].length - 1)
    if (slotsBody === undefined)
      continue
    const names = topLevelKeys(slotsBody)
    if (names.length > 0)
      recipes.set(match[1] ?? '', names)
  }
  return recipes
}

/**
 * The `*.variants.ts` sources reachable from one SFC: its own sibling, plus any
 * relative import that names one.
 *
 * Resolved from the filesystem rather than assumed, so a component that pulls a
 * shared recipe out of another family is covered too.
 */
export function variantSourcesFor(vuePath: string, source: string): string[] {
  const sources: string[] = []
  const sibling = vuePath.replace(/\.vue$/, '.variants.ts')
  if (existsSync(sibling))
    sources.push(readFileSync(sibling, 'utf8'))

  for (const match of stripComments(source).matchAll(/from\s+'([^']*\.variants\.ts)'/g)) {
    const target = resolve(dirname(vuePath), match[1] ?? '')
    if (target !== sibling && existsSync(target))
      sources.push(readFileSync(target, 'utf8'))
  }
  return sources
}

// ---------------------------------------------------------------------------
// The rule
// ---------------------------------------------------------------------------

interface Binder {
  /** The identifier the recipe result is bound to. */
  name: string
  /** Slot names that binder exposes. */
  slots: string[]
  /** Whether the binder is a `ref`/`computed` and so needs `.value` in script. */
  wrapped: boolean
}

/**
 * Identifiers a slot-bearing recipe result is bound to, plus the slot functions
 * pulled straight out of one by destructuring.
 */
export function bindersIn(
  script: string,
  recipes: Map<string, string[]>,
): { binders: Binder[], destructured: Map<string, string> } {
  const binders: Binder[] = []
  const destructured = new Map<string, string>()
  const names = [...recipes.keys()]
  if (names.length === 0)
    return { binders, destructured }

  const alternation = names.map(name => name.replaceAll(/\$/g, '\\$')).join('|')

  // const styles = computed(() => fooVariants({ … }))   /   const styles = fooVariants({ … })
  const bindRe = new RegExp(
    `const\\s+([A-Za-z_$][\\w$]*)\\s*=\\s*(computed\\s*\\(\\s*\\(\\s*\\)\\s*=>\\s*)?\\s*(${alternation})\\s*\\(`,
    'g',
  )
  for (const match of script.matchAll(bindRe)) {
    binders.push({
      name: match[1] ?? '',
      slots: recipes.get(match[3] ?? '') ?? [],
      wrapped: match[2] !== undefined,
    })
  }

  // const { root, item } = fooVariants({ … })
  const destructureRe = new RegExp(
    `const\\s*\\{([^}]*)\\}\\s*=\\s*(?:computed\\s*\\(\\s*\\(\\s*\\)\\s*=>\\s*)?\\s*(${alternation})\\s*\\(`,
    'g',
  )
  for (const match of script.matchAll(destructureRe)) {
    const slots = new Set(recipes.get(match[2] ?? '') ?? [])
    for (const raw of (match[1] ?? '').split(',')) {
      const parts = raw.split(':').map(piece => piece.trim())
      const source = parts[0] ?? ''
      const local = parts[1] ?? source
      if (source !== '' && slots.has(source))
        destructured.set(local, source)
    }
  }

  return { binders, destructured }
}

/** 1-based line number of a character offset. */
function lineOf(source: string, offset: number): number {
  return source.slice(0, offset).split('\n').length
}

/** The physical source line an offset falls on, for the opt-out check. */
function lineTextOf(source: string, offset: number): string {
  const start = source.lastIndexOf('\n', offset) + 1
  const end = source.indexOf('\n', offset)
  return source.slice(start, end === -1 ? source.length : end)
}

/**
 * Check one SFC. Pure — this is what the unit tests drive.
 *
 * `source` is the raw SFC; `variantSources` are the `*.variants.ts` bodies in
 * scope, passed in rather than read here so the rules can be tested without a
 * filesystem.
 */
export function checkVueSource(
  file: string,
  source: string,
  variantSources: readonly string[] = [],
): TvSlotViolation[] {
  const recipes = new Map<string, string[]>()
  for (const variantSource of [...variantSources, source]) {
    for (const [name, slots] of slotRecipesIn(variantSource))
      recipes.set(name, slots)
  }
  if (recipes.size === 0)
    return []

  const clean = stripComments(source)
  const { binders, destructured } = bindersIn(clean, recipes)
  const violations: TvSlotViolation[] = []
  const seen = new Set<string>()

  const record = (offset: number, expression: string, message: string): void => {
    if (OPT_OUT_RE.test(lineTextOf(source, offset)))
      return
    const line = lineOf(source, offset)
    const key = `${line}:${expression}`
    if (seen.has(key))
      return
    seen.add(key)
    violations.push({ file, line, expression, message })
  }

  for (const binder of binders) {
    for (const slot of binder.slots) {
      // `styles.value.root` (script) and `styles.root` (template, auto-unwrapped)
      // are the same expression to a reader; both are wrong without the call.
      //
      // A trailing `.` is excluded as well as a trailing `(`: a recipe with a
      // slot literally named `value` makes `styles.value.root()` match this
      // pattern with `slot = value`, and the ref unwrap is not a slot access.
      // Anything read as an object rather than called is not a class binding.
      const accessRe = new RegExp(
        `\\b${binder.name}\\s*(?:\\.\\s*value\\s*)?\\.\\s*${slot}\\b\\s*(?!\\s*[.(])`,
        'g',
      )
      for (const match of clean.matchAll(accessRe)) {
        const expression = match[0].trim()
        record(
          match.index,
          expression,
          `\`${expression}\` is a tv() slot FUNCTION bound without being called. `
          + `Vue's normalizeClass has no case for a function, so this renders with NO classes. `
          + `Write \`${expression}()\`. (N1-O3 finding G1 — DzLightbox shipped ten of these and `
          + 'every gate in the repository passed.)',
        )
      }
    }
  }

  for (const [local, slot] of destructured) {
    // A destructured slot function is only wrong where a class is expected, so
    // the check is scoped to class bindings and cn() arguments rather than to
    // every mention of the identifier.
    const classRe = new RegExp(
      `(?::class\\s*=\\s*"|\\bcn\\s*\\()[^"\\n)]*\\b${local}\\b\\s*(?!\\s*\\()`,
      'g',
    )
    for (const match of clean.matchAll(classRe)) {
      record(
        match.index,
        local,
        `\`${local}\` is the tv() slot function \`${slot}\`, used as a class value without being `
        + `called. Write \`${local}()\`. (N1-O3 finding G1.)`,
      )
    }
  }

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

export interface TvSlotReport {
  violations: TvSlotViolation[]
  /** SFCs that had at least one slot-bearing recipe in scope — the real denominator. */
  filesWithSlotRecipes: number
  filesScanned: number
}

/** Run the check over every `.vue` under `packages/core/src`. */
export function checkTvSlotCalls(srcDir: string = CORE_SRC): TvSlotReport {
  const files = collectVueFiles(srcDir)
  const violations: TvSlotViolation[] = []
  let filesWithSlotRecipes = 0

  for (const full of files) {
    const source = readFileSync(full, 'utf8')
    const variantSources = variantSourcesFor(full, source)
    const hasRecipe = [...variantSources, source].some(text => slotRecipesIn(text).size > 0)
    if (hasRecipe)
      filesWithSlotRecipes++
    // Normalize to forward slashes so messages match on win32 and posix.
    const rel = relative(ROOT, full).replaceAll('\\', '/')
    violations.push(...checkVueSource(rel, source, variantSources))
  }

  return { violations, filesWithSlotRecipes, filesScanned: files.length }
}

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
const isMain = process.argv[1]
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const report = checkTvSlotCalls()
  if (report.violations.length === 0) {
    console.warn(
      `✓ tv-slot-calls: every tv() slot is called where it is bound `
      + `(${report.filesWithSlotRecipes} of ${report.filesScanned} SFCs have a slot recipe in scope)`,
    )
    process.exit(0)
  }
  for (const violation of report.violations)
    console.error(`✗ ${violation.file}:${violation.line}\n  ${violation.message}`)
  console.error(
    `\n${report.violations.length} bound-but-uncalled tv() slot(s). `
    + 'Each one renders its element with no classes at all.',
  )
  process.exit(1)
}
/* c8 ignore stop */

/**
 * Story Definition-of-Done Validator (TASK-FREE-15)
 *
 * `apps/storybook/stories/Contributing.mdx` mandates what every component story
 * must contain. It was documented and never machine-checked, so the corpus drifted.
 * This validator is the check that was missing.
 *
 * **It enforces the DoD's intent, not its literal wording**, because the two had
 * come apart in three places that measurement exposed:
 *
 *  - The DoD says a story named `Default`. 23 files instead open with a
 *    better-named controls-driven story (`Month` for DzCalendar, `Fab` for
 *    DzSpeedDial, `ListLayout` for DzDataView). Renaming those to `Default` would
 *    make the docs worse, so the rule is "a story bound to `args`", and `Default`
 *    is the name to reach for absent a clearer one. The real gap was 3 files, not 26.
 *  - The DoD says `States` "as applicable". 71 of 167 components declare no
 *    `disabled`/`loading`/`readonly`/`invalid` prop at all — `DzVisuallyHidden`
 *    has no state to show. `applicable` is therefore derived from the component's
 *    own `.types.ts`, not assumed. The real gap was 35 files, not 134.
 *  - The DoD says `DarkMode` "via `darkModeDecorator`". 15 files apply that
 *    decorator to a differently-named story, which demonstrates dark mode just as
 *    well. The rule is decorator usage, not export name.
 *
 * Encoding the "as applicable" clause the DoD already carried is not a weakening
 * of the gate — it is the first time that clause has meant anything.
 *
 * **The ratchet.** Turning 7 checks on against 167 files at once would land ~200
 * failures and get switched off within a week. Checks therefore carry a `level`:
 * `error` fails the build; `report` prints its count and its stragglers so the
 * remaining distance is always visible and never has to be re-measured by hand.
 * Promote a check by changing one word here, once its list is empty.
 *
 * Scope mirrors `story-status.ts`: only `Core/<Family>/<Component>` stories.
 * `_gallery` pages (`Visual Refresh/*`) are visual matrices, not component pages,
 * and are exempt.
 *
 * Usage:
 *   tsx packages/tooling/src/validators/story-dod.ts          # enforce + report
 *   tsx packages/tooling/src/validators/story-dod.ts --all    # report every check
 *
 * Exit code 1 if an `error`-level check has violations.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../')
const STORIES_DIR = resolve(ROOT, 'packages/core/stories')
const COMPONENTS_DIR = resolve(ROOT, 'packages/core/src/components')

export type DodLevel = 'error' | 'report'

export interface DodViolation {
  file: string
  check: string
  level: DodLevel
  message: string
}

export interface DodCheckResult {
  id: string
  level: DodLevel
  applicable: number
  passing: number
  violations: DodViolation[]
}

/**
 * The props that make a `States` story meaningful. A component declaring none of
 * these has no states to demonstrate, which is what the DoD's "as applicable"
 * has always meant.
 */
export const STATE_PROPS = [
  'disabled',
  'loading',
  'readonly',
  'invalid',
  'error',
  'required',
] as const

/**
 * A story-path title (`Core/Buttons/DzButton`), not a data label. Compositions
 * stories contain `title: 'Total Revenue'` in their fixture data, so requiring a
 * `/` is what keeps the fixture from being mistaken for the meta title.
 */
const TITLE_RE = /title:\s*['"]([^"'/]*\/[^"']*)['"]/

/** `export const Foo: Story = {` / `export const Foo = {`. */
const EXPORT_RE = /export const (\w+)\s*[:=]/g

/**
 * Whether a `/** *\/` block is attached to the meta statement, exactly as Babel
 * would attach it: nothing but whitespace and `//` line comments may sit between
 * the block's `*\/` and `const meta`.
 *
 * Done by scanning rather than by one regex on purpose. The regex form
 * (`\*\/(?:\s*\/\/[^\n]*)*\s*const meta`) nests a quantifier that can trade
 * characters with its neighbour, which `regexp/no-super-linear-backtracking`
 * correctly flags as ReDoS-shaped — and this runs over every story file in CI.
 * Walking backwards from `const meta` is linear and states the rule plainly.
 */
export function hasAttachedDescription(source: string): boolean {
  const metaIdx = source.search(/^(?:export\s+)?const meta\b/m)
  if (metaIdx < 0)
    return false

  // Everything above `const meta`, with trailing blank lines and `//` comments
  // peeled off — Babel skips those when attaching a leading comment.
  let head = source.slice(0, metaIdx).trimEnd()
  for (;;) {
    const lastNewline = head.lastIndexOf('\n')
    const lastLine = head.slice(lastNewline + 1).trim()
    if (lastLine.startsWith('//') && !lastLine.startsWith('/**')) {
      head = head.slice(0, Math.max(0, lastNewline)).trimEnd()
      continue
    }
    break
  }
  // Whatever now sits directly above `const meta` must be the end of a JSDoc
  // block. A `*/` that closes a plain `/* */` comment is not a description, so
  // require the matching opener to be `/**`.
  if (!head.endsWith('*/'))
    return false
  const openIdx = head.lastIndexOf('/**')
  if (openIdx < 0)
    return false
  // The `/**` must open the block that this `*/` closes — i.e. no earlier `*/`
  // between them.
  return !head.slice(openIdx + 3, head.length - 2).includes('*/')
}

/**
 * `darkModeDecorator` inside a `decorators: [...]` array — i.e. actually applied
 * to a story or a meta, not just imported at the top of the file.
 */
const DARK_MODE_RE = /decorators:\s*\[[^\]]*\bdarkModeDecorator\b/

export interface StoryContext {
  /** Repo-relative, forward-slashed. */
  file: string
  source: string
  title: string
  family: string
  component: string
  exports: string[]
  /** State props declared by the component's own `.types.ts`; empty if unresolved. */
  stateProps: string[]
  /**
   * Whether `meta` declares `args`/`argTypes` — i.e. whether the page advertises
   * a Controls panel at all. Anatomy and composition pages (`*Parts`,
   * `Compositions/*`) declare none: they document how sub-parts fit together and
   * have no single component to drive, so a controls story is not applicable.
   */
  declaresControls: boolean
  /** Whether any story actually binds the args into what it renders. */
  bindsArgs: boolean
}

/** True when a story title names a real component. Mirrors `story-status.ts`. */
export function isComponentTitle(title: string): boolean {
  const segments = title.split('/')
  return segments[0] === 'Core' && segments.length >= 3
}

/**
 * Index every `<Component>.types.ts` under core, so `States` applicability can be
 * derived from the component's real props rather than guessed from its name.
 */
export function indexComponentTypes(componentsDir: string = COMPONENTS_DIR): Map<string, string> {
  const index = new Map<string, string>()
  if (!existsSync(componentsDir))
    return index
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry)
      if (statSync(full).isDirectory())
        walk(full)
      else if (entry.endsWith('.types.ts'))
        index.set(entry.replace('.types.ts', ''), readFileSync(full, 'utf8'))
    }
  }
  walk(componentsDir)
  return index
}

/**
 * The state props a component declares. Matches a two-space-indented optional
 * prop (`  disabled?: boolean`) so that a mention of `disabled` inside a JSDoc
 * block or a nested type does not count as a declaration.
 */
export function declaredStateProps(typesSource: string | undefined): string[] {
  if (!typesSource)
    return []
  return STATE_PROPS.filter(p => new RegExp(`^\\s{2}${p}\\?:`, 'm').test(typesSource))
}

export function buildContext(
  file: string,
  source: string,
  types: Map<string, string>,
): StoryContext | null {
  const title = source.match(TITLE_RE)?.[1]
  if (!title || !isComponentTitle(title))
    return null
  const segments = title.split('/')
  const component = segments[2]!
  return {
    file,
    source,
    title,
    family: segments[1]!,
    component,
    exports: [...source.matchAll(EXPORT_RE)].map(m => m[1]!),
    stateProps: declaredStateProps(types.get(component)),
    declaresControls: declaresControls(source),
    bindsArgs: /v-bind="args"|\.\.\.args/.test(source),
  }
}

/**
 * True when the `meta` object declares `args` or `argTypes` at its top level.
 * Scoped to the meta block so that a story-level `args:` further down the file
 * does not make the page look like it advertises controls.
 */
export function declaresControls(source: string): boolean {
  const metaIdx = source.search(/^(?:export\s+)?const meta\b/m)
  if (metaIdx < 0)
    return false
  const end = source.indexOf('export default meta', metaIdx)
  const metaBlock = source.slice(metaIdx, end > 0 ? end : undefined)
  return /^\s{2}(?:args|argTypes):/m.test(metaBlock)
}

interface DodCheck {
  id: string
  level: DodLevel
  /** Whether the DoD item applies to this story at all. */
  applies: (ctx: StoryContext) => boolean
  passes: (ctx: StoryContext) => boolean
  remedy: (ctx: StoryContext) => string
}

/**
 * The DoD, as checks. Order matches `Contributing.mdx`'s numbered list.
 *
 * `level` is the ratchet. Promote `report` → `error` once that check's straggler
 * list is empty; never add an exemption to make a check pass.
 */
export const CHECKS: DodCheck[] = [
  {
    // Contributing.mdx item 1. Applies only where the page advertises controls.
    id: 'controls-driven',
    level: 'error',
    applies: ctx => ctx.declaresControls,
    passes: ctx => ctx.exports.includes('Default') || ctx.bindsArgs,
    remedy: ctx => `"${ctx.title}" declares argTypes but has no entry story. Add one that binds `
      + `the args (\`v-bind="args"\`) so the Controls panel does something. Name it \`Default\` `
      + `unless a more specific name reads better on the page.`,
  },
  {
    // The sharper form of item 1, reported until its list is empty. A page that
    // declares argTypes renders a Controls panel whether or not anything is wired
    // to it — so these 25 pages invite the reader to drag a knob that moves
    // nothing. Enforcing this today would land 25 failures at once; it is the
    // next check to promote.
    id: 'controls-live',
    level: 'report',
    applies: ctx => ctx.declaresControls,
    passes: ctx => ctx.bindsArgs,
    remedy: ctx => `"${ctx.title}" declares argTypes, so its docs page shows a Controls panel, `
      + `but no story binds \`args\` — every control in that panel is inert. Bind the args in the `
      + `entry story (\`v-bind="args"\`), or drop the argTypes if the page is pure anatomy.`,
  },
  {
    // Contributing.mdx item 2.
    id: 'gallery',
    level: 'report',
    applies: () => true,
    passes: ctx => ctx.exports.some(n => /(?:Gallery|Matrix)$/.test(n))
      || /\b(?:DemoGrid|DemoRow|DemoSection)\b/.test(ctx.source),
    remedy: ctx => `"${ctx.title}" has no gallery/matrix story. Add a \`*Gallery\` or \`*Matrix\` `
      + `laid out with \`DemoRow\`/\`DemoGrid\` from '../_shared'.`,
  },
  {
    // Contributing.mdx item 3 — "as applicable", derived from the component's props.
    id: 'states',
    level: 'report',
    applies: ctx => ctx.stateProps.length > 0,
    passes: ctx => ctx.exports.includes('States'),
    remedy: ctx => `"${ctx.title}" declares ${ctx.stateProps.map(p => `\`${p}\``).join(', ')} `
      + `but has no \`States\` story demonstrating them.`,
  },
  {
    // Contributing.mdx item 4.
    //
    // KNOWN BLIND SPOT: this asserts the decorator is present, not that the
    // preview is correct. `darkModeDecorator` puts `data-theme="dark"` on a
    // wrapper div, and CSS custom properties inherit through the DOM — so a
    // component that portals its panel out (`<Teleport to="body">` in
    // DzPopconfirm/DzTour, Reka's `DialogPortal` in DzSheetContent) escapes that
    // wrapper and resolves the LIGHT tokens, giving a light panel on a dark
    // canvas under a story called "Dark Mode Preview". Those stories must ALSO
    // set `globals: { theme: 'dark' }`, which themes `<html>` via
    // `withThemeByDataAttribute`. A regex cannot tell the two apart; the a11y
    // run and Chromatic are what catch it.
    id: 'dark-mode',
    level: 'error',
    applies: () => true,
    // Match the decorator being APPLIED, not merely imported — a bare mention
    // would let a leftover import satisfy the check.
    passes: ctx => DARK_MODE_RE.test(ctx.source),
    remedy: ctx => `"${ctx.title}" never previews dark mode. Add a story with `
      + `\`decorators: [darkModeDecorator]\` (import it from '../_shared' — do not re-inline the `
      + `\`data-theme="dark"\` wrapper).`,
  },
  {
    // Contributing.mdx item 5.
    id: 'accessibility',
    level: 'report',
    applies: () => true,
    passes: ctx => ctx.exports.includes('Accessibility'),
    remedy: ctx => `"${ctx.title}" has no \`Accessibility\` story demonstrating its focus ring / `
      + `ARIA wiring.`,
  },
  {
    // Contributing.mdx item 6.
    id: 'real-world',
    level: 'report',
    applies: () => true,
    passes: ctx => ctx.exports.some(n => n.startsWith('RealWorld')),
    remedy: ctx => `"${ctx.title}" has no \`RealWorld*\` story showing the component in a `
      + `realistic composition.`,
  },
  {
    // Contributing.mdx item 7 — "where interactive"; reported, since interactivity
    // is a judgment a regex should not pretend to make.
    id: 'play',
    level: 'report',
    applies: () => true,
    passes: ctx => /\bplay:\s*async/.test(ctx.source),
    remedy: ctx => `"${ctx.title}" has no \`play()\` interaction test. Add one if the component `
      + `is interactive, and \`await\` every \`userEvent\`/\`expect\`.`,
  },
  {
    // Contributing.mdx item 8 — the component description.
    id: 'description',
    level: 'error',
    applies: () => true,
    // Mirrors Storybook's own rule. `enrichCsfMeta` calls
    // `extractDescription(csfSource._metaStatement)`, which reads ONLY that
    // statement's Babel `leadingComments` and keeps only `/** */` blocks
    // (`CommentLine`s are discarded). Babel attaches a comment to the statement
    // that FOLLOWS it — so a doc comment separated from `const meta` by fixture
    // data attaches to the fixture instead, and the docs page renders nothing.
    // That is how several components came to carry prose no user can read.
    // Intervening `//` comments are fine: Babel still attaches the block, and
    // Storybook filters the line comments out.
    passes: ctx => hasAttachedDescription(ctx.source)
      || /description:\s*\{[\s\S]{0,200}?component:/.test(ctx.source),
    remedy: ctx => `"${ctx.title}" renders no component description — its docs page opens with a `
      + `bare API table. Add a JSDoc block DIRECTLY above \`const meta\` (no imports or fixture `
      + `data between) saying what the component is for and when to reach for it.`,
  },
]

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

/** Run every check over one story file. Pure — this is what the unit tests drive. */
export function checkStorySource(
  file: string,
  source: string,
  types: Map<string, string> = new Map(),
): DodViolation[] {
  const ctx = buildContext(file, source, types)
  if (!ctx)
    return []
  return CHECKS
    .filter(c => c.applies(ctx) && !c.passes(ctx))
    .map(c => ({ file, check: c.id, level: c.level, message: c.remedy(ctx) }))
}

/** Run every check over the whole corpus, returning per-check counts. */
export function checkStoryDod(
  storiesDir: string = STORIES_DIR,
  componentsDir: string = COMPONENTS_DIR,
): DodCheckResult[] {
  const types = indexComponentTypes(componentsDir)
  const contexts = collectStoryFiles(storiesDir)
    .map((full) => {
      const rel = relative(ROOT, full).replaceAll('\\', '/')
      return buildContext(rel, readFileSync(full, 'utf8'), types)
    })
    .filter((c): c is StoryContext => c !== null)

  return CHECKS.map((check) => {
    const applicable = contexts.filter(c => check.applies(c))
    const failing = applicable.filter(c => !check.passes(c))
    return {
      id: check.id,
      level: check.level,
      applicable: applicable.length,
      passing: applicable.length - failing.length,
      violations: failing.map(c => ({
        file: c.file,
        check: check.id,
        level: check.level,
        message: check.remedy(c),
      })),
    }
  })
}

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
const isMain = process.argv[1]
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const showAll = process.argv.includes('--all')
  const results = checkStoryDod()

  console.warn('Story Definition of Done — Contributing.mdx, machine-checked\n')
  for (const r of results) {
    const pct = r.applicable === 0 ? 100 : Math.round((r.passing / r.applicable) * 100)
    const mark = r.violations.length === 0 ? '✓' : (r.level === 'error' ? '✗' : '·')
    const tag = r.level === 'error' ? 'enforced' : 'reported'
    console.warn(
      `  ${mark} ${r.id.padEnd(16)} ${String(r.passing).padStart(3)} / ${String(r.applicable).padEnd(3)}`
      + `  ${String(pct).padStart(3)}%  (${tag})`,
    )
  }

  const errors = results.filter(r => r.level === 'error').flatMap(r => r.violations)
  const reports = results.filter(r => r.level === 'report').flatMap(r => r.violations)

  if (showAll && reports.length > 0) {
    console.warn(`\n--- reported (not failing the build) ---`)
    for (const v of reports)
      console.warn(`  · ${v.file} [${v.check}]\n    ${v.message}`)
  }

  if (errors.length === 0) {
    console.warn(
      `\n✓ story-dod: every enforced check passes.${
        reports.length > 0
          ? ` ${reports.length} reported item(s) remain — run with --all to list them.`
          : ''}`,
    )
    process.exit(0)
  }

  console.error('')
  for (const v of errors)
    console.error(`✗ ${v.file} [${v.check}]\n  ${v.message}`)
  console.error(`\n${errors.length} story-dod violation(s) on enforced checks.`)
  process.exit(1)
}
/* c8 ignore stop */

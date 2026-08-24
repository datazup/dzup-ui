/**
 * Browser-matrix target generator (TASK-OSS-P5-03).
 *
 * Emits `e2e/matrix/targets.generated.ts`: for every public component, the
 * Storybook story the matrix suites drive it through, its tier, and its traits.
 *
 * **Why generate this instead of listing stories in the spec.** A handwritten
 * list is how a matrix silently narrows: a component gets added, nobody adds
 * its row, and the suite still reports green over a smaller catalog than it
 * claims. The list is derived from `quality-matrix.json` — which the P5-01
 * validator already keeps in step with the ownership manifest — so a new
 * component appears in the browser matrix the moment it is public, and a
 * component with no story appears as an explicit `unrun` target rather than as
 * an absence.
 *
 * Story id derivation mirrors Storybook's own: the meta `title` lowercased with
 * every run of non-alphanumerics collapsed to a single `-`. `Core/Buttons/
 * DzButton` → `core-buttons-dzbutton`.
 *
 * Usage:
 *   tsx packages/tooling/src/quality/generate-matrix-targets.ts
 */

import type { ComponentTrait, RiskTier } from '@dzup-ui/contracts'
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { basename, extname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { ROOT } from '../ownership/generate-ownership-manifest.ts'
import { compareSymbols } from '../ownership/ownership-manifest.types.ts'
import { readCommittedMatrix } from './generate-quality-matrix.ts'

export const MATRIX_TARGETS_PATH = resolve(ROOT, 'e2e/matrix/targets.generated.ts')
const STORIES_DIR = resolve(ROOT, 'packages/core/stories')

/** `Core/Buttons/DzButton` → `core-buttons-dzbutton`, as Storybook sanitizes it. */
export function toStoryId(title: string): string {
  return title
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * lodash's word split, near enough for export names.
 *
 * The first alternative is what makes `RTLGallery` two words rather than three
 * letters: a run of capitals ends where a capitalised word begins, or at a word
 * boundary. Digits are their own word, as lodash treats them, so `Grid2Columns`
 * is `grid-2-columns`.
 */
const WORD_RE = /[A-Z]{2,}(?=[A-Z][a-z]|\b)|[A-Z]?[a-z]+|[A-Z]|\d+/g

/**
 * `PanelBlock` → `panel-block`, as Storybook derives a story id from its export.
 *
 * Storybook does NOT sanitize the export name directly: it runs it through
 * `storyNameFromExport`, which is lodash `startCase(camelCase(key))`, and
 * sanitizes *that*. So `PanelBlock` becomes "Panel Block" and then
 * `panel-block` — with a hyphen this function has to reproduce, because a
 * lowercased `panelblock` is a story id that does not exist and Storybook
 * answers it with `sb-show-errordisplay` rather than an error a test can read.
 */
export function toStoryExportId(exportName: string): string {
  const words = exportName.match(WORD_RE)
  return (words ?? [exportName]).map(w => w.toLowerCase()).join('-')
}

/**
 * Story directories Storybook does not build by default.
 *
 * `_gallery` holds free-styled visual references that ADR-04 forbids shipping,
 * and `_app-specific` holds four datazup-vocabulary badges that do not belong
 * in a general-purpose catalog. Both are behind inclusion flags in
 * `apps/storybook/.storybook/main.ts`.
 *
 * They are excluded here for a plain reason: the matrix drives the Storybook a
 * default build produces, so a target pointing into either one names a story
 * that does not exist. Deriving an id anyway would have put four phantom cells
 * in the matrix that read as covered.
 */
const UNBUILT_STORY_DIRS = new Set(['_gallery', '_app-specific'])

const TITLE_RE = /title:\s*['"]([^"'/]*\/[^"']*)['"]/
/** `export const Default: Story = {` / `export const Default = {`. */
const EXPORT_RE = /export const (\w+)\s*[:=]/g

/** One component's browser-matrix target. */
export interface MatrixTarget {
  readonly component: string
  readonly family: string
  readonly tier: RiskTier
  readonly traits: readonly ComponentTrait[]
  /**
   * Full story id (`core-buttons-dzbutton--default`), or `null` when the
   * component has no story file the matrix can drive. `null` is a target the
   * suite reports as `unrun`; it is never silently dropped.
   */
  readonly story: string | null
}

function collectStoryFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = resolve(dir, entry)
    if (statSync(full).isDirectory()) {
      if (entry !== 'node_modules' && !UNBUILT_STORY_DIRS.has(entry))
        collectStoryFiles(full, out)
    }
    else if (extname(full) === '.ts' && full.endsWith('.stories.ts')) {
      out.push(full)
    }
  }
  return out
}

/**
 * component → first story id, for every `Dz*.stories.ts` named after a symbol.
 *
 * The *first* export rather than one named `Default`, because 23 files open
 * with a better-named controls-driven story — `Month` for `DzCalendar`, `Fab`
 * for `DzSpeedDial`. `story-dod.ts` reached the same conclusion for the same
 * reason; hard-coding `--default` here would have pointed a fifth of the matrix
 * at story ids that 404.
 */
export function indexStories(dir: string = STORIES_DIR): Map<string, string> {
  const out = new Map<string, string>()
  for (const file of collectStoryFiles(dir)) {
    const source = readFileSync(file, 'utf8')
    const title = TITLE_RE.exec(source)?.[1]
    if (title === undefined)
      continue
    const first = [...source.matchAll(EXPORT_RE)]
      .map(m => m[1]!)
      .find(name => name !== 'meta' && name !== 'default')
    if (first === undefined)
      continue
    out.set(basename(file, '.stories.ts'), `${toStoryId(title)}--${toStoryExportId(first)}`)
  }
  return out
}

/** Build the target list from the committed quality matrix. */
export function buildMatrixTargets(
  matrix = readCommittedMatrix(),
  stories: Map<string, string> = indexStories(),
): MatrixTarget[] {
  if (matrix === undefined)
    throw new Error('quality-matrix.json is missing. Run `yarn generate:quality-matrix` first.')

  return [...matrix.components]
    .sort((a, b) => compareSymbols(a.component, b.component))
    .map(row => ({
      component: row.component,
      family: row.family,
      tier: row.tier,
      traits: row.traits,
      story: stories.get(row.component) ?? null,
    }))
}

const HEADER = `/**
 * AUTO-GENERATED — do not edit.
 *
 * Written by \`yarn generate:matrix-targets\` from
 * packages/core/docs/quality-matrix.json and packages/core/stories/.
 *
 * The browser matrix (TASK-OSS-P5-03) drives every Tier B–D component through
 * three engines and five conditions. A component with \`story: null\` has no
 * story to drive and is reported as \`unrun\` — visible, not skipped.
 */
`

/** Render the module. */
export function renderMatrixTargets(targets: readonly MatrixTarget[]): string {
  const rows = targets.map((t) => {
    const traits = t.traits.length === 0
      ? '[]'
      : `[${t.traits.map(x => `'${x}'`).join(', ')}]`
    const story = t.story === null ? 'null' : `'${t.story}'`
    return `  { component: '${t.component}', family: '${t.family}', tier: '${t.tier}', `
      + `traits: ${traits}, story: ${story} },`
  })

  return `${HEADER}
/** One component's browser-matrix target. */
export interface MatrixTarget {
  readonly component: string
  readonly family: string
  readonly tier: 'A' | 'B' | 'C' | 'D'
  readonly traits: readonly ('teleports' | 'drags' | 'dataset')[]
  /** Storybook story id, or null when the component has no story to drive. */
  readonly story: string | null
}

export const MATRIX_TARGETS: readonly MatrixTarget[] = [
${rows.join('\n')}
]
`
}

/* c8 ignore start -- CLI entry point, exercised via \`tsx\`, not the unit tests. */
const isMain = process.argv[1] !== undefined
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const targets = buildMatrixTargets()
  writeFileSync(MATRIX_TARGETS_PATH, renderMatrixTargets(targets), 'utf8')

  const inMatrix = targets.filter(t => t.tier !== 'A')
  const missing = inMatrix.filter(t => t.story === null)

  console.warn(
    `matrix-targets: ${targets.length} components, ${inMatrix.length} in the Tier B–D lane`,
  )
  console.warn(`  → e2e/matrix/targets.generated.ts`)
  if (missing.length > 0) {
    console.warn(
      `  ! ${missing.length} with no story, reported as unrun: `
      + `${missing.map(t => t.component).join(', ')}`,
    )
  }
}
/* c8 ignore stop */

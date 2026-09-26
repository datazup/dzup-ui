/**
 * swap-icon-library transform — TASK-R1-O6 decision item 1.
 *
 * Rewrites imports of the deprecated `lucide-vue-next` to its renamed
 * continuation `@lucide/vue`. `lucide-vue-next` is deprecated on npm in favour
 * of `@lucide/vue` ("Package deprecated. Please use @lucide/vue instead."),
 * every published version of it carries the notice, and the last release under
 * the old name is `1.0.0` while the new name is already at `1.47.0`.
 *
 * ## Why this transform is a specifier rewrite and nothing else
 *
 * Measured on 2026-09-21 against `lucide-vue-next@0.477.0` (installed at
 * `packages/core/node_modules`) and an `@lucide/vue@1.47.0` tarball:
 * **all 18 glyph identifiers `@dzup-ui/core` imports exist in `@lucide/vue`
 * under the same names.** There is no rename to perform, so {@link GLYPH_MAP}
 * is an identity map. It is written out in full anyway, because an empty map
 * and an unchecked map look the same in a diff, and because the day a name
 * does disappear this is the file that has to say so.
 *
 * ## What the transform deliberately does NOT do
 *
 * Three consequences of the swap are NOT code changes and are not fixed here.
 * They are the reason this transform ships behind an owner decision rather
 * than being run:
 *
 * 1. **Three glyphs were redrawn** ({@link REDRAWN_GLYPHS}). `Filter` now
 *    resolves to the `funnel` module (a completely different path), and
 *    `CalendarIcon` and `Clock` have new node arrays. Pixels move; visual
 *    baselines must be re-recorded.
 * 2. **Every rendered `<svg class>` changes** ({@link CLASS_RENAMES}). 0.x
 *    emitted `lucide lucide-x-icon`; 1.x emits `lucide lucide-x`, and two of
 *    the 18 additionally gain an alias class (`lucide-funnel lucide-filter`,
 *    `lucide-ellipsis lucide-more-horizontal`). No file in this repository
 *    selects on those classes — a consumer's stylesheet may.
 * 3. **1.x emits `aria-hidden="true"` by default** when an icon has no
 *    accessible name and no default slot. 0.x never did. That is very probably
 *    an improvement, and it is still a change to the accessibility tree that
 *    the AT matrix records.
 *
 * ## Idempotence, and one printing artefact
 *
 * Running this on already-migrated source produces no changes: the transform
 * only matches the old specifier.
 *
 * `recast` re-prints the *statement* around a node it mutated. For a dynamic
 * `import('lucide-vue-next')` inside a function body that means the rewritten
 * line comes back with a trailing semicolon, which this repository's ESLint
 * config removes. Fixture `04-dynamic-and-reexport.output.ts` records the raw
 * output rather than hiding it: **run `yarn lint --fix` after the codemod.**
 *
 * @module
 */

import type { API, FileInfo, Options } from 'jscodeshift'
import { isVueFile } from '../utils/vue-sfc.js'

/** The deprecated package, and its renamed continuation. */
export const OLD_PACKAGE = 'lucide-vue-next'
export const NEW_PACKAGE = '@lucide/vue'

/**
 * Old identifier → new identifier, for every glyph `@dzup-ui/core` imports.
 *
 * Identity throughout: measured 18/18 present in `@lucide/vue@1.47.0`, in both
 * `dist/lucide-vue.d.ts` and the ESM barrel's runtime exports. Two of them are
 * ALIAS exports in 1.x rather than canonical names — see {@link ALIASED_GLYPHS} —
 * but an alias export is a real export and rewriting to the canonical name
 * would change the rendered class for no benefit.
 */
export const GLYPH_MAP: ReadonlyMap<string, string> = new Map([
  ['CalendarIcon', 'CalendarIcon'],
  ['Check', 'Check'],
  ['ChevronDown', 'ChevronDown'],
  ['ChevronLeft', 'ChevronLeft'],
  ['ChevronRight', 'ChevronRight'],
  ['ChevronUp', 'ChevronUp'],
  ['ChevronsDown', 'ChevronsDown'],
  ['ChevronsLeft', 'ChevronsLeft'],
  ['ChevronsRight', 'ChevronsRight'],
  ['ChevronsUp', 'ChevronsUp'],
  ['Clock', 'Clock'],
  ['Filter', 'Filter'],
  ['GripVertical', 'GripVertical'],
  ['Minus', 'Minus'],
  ['MoreHorizontal', 'MoreHorizontal'],
  ['Plus', 'Plus'],
  ['Star', 'Star'],
  ['X', 'X'],
])

/**
 * Glyphs whose artwork differs between `lucide-vue-next@0.477.0` and
 * `@lucide/vue@1.47.0`. The identifier still resolves; the drawing is new.
 * Visual baselines for any component using these must be re-recorded.
 */
export const REDRAWN_GLYPHS: readonly string[] = ['CalendarIcon', 'Clock', 'Filter']

/**
 * Glyphs that are alias exports in 1.x, resolving to a differently-named
 * canonical module. `Filter` → `funnel`, `MoreHorizontal` → `ellipsis`.
 * (`MoreHorizontal` was already an alias of `ellipsis` in 0.477.0, with
 * identical artwork; `Filter` was not, and its artwork changed with the name.)
 */
export const ALIASED_GLYPHS: ReadonlyMap<string, string> = new Map([
  ['Filter', 'funnel'],
  ['MoreHorizontal', 'ellipsis'],
])

/**
 * The rendered `<svg class>` before → after, for every glyph. 1.x drops the
 * `-icon` suffix the 0.x component name carried and appends one class per
 * upstream alias. Measured, not predicted: 0.x builds it in `Icon.js` as
 * `["lucide", "lucide-" + toKebabCase(name)]` with `name` = `"XIcon"`; 1.x
 * builds it in `shared/src/build/buildLucideIconNode.mjs` from `icon.name`
 * (already kebab) plus `icon.aliases`.
 */
export const CLASS_RENAMES: ReadonlyMap<string, { from: string, to: string }> = new Map([
  ['CalendarIcon', { from: 'lucide lucide-calendar-icon', to: 'lucide lucide-calendar' }],
  ['Check', { from: 'lucide lucide-check-icon', to: 'lucide lucide-check' }],
  ['ChevronDown', { from: 'lucide lucide-chevron-down-icon', to: 'lucide lucide-chevron-down' }],
  ['ChevronLeft', { from: 'lucide lucide-chevron-left-icon', to: 'lucide lucide-chevron-left' }],
  ['ChevronRight', { from: 'lucide lucide-chevron-right-icon', to: 'lucide lucide-chevron-right' }],
  ['ChevronUp', { from: 'lucide lucide-chevron-up-icon', to: 'lucide lucide-chevron-up' }],
  ['ChevronsDown', { from: 'lucide lucide-chevrons-down-icon', to: 'lucide lucide-chevrons-down' }],
  ['ChevronsLeft', { from: 'lucide lucide-chevrons-left-icon', to: 'lucide lucide-chevrons-left' }],
  ['ChevronsRight', { from: 'lucide lucide-chevrons-right-icon', to: 'lucide lucide-chevrons-right' }],
  ['ChevronsUp', { from: 'lucide lucide-chevrons-up-icon', to: 'lucide lucide-chevrons-up' }],
  ['Clock', { from: 'lucide lucide-clock-icon', to: 'lucide lucide-clock' }],
  ['Filter', { from: 'lucide lucide-filter-icon', to: 'lucide lucide-funnel lucide-filter' }],
  ['GripVertical', { from: 'lucide lucide-grip-vertical-icon', to: 'lucide lucide-grip-vertical' }],
  ['Minus', { from: 'lucide lucide-minus-icon', to: 'lucide lucide-minus' }],
  ['MoreHorizontal', { from: 'lucide lucide-ellipsis-icon', to: 'lucide lucide-ellipsis lucide-more-horizontal' }],
  ['Plus', { from: 'lucide lucide-plus-icon', to: 'lucide lucide-plus' }],
  ['Star', { from: 'lucide lucide-star-icon', to: 'lucide lucide-star' }],
  ['X', { from: 'lucide lucide-xicon', to: 'lucide lucide-x' }],
])

/**
 * Rewrites one module specifier, or returns null when it is not the icon
 * library. Deep subpaths are rewritten too, and their extension changes:
 * 0.x ships `dist/esm/icons/x.js`, 1.x ships `dist/esm/icons/x.mjs`.
 */
export function rewriteSpecifier(specifier: string): string | null {
  if (specifier === OLD_PACKAGE)
    return NEW_PACKAGE
  if (specifier.startsWith(`${OLD_PACKAGE}/`)) {
    const rest = specifier.slice(OLD_PACKAGE.length + 1).replace(/\.js$/, '.mjs')
    return `${NEW_PACKAGE}/${rest}`
  }
  return null
}

/** Every glyph identifier this file touches that the contract flags. */
export function flaggedGlyphs(names: readonly string[]): {
  redrawn: string[]
  aliased: string[]
  unknown: string[]
} {
  return {
    redrawn: names.filter(n => REDRAWN_GLYPHS.includes(n)),
    aliased: names.filter(n => ALIASED_GLYPHS.has(n)),
    unknown: names.filter(n => !GLYPH_MAP.has(n)),
  }
}

/**
 * jscodeshift transform entry point.
 *
 * @returns The transformed source, or `null` if no changes were made.
 */
export default function transformer(
  file: FileInfo,
  api: API,
  _options: Options,
): string | null {
  if (isVueFile(file.path))
    return transformVueFile(file.source, api)
  return transformScript(file.source, api)
}

/**
 * Every `<script>` block of an SFC, rewritten in place.
 *
 * `CodemodRunner` hands a `.vue` file to the transform whole, so the transform
 * must find the scripts itself: parsed whole, the template is a syntax error.
 * A component can import icons from both a plain `<script>` and a
 * `<script setup>`, so each block is rewritten, not just the first.
 */
const SCRIPT_BLOCK = /(<script(?:\s[^>]*)?>)([\s\S]*?)(<\/script>)/g

function transformVueFile(source: string, api: API): string | null {
  let changed = false
  const next = source.replace(SCRIPT_BLOCK, (block, open: string, body: string, close: string) => {
    const rewritten = transformScript(body, api)
    if (rewritten === null)
      return block
    changed = true
    return `${open}${rewritten}${close}`
  })
  return changed ? next : null
}

function transformScript(source: string, api: API): string | null {
  const j = api.jscodeshift
  const root = j(source)
  let hasChanges = false

  const rewriteSource = (node: { value?: unknown }): void => {
    if (typeof node.value !== 'string')
      return
    const next = rewriteSpecifier(node.value)
    if (next === null)
      return
    node.value = next
    hasChanges = true
  }

  // import … from '…'  /  import '…'
  root.find(j.ImportDeclaration).forEach((path) => {
    rewriteSource(path.node.source as { value?: unknown })
    if (path.node.specifiers) {
      for (const specifier of path.node.specifiers) {
        if (specifier.type !== 'ImportSpecifier' || !specifier.imported)
          continue
        const imported = specifier.imported as { name?: string }
        if (typeof imported.name !== 'string')
          continue
        const renamed = GLYPH_MAP.get(imported.name)
        if (renamed !== undefined && renamed !== imported.name) {
          imported.name = renamed
          hasChanges = true
        }
      }
    }
  })

  // export … from '…'
  root.find(j.ExportNamedDeclaration).forEach((path) => {
    if (path.node.source)
      rewriteSource(path.node.source as { value?: unknown })
  })
  root.find(j.ExportAllDeclaration).forEach((path) => {
    if (path.node.source)
      rewriteSource(path.node.source as { value?: unknown })
  })

  // await import('…')
  root
    .find(j.CallExpression)
    .filter(path => (path.node.callee as { type?: string }).type === 'Import')
    .forEach((path) => {
      const [arg] = path.node.arguments
      if (arg && (arg.type === 'Literal' || arg.type === 'StringLiteral'))
        rewriteSource(arg as unknown as { value?: unknown })
    })

  if (!hasChanges)
    return null

  return root.toSource({
    quote: 'single',
    trailingComma: true,
  })
}

export { transformer }

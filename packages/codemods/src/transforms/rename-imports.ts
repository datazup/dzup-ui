/**
 * rename-imports transform
 *
 * Updates import paths from the old dzip-ui package structure to the new
 * vNext `@dzip-ui/core` and `@dzip-ui/pro` packages.
 *
 * Handled rewrites:
 * - `import { X } from 'dzip-ui'`              -> `import { X } from '@dzip-ui/core'`
 * - `import { X } from '@dzip-ui/components'`   -> `import { X } from '@dzip-ui/core'`
 * - `import { X } from 'dzip-ui/pro'`           -> `import { X } from '@dzip-ui/pro'`
 * - `import { X } from '@dzip-ui/pro-components'`-> `import { X } from '@dzip-ui/pro'`
 *
 * This transform is idempotent: running it on already-migrated imports
 * produces no changes.
 *
 * @module
 */

import type { API, FileInfo, Options } from 'jscodeshift'

/** Map from old import source to new import source. */
const IMPORT_SOURCE_MAP: ReadonlyMap<string, string> = new Map([
  // Bare package name -> core
  ['dzip-ui', '@dzip-ui/core'],
  // Old scoped names -> core
  ['@dzip-ui/components', '@dzip-ui/core'],
  ['@dzip-ui/ui', '@dzip-ui/core'],
  // Pro paths
  ['dzip-ui/pro', '@dzip-ui/pro'],
  ['@dzip-ui/pro-components', '@dzip-ui/pro'],
])

/**
 * Well-known Pro component prefixes / names.
 * If a specifier name matches, it is routed to `@dzip-ui/pro` even when
 * imported from a generic source like `'dzip-ui'`.
 */
const PRO_COMPONENT_NAMES: ReadonlySet<string> = new Set([
  // Builders
  'DzFormBuilder',
  'DzNoCodeEngine',
  'DzVisualBuilder',
  // Communication
  'DzChat',
  'DzComments',
  'DzWhiteboard',
  // Data-pro
  'DzDataGridPro',
  'DzFilterBuilder',
  'DzFilterBuilderAdvanced',
  // Planning
  'DzGantt',
  'DzGanttPro',
  'DzGanttEnhanced',
  'DzCalendar',
  'DzScheduler',
  // Workflow
  'DzKanban',
  'DzKanbanBoard',
  // Business
  'DzAnalyticsSuite',
  // Visualization
  'DzRealtimeChart',
  // Editors
  'DzCodeEditor',
  'DzImageEditor',
  'DzRichTextEditor',
  'DzRichTextEditorPro',
  // Layout-pro
  'DzDashboard',
  'DzDashboardBuilder',
])

/**
 * Determine the correct target package for a specifier name.
 * Pro components go to `@dzip-ui/pro`, everything else to the mapped target
 * (which defaults to `@dzip-ui/core`).
 */
function resolveTarget(specifierName: string, defaultTarget: string): string {
  if (PRO_COMPONENT_NAMES.has(specifierName)) {
    return '@dzip-ui/pro'
  }
  return defaultTarget
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
  const j = api.jscodeshift
  const root = j(file.source)
  let hasChanges = false

  root.find(j.ImportDeclaration).forEach((path) => {
    const sourceValue = path.node.source.value
    if (typeof sourceValue !== 'string')
      return

    const mappedTarget = IMPORT_SOURCE_MAP.get(sourceValue)
    if (!mappedTarget)
      return

    const specifiers = path.node.specifiers
    if (!specifiers || specifiers.length === 0) {
      // Side-effect import: just rewrite the source.
      path.node.source = j.literal(mappedTarget)
      hasChanges = true
      return
    }

    // Group specifiers by resolved target package.
    const groups = new Map<string, typeof specifiers>()

    for (const specifier of specifiers) {
      const name
        = specifier.type === 'ImportSpecifier' && specifier.imported
          ? (specifier.imported as { name: string }).name
          : ''
      const target = resolveTarget(name, mappedTarget)

      if (!groups.has(target)) {
        groups.set(target, [])
      }
      groups.get(target)!.push(specifier)
    }

    // If all specifiers map to the same target, rewrite in place.
    if (groups.size === 1) {
      const [target] = [...groups.keys()]
      if (target) {
        path.node.source = j.literal(target)
        hasChanges = true
      }
      return
    }

    // Multiple targets: split into separate import declarations.
    const newDecls = [...groups.entries()].map(([target, specs]) =>
      j.importDeclaration(specs, j.literal(target)),
    )

    j(path).replaceWith(newDecls)
    hasChanges = true
  })

  if (!hasChanges)
    return null

  return root.toSource({
    quote: 'single',
    trailingComma: true,
  })
}

export { transformer }

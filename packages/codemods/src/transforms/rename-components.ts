/**
 * rename-components transform
 *
 * Renames component tag names in Vue SFC templates and import statements
 * to match the vNext API.
 *
 * Template-level changes (regex-based, Vue SFC only):
 * - `<DzModal` -> `<DzDialog`, `</DzModal>` -> `</DzDialog>`
 * - `<DzNotification` -> `<DzToast`, `</DzNotification>` -> `</DzToast>`
 * - `<DzDropdownMenu` -> `<DzDropdown`, `</DzDropdownMenu>` -> `</DzDropdown>`
 * - `<DzToolTip` -> `<DzTooltip`, `</DzToolTip>` -> `</DzTooltip>`
 * - `<DzLoading` -> `<DzSpinner`, `</DzLoading>` -> `</DzSpinner>`
 *
 * Script-level changes (jscodeshift AST):
 * - Import specifier renames: `import { DzModal } from '...'` -> `import { DzDialog } from '...'`
 * - Local variable references updated accordingly
 *
 * This transform is idempotent.
 *
 * @module
 */

import type { API, FileInfo, Options } from 'jscodeshift'
import { extractScriptFromVue, isVueFile, replaceScriptInVue } from '../utils/vue-sfc.js'
import {
  extractTemplate,
  renameTemplateComponents,
  replaceTemplate,
} from '../utils/vue-template.js'

// ---------------------------------------------------------------------------
// Component rename mappings
// ---------------------------------------------------------------------------

/** Map from old component name to new component name. */
const COMPONENT_RENAMES: ReadonlyMap<string, string> = new Map([
  ['DzModal', 'DzDialog'],
  ['DzNotification', 'DzToast'],
  ['DzDropdownMenu', 'DzDropdown'],
  ['DzToolTip', 'DzTooltip'],
  ['DzLoading', 'DzSpinner'],
])

/** Template rename rules derived from the map. */
const TEMPLATE_RENAME_RULES = [...COMPONENT_RENAMES.entries()].map(
  ([oldName, newName]) => ({ oldName, newName }),
)

// ---------------------------------------------------------------------------
// Transform
// ---------------------------------------------------------------------------

/**
 * jscodeshift transform entry point.
 *
 * For `.vue` files: applies regex-based template transforms **and**
 * jscodeshift AST transforms on the `<script>` section.
 *
 * For `.ts` / `.tsx` / `.jsx` files: applies jscodeshift AST transforms
 * on the whole file.
 *
 * @returns The transformed source, or `null` if no changes were made.
 */
export default function transformer(
  file: FileInfo,
  api: API,
  _options: Options,
): string | null {
  if (isVueFile(file.path)) {
    return transformVueFile(file, api)
  }
  return transformScriptFile(file, api)
}

function transformVueFile(file: FileInfo, api: API): string | null {
  let source = file.source
  let changed = false

  // 1. Template transforms (regex-based)
  const tpl = extractTemplate(source)
  if (tpl) {
    const content = renameTemplateComponents(tpl.content, TEMPLATE_RENAME_RULES)
    if (content !== tpl.content) {
      source = replaceTemplate(source, content, tpl)
      changed = true
    }
  }

  // 2. Script transforms (AST-based)
  const extraction = extractScriptFromVue(source)
  if (extraction) {
    const scriptResult = applyScriptTransforms(
      { path: file.path, source: extraction.script },
      api,
    )
    if (scriptResult !== null) {
      source = replaceScriptInVue(source, scriptResult, extraction)
      changed = true
    }
  }

  return changed ? source : null
}

function transformScriptFile(file: FileInfo, api: API): string | null {
  return applyScriptTransforms(file, api)
}

/**
 * Apply component name renames in import statements via jscodeshift AST.
 *
 * Targets:
 * - Import specifiers: `import { DzModal } from '...'` -> `import { DzDialog } from '...'`
 * - Also renames any local references if the import used the old name directly
 *   (i.e. not aliased).
 */
function applyScriptTransforms(file: FileInfo, api: API): string | null {
  const j = api.jscodeshift
  const root = j(file.source)
  let hasChanges = false

  // Rename import specifiers.
  root.find(j.ImportSpecifier).forEach((path) => {
    const imported = path.node.imported
    if (imported.type !== 'Identifier')
      return

    const newName = COMPONENT_RENAMES.get(imported.name)
    if (!newName)
      return

    const local = path.node.local

    // If the local name matches the old imported name (no alias), rename both.
    if (local && local.type === 'Identifier' && local.name === imported.name) {
      // Find all references to the old local name and rename them.
      const oldLocalName = local.name
      root
        .find(j.Identifier, { name: oldLocalName })
        .forEach((idPath) => {
          // Skip the import specifier itself (handled below).
          if (idPath.parent?.node === path.node)
            return
          idPath.node.name = newName
        })
      local.name = newName
    }

    imported.name = newName
    hasChanges = true
  })

  // Also handle JSX element renames for .tsx files.
  root.find(j.JSXIdentifier).forEach((path) => {
    const newName = COMPONENT_RENAMES.get(path.node.name)
    if (newName) {
      path.node.name = newName
      hasChanges = true
    }
  })

  if (!hasChanges)
    return null

  return root.toSource({ quote: 'single', trailingComma: true })
}

export { transformer }

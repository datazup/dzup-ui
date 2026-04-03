/**
 * rename-props transform
 *
 * Renames component props in both JS/TS (JSX) and Vue SFC templates to
 * match the vNext API.
 *
 * Script-level changes (via jscodeshift AST):
 * - JSX attribute renames on matching component elements.
 *
 * Template-level changes (via regex, Vue SFC only):
 * - `type="primary"` -> `tone="primary" variant="solid"` on DzButton
 * - `type="error"` -> `tone="danger"` on DzAlert
 * - `visible` -> `open` on DzDialog, DzDrawer, DzSheet, DzModal
 * - `size="small"` -> `size="sm"`, `size="medium"` -> `size="md"`, `size="large"` -> `size="lg"`
 *
 * This transform is idempotent.
 *
 * @module
 */

import type { API, FileInfo, Options } from 'jscodeshift'
import type { TemplateAttrExpandRule, TemplateAttrRenameRule, TemplateValueRenameRule } from '../utils/vue-template.js'
import { extractScriptFromVue, isVueFile, replaceScriptInVue } from '../utils/vue-sfc.js'
import {
  expandTemplateAttrs,
  extractTemplate,
  renameTemplateAttrs,
  renameTemplateAttrValues,
  replaceTemplate,

} from '../utils/vue-template.js'

// ---------------------------------------------------------------------------
// Prop rename mappings
// ---------------------------------------------------------------------------

/** Overlay components whose `visible` prop is now `open`. */
const OVERLAY_COMPONENTS = ['DzDialog', 'DzDrawer', 'DzSheet', 'DzModal', 'DzOverlay']

/** All interactive components that accept a `size` prop. */
const SIZED_COMPONENTS = [
  'DzButton',
  'DzIconButton',
  'DzInput',
  'DzSelect',
  'DzCheckbox',
  'DzRadio',
  'DzSwitch',
  'DzToggle',
  'DzBadge',
  'DzChip',
  'DzTag',
  'DzAvatar',
  'DzSpinner',
  'DzLoader',
  'DzProgress',
]

/** Canonical size value renames. */
const SIZE_VALUE_MAP: Record<string, string> = {
  small: 'sm',
  medium: 'md',
  large: 'lg',
  mini: 'xs',
  huge: 'xl',
}

// -- Template rules ----------------------------------------------------------

const ATTR_RENAME_RULES: TemplateAttrRenameRule[] = [
  {
    components: OVERLAY_COMPONENTS,
    oldAttr: 'visible',
    newAttr: 'open',
  },
]

const VALUE_RENAME_RULES: TemplateValueRenameRule[] = [
  {
    components: SIZED_COMPONENTS,
    attr: 'size',
    valueMap: SIZE_VALUE_MAP,
  },
  {
    components: ['DzAlert'],
    attr: 'tone',
    valueMap: {
      error: 'danger',
      warning: 'warning',
      success: 'success',
      info: 'info',
    },
  },
]

const ATTR_EXPAND_RULES: TemplateAttrExpandRule[] = [
  {
    components: ['DzButton'],
    attr: 'type',
    expansionMap: {
      primary: 'tone="primary" variant="solid"',
      secondary: 'tone="neutral" variant="outline"',
      success: 'tone="success" variant="solid"',
      warning: 'tone="warning" variant="solid"',
      danger: 'tone="danger" variant="solid"',
      error: 'tone="danger" variant="solid"',
      info: 'tone="info" variant="solid"',
      text: 'tone="neutral" variant="text"',
      link: 'tone="primary" variant="link"',
      ghost: 'tone="neutral" variant="ghost"',
    },
  },
]

// Also rename `type` -> `tone` on DzAlert (without expansion, just attr rename
// is handled by the value rename rule above which rewrites the value; the attr
// name itself also needs to change).
const ALERT_ATTR_RENAME: TemplateAttrRenameRule[] = [
  {
    components: ['DzAlert'],
    oldAttr: 'type',
    newAttr: 'tone',
  },
]

// ---------------------------------------------------------------------------
// JSX helpers (for .tsx / .jsx files)
// ---------------------------------------------------------------------------

/** Prop renames per component for JSX attributes. */
const JSX_PROP_RENAMES: Record<string, Array<{ old: string, new: string }>> = {
  DzDialog: [{ old: 'visible', new: 'open' }],
  DzDrawer: [{ old: 'visible', new: 'open' }],
  DzSheet: [{ old: 'visible', new: 'open' }],
  DzModal: [{ old: 'visible', new: 'open' }],
  DzOverlay: [{ old: 'visible', new: 'open' }],
}

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
    let content = tpl.content

    content = renameTemplateAttrs(content, ATTR_RENAME_RULES)
    content = expandTemplateAttrs(content, ATTR_EXPAND_RULES)
    // After expanding DzButton `type`, rename DzAlert `type` -> `tone`
    content = renameTemplateAttrs(content, ALERT_ATTR_RENAME)
    content = renameTemplateAttrValues(content, VALUE_RENAME_RULES)

    if (content !== tpl.content) {
      source = replaceTemplate(source, content, tpl)
      changed = true
    }
  }

  // 2. Script transforms (AST-based)
  const extraction = extractScriptFromVue(source)
  if (extraction) {
    const scriptResult = applyJsxTransforms(
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
  return applyJsxTransforms(file, api)
}

/**
 * Apply JSX attribute renames via jscodeshift AST.
 */
function applyJsxTransforms(file: FileInfo, api: API): string | null {
  const j = api.jscodeshift
  const root = j(file.source)
  let hasChanges = false

  root.find(j.JSXElement).forEach((path) => {
    const opening = path.node.openingElement
    if (opening.name.type !== 'JSXIdentifier')
      return

    const componentName = (opening.name as { name: string }).name
    const renames = JSX_PROP_RENAMES[componentName]
    if (!renames)
      return

    for (const attr of opening.attributes ?? []) {
      if (attr.type !== 'JSXAttribute' || attr.name.type !== 'JSXIdentifier')
        continue
      const attrName = attr.name.name as string

      for (const rename of renames) {
        if (attrName === rename.old) {
          attr.name.name = rename.new
          hasChanges = true
        }
      }
    }
  })

  if (!hasChanges)
    return null

  return root.toSource({ quote: 'single', trailingComma: true })
}

export { transformer }

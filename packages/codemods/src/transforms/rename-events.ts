/**
 * rename-events transform
 *
 * Renames component events in both JS/TS (JSX) and Vue SFC templates to
 * match the vNext API.
 *
 * Template-level changes (regex-based, Vue SFC only):
 * - `@update:visible` -> `@update:open` on overlay components
 * - `@input` -> `@update:modelValue` on input-family components
 * - `v-on:update:visible` -> `v-on:update:open`
 * - `v-on:input` -> `v-on:update:modelValue`
 *
 * Script-level changes (jscodeshift AST):
 * - String literal `'update:visible'` -> `'update:open'` in `defineEmits` arrays
 * - Event handler prop names in JSX: `onUpdate:visible` -> `onUpdate:open`
 *
 * This transform is idempotent.
 *
 * @module
 */

import type { API, FileInfo, Options } from 'jscodeshift'
import type { TemplateEventRenameRule } from '../utils/vue-template.js'
import { extractScriptFromVue, isVueFile, replaceScriptInVue } from '../utils/vue-sfc.js'
import {
  extractTemplate,
  renameTemplateEvents,
  replaceTemplate,

} from '../utils/vue-template.js'

// ---------------------------------------------------------------------------
// Event rename mappings
// ---------------------------------------------------------------------------

/** Overlay components that renamed `update:visible` -> `update:open`. */
const OVERLAY_COMPONENTS = ['DzDialog', 'DzDrawer', 'DzSheet', 'DzModal', 'DzOverlay']

/** Input-family components where `@input` -> `@update:modelValue`. */
const INPUT_COMPONENTS = [
  'DzInput',
  'DzTextarea',
  'DzNumberField',
  'DzSelect',
  'DzCombobox',
  'DzAutoComplete',
  'DzSearchBox',
  'DzDatePicker',
  'DzTimePicker',
  'DzColorPicker',
  'DzSlider',
  'DzRating',
]

// -- Template rules ----------------------------------------------------------

const TEMPLATE_EVENT_RULES: TemplateEventRenameRule[] = [
  ...OVERLAY_COMPONENTS.map(
    (comp): TemplateEventRenameRule => ({
      components: [comp],
      oldEvent: 'update:visible',
      newEvent: 'update:open',
    }),
  ),
  ...INPUT_COMPONENTS.map(
    (comp): TemplateEventRenameRule => ({
      components: [comp],
      oldEvent: 'input',
      newEvent: 'update:modelValue',
    }),
  ),
]

// -- Script-level string literal renames -------------------------------------

/** Map from old event string to new event string (used in defineEmits arrays, $emit calls). */
const EVENT_STRING_MAP: ReadonlyMap<string, string> = new Map([
  ['update:visible', 'update:open'],
  ['input', 'update:modelValue'],
])

// ---------------------------------------------------------------------------
// Transform
// ---------------------------------------------------------------------------

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
  if (isVueFile(file.path)) {
    return transformVueFile(file, api)
  }
  return transformScriptFile(file, api)
}

function transformVueFile(file: FileInfo, api: API): string | null {
  let source = file.source
  let changed = false

  // 1. Template transforms
  const tpl = extractTemplate(source)
  if (tpl) {
    const content = renameTemplateEvents(tpl.content, TEMPLATE_EVENT_RULES)
    if (content !== tpl.content) {
      source = replaceTemplate(source, content, tpl)
      changed = true
    }
  }

  // 2. Script transforms
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
 * Apply event string renames in JS/TS via jscodeshift AST.
 *
 * Targets:
 * - String literals inside `defineEmits([...])` arrays
 * - String literals passed to `$emit(...)` or `emit(...)` calls
 */
function applyScriptTransforms(file: FileInfo, api: API): string | null {
  const j = api.jscodeshift
  const root = j(file.source)
  let hasChanges = false

  // Rename string literals in defineEmits arrays and emit() calls.
  root.find(j.StringLiteral).forEach((path) => {
    const value = path.node.value
    const replacement = EVENT_STRING_MAP.get(value)
    if (replacement === undefined)
      return

    // Only rename if the string is inside an array expression (defineEmits)
    // or a call expression (emit / $emit).
    const parent = path.parent?.node
    if (!parent)
      return

    const parentType = parent.type as string
    if (
      parentType === 'ArrayExpression'
      || parentType === 'CallExpression'
    ) {
      path.node.value = replacement
      hasChanges = true
    }
  })

  if (!hasChanges)
    return null

  return root.toSource({ quote: 'single', trailingComma: true })
}

export { transformer }

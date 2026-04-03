/**
 * rename-slots transform
 *
 * Renames slot names in Vue SFC templates and script sections to match
 * the vNext API.
 *
 * Template-level changes (regex-based, Vue SFC only):
 * - `<template #header>` -> `<template #title>` on DzCard, DzDialog, DzDrawer, DzSheet
 * - `<template #footer>` -> `<template #actions>` on DzCard, DzDialog, DzDrawer, DzSheet
 * - `<template #option>` -> `<template #item>` on DzSelect
 * - `<template #prepend>` -> `<template #prefix>` on DzInput
 * - `<template #append>` -> `<template #suffix>` on DzInput
 * - `<template #icon>` -> `<template #prefix>` on DzButton
 * - Also handles `v-slot:` syntax variants
 *
 * Script-level changes (jscodeshift AST):
 * - `$slots.header` -> `$slots.title` (property access renames)
 * - `$slots.footer` -> `$slots.actions`
 * - `$slots.option` -> `$slots.item`
 * - `$slots.prepend` -> `$slots.prefix`
 * - `$slots.append` -> `$slots.suffix`
 * - `$slots.icon` -> `$slots.prefix`
 *
 * This transform is idempotent.
 *
 * @module
 */

import type { API, FileInfo, Options } from 'jscodeshift'
import type { TemplateSlotRenameRule } from '../utils/vue-template.js'
import { extractScriptFromVue, isVueFile, replaceScriptInVue } from '../utils/vue-sfc.js'
import {
  extractTemplate,
  renameTemplateSlots,
  replaceTemplate,
} from '../utils/vue-template.js'

// ---------------------------------------------------------------------------
// Slot rename mappings
// ---------------------------------------------------------------------------

/** Components that rename #header -> #title and #footer -> #actions. */
const HEADER_FOOTER_COMPONENTS = ['DzCard', 'DzDialog', 'DzDrawer', 'DzSheet']

// -- Template rules ----------------------------------------------------------

const TEMPLATE_SLOT_RULES: TemplateSlotRenameRule[] = [
  // #header -> #title on cards and overlays
  {
    components: HEADER_FOOTER_COMPONENTS,
    oldSlot: 'header',
    newSlot: 'title',
  },
  // #footer -> #actions on cards and overlays
  {
    components: HEADER_FOOTER_COMPONENTS,
    oldSlot: 'footer',
    newSlot: 'actions',
  },
  // #option -> #item on DzSelect
  {
    components: ['DzSelect'],
    oldSlot: 'option',
    newSlot: 'item',
  },
  // #prepend -> #prefix on DzInput
  {
    components: ['DzInput'],
    oldSlot: 'prepend',
    newSlot: 'prefix',
  },
  // #append -> #suffix on DzInput
  {
    components: ['DzInput'],
    oldSlot: 'append',
    newSlot: 'suffix',
  },
  // #icon -> #prefix on DzButton
  {
    components: ['DzButton'],
    oldSlot: 'icon',
    newSlot: 'prefix',
  },
]

// -- Script-level $slots renames --------------------------------------------

/**
 * Map from old slot name to new slot name for $slots property access.
 * Used globally (not scoped to specific components) since $slots access
 * in script is already contextual to the component being defined.
 */
const SLOTS_PROPERTY_MAP: ReadonlyMap<string, string> = new Map([
  ['header', 'title'],
  ['footer', 'actions'],
  ['option', 'item'],
  ['prepend', 'prefix'],
  ['append', 'suffix'],
  ['icon', 'prefix'],
])

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
    const content = renameTemplateSlots(tpl.content, TEMPLATE_SLOT_RULES)
    if (content !== tpl.content) {
      source = replaceTemplate(source, content, tpl)
      changed = true
    }
  }

  // 2. Script transforms (AST-based)
  const extraction = extractScriptFromVue(source)
  if (extraction) {
    const scriptResult = applySlotsTransforms(
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
  return applySlotsTransforms(file, api)
}

/**
 * Apply $slots property renames via jscodeshift AST.
 *
 * Targets `$slots.oldName` member expressions and renames the property
 * to the new slot name.
 */
function applySlotsTransforms(file: FileInfo, api: API): string | null {
  const j = api.jscodeshift
  const root = j(file.source)
  let hasChanges = false

  // Find $slots.xxx member expressions
  root.find(j.MemberExpression).forEach((path) => {
    const object = path.node.object
    const property = path.node.property

    // Match $slots.xxx (non-computed access)
    if (path.node.computed)
      return

    // Check that object is `$slots` (Identifier) or `this.$slots`
    let isSlotsAccess = false
    if (object.type === 'Identifier' && object.name === '$slots') {
      isSlotsAccess = true
    }
    else if (
      object.type === 'MemberExpression'
      && !object.computed
      && object.property.type === 'Identifier'
      && object.property.name === '$slots'
    ) {
      isSlotsAccess = true
    }

    if (!isSlotsAccess)
      return

    if (property.type !== 'Identifier')
      return

    const replacement = SLOTS_PROPERTY_MAP.get(property.name)
    if (replacement !== undefined) {
      property.name = replacement
      hasChanges = true
    }
  })

  // Also handle $slots['xxx'] computed access with string literals
  root.find(j.MemberExpression, { computed: true }).forEach((path) => {
    const object = path.node.object
    const property = path.node.property

    let isSlotsAccess = false
    if (object.type === 'Identifier' && object.name === '$slots') {
      isSlotsAccess = true
    }
    else if (
      object.type === 'MemberExpression'
      && !object.computed
      && object.property.type === 'Identifier'
      && object.property.name === '$slots'
    ) {
      isSlotsAccess = true
    }

    if (!isSlotsAccess)
      return

    if (property.type !== 'StringLiteral')
      return

    const replacement = SLOTS_PROPERTY_MAP.get(property.value)
    if (replacement !== undefined) {
      property.value = replacement
      hasChanges = true
    }
  })

  if (!hasChanges)
    return null

  return root.toSource({ quote: 'single', trailingComma: true })
}

export { transformer }

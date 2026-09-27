/**
 * @dzup-ui/codemods
 *
 * Automated code transforms for migrating from old dzup-ui to vNext.
 *
 * @example
 * ```ts
 * import { CodemodRunner, renameImports } from '@dzup-ui/codemods'
 *
 * const runner = new CodemodRunner({ dryRun: true, verbose: true })
 * await runner.run(renameImports, './src')
 * ```
 *
 * @module
 */

// Runner
export { CodemodRunner } from './runner.js'
export type { RunnerOptions, RunResult, TransformFn } from './runner.js'

export { default as renameComponents } from './transforms/rename-components.js'
export { default as renameEvents } from './transforms/rename-events.js'
// Transforms
export { default as renameImports } from './transforms/rename-imports.js'
export { default as renameProps } from './transforms/rename-props.js'
export { default as renameSlots } from './transforms/rename-slots.js'
export {
  resolveClassList,
  resolveUtility,
  default as storyColorTokens,
  transformStoryColors,
} from './transforms/story-color-tokens.js'
export type {
  TransformStoryColorsResult,
  UnclassifiedLiteral,
} from './transforms/story-color-tokens.js'
// TASK-R1-O6 decision item 1 — prepared, NOT applied. See
// docs/program-2026-09-04/reports/icon-swap-contract-2026-09.md.
export {
  ALIASED_GLYPHS,
  CLASS_RENAMES,
  flaggedGlyphs,
  GLYPH_MAP,
  NEW_PACKAGE as NEW_ICON_PACKAGE,
  OLD_PACKAGE as OLD_ICON_PACKAGE,
  REDRAWN_GLYPHS,
  rewriteSpecifier as rewriteIconSpecifier,
  default as swapIconLibrary,
} from './transforms/swap-icon-library.js'

// Utilities
export { CodemodLogger } from './utils/logger.js'
export type { TransformStats } from './utils/logger.js'
export {
  extractScriptFromVue,
  isVueFile,
  replaceScriptInVue,
} from './utils/vue-sfc.js'
export {
  expandTemplateAttrs,
  extractTemplate,
  renameTemplateAttrs,
  renameTemplateAttrValues,
  renameTemplateComponents,
  renameTemplateEvents,
  renameTemplateSlots,
  replaceTemplate,
} from './utils/vue-template.js'
export type {
  TemplateSlotRenameRule,
} from './utils/vue-template.js'

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

export { default as renameEvents } from './transforms/rename-events.js'
// Transforms
export { default as renameImports } from './transforms/rename-imports.js'
export { default as renameProps } from './transforms/rename-props.js'

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
  renameTemplateEvents,
  replaceTemplate,
} from './utils/vue-template.js'

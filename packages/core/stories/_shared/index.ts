/**
 * Shared story utilities (TASK-0.4 / 0.13).
 *
 * Import canonical option arrays, layout primitives, decorators, and the status
 * taxonomy from this barrel rather than re-declaring them per story:
 *
 * ```ts
 * import { SIZES, TONES, darkModeDecorator, DemoRow, statusTag } from '../_shared'
 * ```
 */

export * from './decorators.ts'
export * from './DemoGrid.ts'
export * from './options.ts'
export * from './status.ts'

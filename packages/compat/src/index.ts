/**
 * @dzup-ui/compat
 * Migration adapters from old dzup-ui API to vNext.
 *
 * IMPORTANT: Stable core/pro must NOT import from compat (ADR-06).
 * This package provides backward-compatible wrappers for migration.
 *
 * @example
 * ```ts
 * // Before (old dzup-ui)
 * import { DzButton } from 'dzup-ui'
 * // <DzButton type="primary" size="small">Click</DzButton>
 *
 * // Migration step (use compat adapters)
 * import { DzButtonCompat as DzButton } from '@dzup-ui/compat'
 * // <DzButton type="primary" size="small">Click</DzButton>  -- still works
 *
 * // Final (migrate to vNext API)
 * import { DzButton } from '@dzup-ui/core'
 * // <DzButton variant="solid" tone="primary" size="sm">Click</DzButton>
 * ```
 */

export { default as DzAlertCompat } from './adapters/DzAlertCompat.vue'
// ── Compat Adapters ──
export { default as DzButtonCompat } from './adapters/DzButtonCompat.vue'
export { default as DzCheckboxCompat } from './adapters/DzCheckboxCompat.vue'
export { default as DzDialogCompat } from './adapters/DzDialogCompat.vue'
export { default as DzInputCompat } from './adapters/DzInputCompat.vue'
export { default as DzRadioCompat } from './adapters/DzRadioCompat.vue'
export { default as DzSelectCompat } from './adapters/DzSelectCompat.vue'
export { default as DzTabsCompat } from './adapters/DzTabsCompat.vue'

// ── Utilities ──
export { resetDeprecationWarnings, warnDeprecated } from './utils/deprecation.ts'

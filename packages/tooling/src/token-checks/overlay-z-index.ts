/**
 * Overlay stacking gate (UI-DZUP-UI-DESIGN-H-04, RF-02).
 *
 * `@dzup-ui/tokens` publishes one layer scale, `--dz-z-*` (dropdown 1000 …
 * toast 1080), and DESIGN.md names the components that occupy each layer
 * (`CURATED_LAYER_USAGE` in `packages/tokens/src/design-emit.ts`). Until this
 * gate the overlay families ignored it: dialogs, sheets, popovers, tooltips and
 * menus used `z-50`, the select family `z-[60]` and DzToast `z-[100]`, while
 * DzBlockUI and DzTour sat at 1040/1050 — so a toast raised over a full-screen
 * block, or a dialog opened from a tour step, painted underneath.
 *
 * Two checks:
 *
 *  1. {@link OVERLAY_LAYERS} — every overlay slot resolves to the layer named
 *     for it. Body-portaled surfaces anchored to a trigger (select family,
 *     menus, pickers, popover) sit on `popover` (1060), NOT on `dropdown`
 *     (1000): a select opened inside a dialog (`modal`, 1050) must paint above
 *     it. `dropdown` is for in-flow menus that are not portaled.
 *  2. {@link checkSource} — no `fixed` surface in a component carries a bare
 *     numeric z utility (`z-50`, `z-[60]`); it must name a `--dz-*` layer.
 *     {@link FIXED_NUMERIC_Z_DEBT} freezes the non-overlay chrome that still
 *     does, and the spec asserts it exactly, so it can only shrink.
 */

import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

/** One overlay slot and the layer variable its class list must reference. */
export interface OverlayLayerExpectation {
  /** Repository-relative source file. */
  file: string
  /** A fragment that identifies the slot's class string in that file. */
  anchor: string
  /** The `--dz-*` variable the slot's z utility must resolve through. */
  layer: string
}

const C = 'packages/core/src/components'
const POPOVER = '--dz-z-popover'

/**
 * The overlay slot table. Each `anchor` must occur exactly once in its file,
 * on the same class string as `z-[var(<layer>…`.
 */
export const OVERLAY_LAYERS: readonly OverlayLayerExpectation[] = [
  // Modal surfaces: backdrop below, focus-trapping panel above.
  { file: `${C}/overlays/DzDialog.variants.ts`, anchor: 'fixed inset-0', layer: '--dz-dialog-overlay-z-index' },
  { file: `${C}/overlays/DzDialog.variants.ts`, anchor: 'fixed left-1/2 top-1/2', layer: '--dz-dialog-z-index' },
  { file: `${C}/overlays/DzSheet.variants.ts`, anchor: 'fixed inset-0', layer: '--dz-dialog-overlay-z-index' },
  { file: `${C}/overlays/DzSheet.variants.ts`, anchor: '\'fixed z-', layer: '--dz-dialog-z-index' },
  { file: `${C}/overlays/DzCommandPalette.variants.ts`, anchor: 'fixed inset-0', layer: '--dz-z-modal-backdrop' },
  { file: `${C}/overlays/DzCommandPalette.variants.ts`, anchor: 'fixed left-1/2 top-[20%]', layer: '--dz-z-modal' },
  { file: `${C}/media/DzLightbox.variants.ts`, anchor: 'fixed inset-0', layer: '--dz-z-modal' },
  // Body-portaled surfaces anchored to a trigger.
  { file: `${C}/overlays/DzPopover.variants.ts`, anchor: 'z-[var(', layer: POPOVER },
  { file: `${C}/overlays/DzPopconfirm.variants.ts`, anchor: 'z-[var(', layer: POPOVER },
  { file: `${C}/overlays/DzDropdownMenu.variants.ts`, anchor: 'min-w-[8rem]', layer: POPOVER },
  { file: `${C}/overlays/DzContextMenu.variants.ts`, anchor: 'min-w-[8rem]', layer: POPOVER },
  { file: `${C}/forms/DzSelect.variants.ts`, anchor: 'overflow-hidden rounded-[var(--dz-radius-md)]', layer: POPOVER },
  { file: `${C}/forms/DzMultiSelect.variants.ts`, anchor: 'overflow-hidden rounded-[var(--dz-radius-md)]', layer: POPOVER },
  { file: `${C}/forms/DzCombobox.variants.ts`, anchor: 'overflow-hidden rounded-[var(--dz-radius-md)]', layer: POPOVER },
  { file: `${C}/forms/DzDatePicker.variants.ts`, anchor: 'overflow-hidden rounded-[var(--dz-radius-md)]', layer: POPOVER },
  { file: `${C}/forms/DzTreeSelect.variants.ts`, anchor: 'overflow-y-auto', layer: POPOVER },
  { file: `${C}/forms/DzColorPicker.vue`, anchor: 'w-64', layer: POPOVER },
  { file: `${C}/forms/DzTimePicker.vue`, anchor: `class="z-[var(${POPOVER}`, layer: POPOVER },
  { file: `${C}/forms/DzCascader.vue`, anchor: `class="z-[var(${POPOVER}`, layer: POPOVER },
  // In-flow (not portaled) dropdowns.
  { file: `${C}/forms/DzMention.variants.ts`, anchor: 'min-w-[12rem]', layer: '--dz-z-dropdown' },
  { file: `${C}/data/DzDataGridHeader.vue`, anchor: 'absolute top-full left-0', layer: '--dz-z-dropdown' },
  { file: `${C}/navigation/DzMegaMenu.variants.ts`, anchor: '\'absolute z-', layer: '--dz-z-dropdown' },
  // Labels and notifications.
  { file: `${C}/overlays/DzTooltip.variants.ts`, anchor: 'z-[var(', layer: '--dz-z-tooltip' },
  { file: `${C}/feedback/DzToast.variants.ts`, anchor: '\'fixed z-', layer: '--dz-z-toast' },
]

/**
 * `fixed` chrome that is not an overlay and still carries a numeric z. Frozen:
 * the spec asserts this list equals what the scan finds, so a fix must delete
 * its entry and a new site cannot be added silently.
 */
export const FIXED_NUMERIC_Z_DEBT: readonly string[] = [
  // Floating action cluster; its layer relative to DzFab (--dz-fab-z) is undecided.
  `${C}/buttons/DzSpeedDial.vue: z-40`,
  `${C}/buttons/DzSpeedDial.vue: z-40`,
  `${C}/buttons/DzSpeedDial.vue: z-40`,
  `${C}/buttons/DzSpeedDial.vue: z-40`,
  // Mobile drawer scrim; must stay below the drawer (--dz-sidebar-z-index = sticky 1020),
  // so it cannot simply move to --dz-sidebar-overlay-z-index (modal-backdrop 1040).
  `${C}/navigation/DzSidebar.variants.ts: z-30`,
]

/** A bare numeric z utility: `z-50`, `z-[60]`. Negative and arbitrary-var forms are not matched. */
const NUMERIC_Z = /(?<![\w-])z-(?:\d+|\[\d+\])(?![\w-])/g
/** One quoted or template string literal. */
const STRING_LITERAL = /'[^'\n]*'|"[^"\n]*"|`[^`]*`/g

export interface FixedNumericZViolation {
  file: string
  match: string
}

/** Numeric z utilities on string literals that also position the element `fixed`. */
export function checkSource(src: string, file: string): FixedNumericZViolation[] {
  const out: FixedNumericZViolation[] = []
  for (const literal of src.match(STRING_LITERAL) ?? []) {
    if (!/(?<![\w-])fixed(?![\w-])/.test(literal))
      continue
    for (const m of literal.match(NUMERIC_Z) ?? [])
      out.push({ file, match: m })
  }
  return out
}

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name)
    if (entry.isDirectory())
      walk(p, acc)
    else if (/\.(?:ts|vue)$/.test(entry.name) && !/\.spec\.ts$/.test(entry.name))
      acc.push(p)
  }
  return acc
}

/** Scan every component source under `packages/core/src/components`. */
export function scanComponents(repoRoot: string): FixedNumericZViolation[] {
  const root = join(repoRoot, C)
  return walk(root)
    .sort()
    .flatMap(p => checkSource(readFileSync(p, 'utf8'), relative(repoRoot, p)))
}

/** The class-string line of `anchor` in `src`, or a reason it cannot be identified. */
export function findAnchoredLine(src: string, anchor: string): { line?: string, error?: string } {
  const lines = src.split('\n').filter(l => l.includes(anchor))
  if (lines.length !== 1)
    return { error: `anchor ${JSON.stringify(anchor)} matched ${lines.length} lines (want exactly 1)` }
  return { line: lines[0] }
}

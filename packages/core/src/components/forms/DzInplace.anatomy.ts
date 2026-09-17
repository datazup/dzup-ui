import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzInplace — declared anatomy (TASK-R5-O2, ADR-19).
 *
 * A two-view component, and the declaration is what makes that legible: `root`
 * is always there, and exactly one of `trigger` (the display view a reader
 * clicks) and `content` (the editing region) is rendered at a time. Both are
 * `optional` for that reason — not because either is a nice-to-have, but
 * because "one or the other, never both" is a fact the anatomy can carry and a
 * part list cannot.
 *
 * `icon` is the pencil hint inside the display view; it is this component's own
 * inline SVG, not a consumer's.
 *
 * The built-in editor is a `DzInput`, which declares its own anatomy and emits
 * `data-part="root"` — so the boundary rule stops the check there and this
 * component promises nothing about the input's internals. When the consumer
 * fills the `#edit` slot instead, everything inside is theirs.
 */
export const anatomy = {
  parts: ['root', 'trigger', 'content', 'icon'],

  /**
   * `trigger` renders in the display view, `content` in the editing view, and
   * `icon` only while the trigger is enabled.
   */
  optionalParts: ['trigger', 'content', 'icon'],

  /**
   * `display` / `edit` is this component's own `data-state` — the pair that
   * names the two views — plus the presence-only `disabled`.
   */
  states: ['display', 'edit', 'disabled'],

  /** The properties the two views read; this component genuinely owns them. */
  componentTokens: [
    '--dz-inplace-gap',
    '--dz-inplace-padding-x',
    '--dz-inplace-padding-y',
    '--dz-inplace-radius',
    '--dz-inplace-ring',
    '--dz-inplace-hover-bg',
    '--dz-inplace-hint-color',
    '--dz-inplace-disabled-opacity',
  ],

  /** No recipe axis: `DzInplace.variants.ts` is slots without variants. */
  recipes: [],

  /**
   * Mirrors with the document — the hint icon sits after the text on the edge
   * the reader finishes at, which flips with the layout. `keyboard: 'none'`:
   * Enter activates and Escape cancels, and neither has an inline axis.
   */
  rtl: { mirrors: 'layout', keyboard: 'none', icons: ['icon'] },

  /**
   * Keyboard contract (TASK-R5-O5). An inline edit: Enter commits and
   * Escape cancels, both handled in `DzInplace.vue`. Escape restoring the
   * previous value is the undo path, not a close.
   */
  keyboard: [
    {
      key: 'Enter',
      action: 'Open the editor from the display state, or commit the edit from the editor.',
      wcag: ['2.1.1'],
    },
    { key: 'Escape', action: 'Cancel the edit and restore the previous value.', wcag: ['2.1.1', '2.1.2'] },
  ],

  /** Tier B — owns focus transfer between two views and a save/cancel contract. */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names. */
export type DzInplacePart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzInplace. */
export type DzInplaceUi = UiOverrides<typeof anatomy>

import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzChip — declared anatomy (TASK-R5-O2, ADR-19).
 *
 * Two nodes, and the second one is the point. `prefix` and `suffix` are slots
 * a consumer fills with their own markup, so they take `class` at the call site
 * and are not parts; the remove control is rendered by this component under
 * `closable` and has no call site at all.
 *
 * That control also carries a WCAG 2.2 SC 2.5.8 target-size treatment
 * (`dz-target-min-tight`, TASK-N1-O3) whose box is deliberately larger than
 * its glyph. Naming it is what lets a theme restyle the glyph without
 * overwriting the target.
 */
export const anatomy = {
  parts: ['root', 'close'],

  /** The remove control renders only under `closable`. */
  optionalParts: ['close'],

  /** `idle` / `disabled`, both already emitted; neither is new. */
  states: ['idle', 'disabled'],

  /**
   * Empty and measured: `DzChip.tokens.ts` maps to global semantic tokens and
   * owns no component property of its own.
   */
  componentTokens: [],

  recipes: ['size', 'variant', 'tone'],

  /**
   * Mirrors with the document — the content runs with the text and every
   * utility in `DzChip.variants.ts` is already logical. `keyboard: 'none'`:
   * the only key handling is Backspace/Delete on the remove control, which has
   * no inline axis.
   */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /**
   * Keyboard contract (TASK-R5-O5), corrected 2026-09-28 (RESIDUAL-12, closing
   * `D-RES11-2`).
   *
   * **What was removed and why.** This table used to open with
   * `{ key: 'Enter', action: 'Activate the chip.', apg: 'button' }` and the same
   * row for `' '`. `DzChip.vue` has never implemented either: `handleKeyDown`
   * tests only `Delete` and `Backspace`, the root carries **no** `@click`, and
   * the only events this component emits are `close`, `focus` and `blur`. So
   * there was no mouse activation for a key to mirror — nothing to satisfy WCAG
   * 2.1.1 *about* — and the two rows were a published accessibility claim with
   * nothing behind them. `DzTag`, whose root is attribute-for-attribute
   * identical (RESIDUAL-11 §3.2), carried the same two rows and lost them in the
   * same change.
   *
   * **The alternative, recorded rather than left implicit.** The other option was
   * to *implement* activation — give the root a click handler and an `activate`
   * event. Rejected: it is a new behaviour on a published component, it needs a
   * reason to exist that no consumer has asked for, and `role="button"` on this
   * root was already considered and rejected on this same evidence
   * (RESIDUAL-11 §3.2, and the `NO ROLE ON THE ROOT` note in `DzChip.vue`).
   * A chip is a label, not a control; its one control is the remove button.
   *
   * `when: 'removable'` is now `when: 'closable'` — the prop is `closable`, and a
   * context column that names a prop the component does not have is a scope a
   * reader cannot check.
   */
  keyboard: [
    { key: 'Backspace', when: 'closable', action: 'Remove the chip.', wcag: ['2.1.1'] },
    { key: 'Delete', when: 'closable', action: 'Remove the chip.', wcag: ['2.1.1'] },
  ],

  /** Tier B — a closable chip owns focus and keyboard removal. */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names. */
export type DzChipPart = AnatomyPart<typeof anatomy>

/**
 * `ui` prop shape for DzChip — the surface and the remove control.
 *
 * `class` keeps its existing target on the root; `ui.close` is the only route
 * to the button this component renders for you.
 */
export type DzChipUi = UiOverrides<typeof anatomy>

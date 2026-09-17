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
   * Keyboard contract (TASK-R5-O5). APG `button` for activation, plus the
   * removal keys this component handles itself — both are in
   * `DzChip.vue`, on the chip root, and only while `removable`.
   */
  keyboard: [
    { key: 'Enter', action: 'Activate the chip.', wcag: ['2.1.1'], apg: 'button' },
    { key: ' ', action: 'Activate the chip.', wcag: ['2.1.1'], apg: 'button' },
    { key: 'Backspace', when: 'removable', action: 'Remove the chip.', wcag: ['2.1.1'] },
    { key: 'Delete', when: 'removable', action: 'Remove the chip.', wcag: ['2.1.1'] },
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

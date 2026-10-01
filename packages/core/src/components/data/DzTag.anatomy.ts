import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzTag — declared anatomy (TASK-R5-O2, ADR-19).
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
   * Empty and measured: `DzTag.tokens.ts` maps to global semantic tokens and
   * owns no component property of its own.
   */
  componentTokens: [],

  recipes: ['size', 'variant', 'tone'],

  /**
   * Mirrors with the document — the content runs with the text and every
   * utility in `DzTag.variants.ts` is already logical. `keyboard: 'none'`:
   * the only key handling is Backspace/Delete on the remove control, which has
   * no inline axis.
   */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /**
   * Keyboard contract (TASK-R5-O5), corrected 2026-09-28 (RESIDUAL-12, closing
   * `D-RES11-2`).
   *
   * The Enter and `' '` rows, both `apg: 'button'` and both reading *"Activate
   * the tag."*, were removed: `DzTag.vue`'s `handleKeyDown` tests only `Delete`
   * and `Backspace`, the root carries no `@click`, and the component emits only
   * `close`, `focus` and `blur`. There is no mouse activation for a key to
   * mirror, so the rows promised an interaction that does not exist.
   *
   * This is not an incidental twin of the `DzChip` correction — it is the same
   * correction. RESIDUAL-11 §3.2 established that these two roots are
   * attribute-for-attribute identical, and a test in `DzChip.spec.ts` compares
   * them so they cannot diverge again. Fixing one and not the other would have
   * re-created exactly the divergence that test exists to prevent.
   *
   * `when: 'removable'` is now `when: 'closable'`, after the prop.
   */
  keyboard: [
    { key: 'Backspace', when: 'closable', action: 'Remove the tag.', wcag: ['2.1.1'] },
    { key: 'Delete', when: 'closable', action: 'Remove the tag.', wcag: ['2.1.1'] },
  ],

  /** Tier B — a closable tag owns focus and keyboard removal. */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names. */
export type DzTagPart = AnatomyPart<typeof anatomy>

/**
 * `ui` prop shape for DzTag — the surface and the remove control.
 *
 * `class` keeps its existing target on the root; `ui.close` is the only route
 * to the button this component renders for you.
 */
export type DzTagUi = UiOverrides<typeof anatomy>

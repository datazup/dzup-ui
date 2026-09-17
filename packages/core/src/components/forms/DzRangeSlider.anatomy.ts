import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzRangeSlider — declared anatomy (TASK-R5-O2, ADR-19).
 *
 * The same five nodes as `DzSlider`, with one difference that has to be
 * declared rather than inferred: there are **two** thumbs, so `indicator`
 * repeats and belongs in `optionalParts` — that is the field ADR-19 uses to
 * turn "sometimes many" into a declared fact.
 *
 * Same vocabulary gap as `DzSlider`: the groove and the fill would need `track`
 * and `range`, and neither is in `ANATOMY_PART_VOCABULARY`, so both ship
 * unaddressable and are recorded rather than invented.
 *
 * **`class` reaches `control`, not `root`** — same existing target, documented
 * rather than moved.
 */
export const anatomy = {
  parts: ['root', 'control', 'indicator', 'label', 'error'],

  /**
   * `indicator` is here because it appears **twice**, not because it is
   * conditional: a range always has a minimum and a maximum thumb.
   */
  optionalParts: ['indicator', 'label', 'error'],

  /** As `DzSlider`: its own `data-state` plus the presence-only attributes. */
  states: ['idle', 'disabled', 'required', 'invalid'],

  /** Empty and measured — the tokens file maps to global control and tone tokens. */
  componentTokens: [],

  recipes: ['size', 'tone', 'orientation'],

  /** As `DzSlider`: the primitive swaps the horizontal arrows under `dir="rtl"`. */
  rtl: { mirrors: 'layout', keyboard: 'swap-horizontal', icons: ['indicator'] },

  /**
   * Keyboard contract (TASK-R5-O5). APG `slider` per thumb, plus Tab to
   * move between the two thumbs.
   */
  keyboard: [
    {
      key: 'ArrowRight',
      action: 'Increase the focused thumb by one step.',
      wcag: ['2.1.1'],
      apg: 'slider',
      rtl: 'mirrored',
    },
    {
      key: 'ArrowLeft',
      action: 'Decrease the focused thumb by one step.',
      wcag: ['2.1.1'],
      apg: 'slider',
      rtl: 'mirrored',
    },
    { key: 'ArrowUp', action: 'Increase the focused thumb by one step.', wcag: ['2.1.1'], apg: 'slider' },
    { key: 'ArrowDown', action: 'Decrease the focused thumb by one step.', wcag: ['2.1.1'], apg: 'slider' },
    {
      key: 'PageUp',
      action: 'Increase the focused thumb by the large step.',
      wcag: ['2.1.1'],
      apg: 'slider',
    },
    {
      key: 'PageDown',
      action: 'Decrease the focused thumb by the large step.',
      wcag: ['2.1.1'],
      apg: 'slider',
    },
    { key: 'Home', action: 'Set the focused thumb to its minimum.', wcag: ['2.1.1'], apg: 'slider' },
    { key: 'End', action: 'Set the focused thumb to its maximum.', wcag: ['2.1.1'], apg: 'slider' },
    {
      key: 'Tab',
      action: 'Move to the other thumb; each thumb is its own tab stop.',
      wcag: ['2.1.2'],
      apg: 'slider-multithumb',
    },
  ],

  /** `class` reaches `control`, not the outermost node — see DzSlider (D24). */
  fallthrough: {
    target: 'control',
    reason:
      'D24: `$attrs` binds to SliderRoot (`control`), not the labelled wrapper. '
      + 'Identical shape to DzSlider.',
  },

  /** Tier B — owns focus across two thumbs and a two-value form contract. */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names. */
export type DzRangeSliderPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzRangeSlider. */
export type DzRangeSliderUi = UiOverrides<typeof anatomy>

import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzSlider — declared anatomy (TASK-R5-O2, ADR-19).
 *
 * `root` is the wrapper this component renders, `control` is Reka's
 * `SliderRoot` (the element that owns the value, the orientation and the
 * keyboard contract), `indicator` is the thumb, `label` is the optional text
 * column and `error` is the `role="alert"` line under it.
 *
 * `indicator` for the thumb is the **same mapping `DzSwitch` uses**: the moving
 * mark that shows where the value sits. Keeping the two consistent is worth
 * more than a slider-specific word.
 *
 * **`class` reaches `control`, not `root`.** The wrapper is a bare positioning
 * element and every class this component has ever accepted has landed on
 * `SliderRoot`; this declaration documents that rather than moving it, because
 * moving it would change every existing consumer's layout. `ui.root` is the
 * route to the wrapper.
 *
 * Left unaddressable, and recorded as a vocabulary request rather than invented
 * here (ADR-19 §3 — a name outside the vocabulary stops the node, not the
 * component): the `SliderTrack` groove and the `SliderRange` fill would need
 * `track` and `range`. Both are reachable today through `ui.control` and a
 * descendant selector; neither has a word.
 */
export const anatomy = {
  parts: ['root', 'control', 'indicator', 'label', 'error'],

  /**
   * The label renders only with a default slot and the error line only with an
   * `error` prop. The thumb is **not** optional here — a single-value slider
   * always has exactly one.
   */
  optionalParts: ['label', 'error'],

  /**
   * `idle` / `disabled` are this component's own `data-state`; `disabled`,
   * `required` and `invalid` are the presence-only attributes on the control.
   */
  states: ['idle', 'disabled', 'required', 'invalid'],

  /**
   * Empty and measured: `DzSlider.tokens.ts` maps to global control and tone
   * tokens (`--dz-control-focus-ring-*`, `--dz-primary`, `--dz-danger`) and
   * owns no `--dz-slider-*` property.
   */
  componentTokens: [],

  recipes: ['size', 'tone', 'orientation'],

  /**
   * Mirrors with the document — a horizontal slider's minimum sits at the edge
   * the reader starts from, which is what Reka's own `dir` handling does.
   * `swap-horizontal`: ArrowLeft decreases in LTR and increases in RTL, and
   * that swap is the primitive's, not this component's, so declaring it is how
   * the fact gets written down.
   */
  rtl: { mirrors: 'layout', keyboard: 'swap-horizontal', icons: ['indicator'] },

  /**
   * Keyboard contract (TASK-R5-O5). Reka `SliderRoot` over APG `slider`;
   * the horizontal arrows follow the writing direction.
   */
  keyboard: [
    {
      key: 'ArrowRight',
      action: 'Increase the value by one step.',
      wcag: ['2.1.1'],
      apg: 'slider',
      rtl: 'mirrored',
    },
    {
      key: 'ArrowLeft',
      action: 'Decrease the value by one step.',
      wcag: ['2.1.1'],
      apg: 'slider',
      rtl: 'mirrored',
    },
    { key: 'ArrowUp', action: 'Increase the value by one step.', wcag: ['2.1.1'], apg: 'slider' },
    { key: 'ArrowDown', action: 'Decrease the value by one step.', wcag: ['2.1.1'], apg: 'slider' },
    { key: 'PageUp', action: 'Increase the value by the large step.', wcag: ['2.1.1'], apg: 'slider' },
    { key: 'PageDown', action: 'Decrease the value by the large step.', wcag: ['2.1.1'], apg: 'slider' },
    { key: 'Home', action: 'Set the value to its minimum.', wcag: ['2.1.1'], apg: 'slider' },
    { key: 'End', action: 'Set the value to its maximum.', wcag: ['2.1.1'], apg: 'slider' },
  ],

  /**
   * `class` reaches `control`, not the outermost node (owner decision D24).
   *
   * The component renders a label row and the slider, and `$attrs` binds to
   * Reka's `SliderRoot` — declared here as `control`. Declared rather than
   * changed: re-pointing it at the wrapper would re-flow every existing
   * consumer's layout to buy a consistency nobody asked for.
   */
  fallthrough: {
    target: 'control',
    reason:
      'D24: `$attrs` binds to SliderRoot (`control`), not the labelled wrapper. '
      + 'The slider is the interactive element a consumer is addressing.',
  },

  /** Tier B — owns focus, a keyboard value contract and a form value. */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names. */
export type DzSliderPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzSlider. */
export type DzSliderUi = UiOverrides<typeof anatomy>

import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzKnob — declared anatomy (TASK-R5-O2, ADR-19).
 *
 * `root` is the `role="slider"` box that owns focus and the value, `control` is
 * the `<svg>` that owns the pointer contract, `indicator` is the value arc,
 * `label` is the readout, and `error` is the `role="alert"` line.
 *
 * **The error line is a sibling of the root, not a descendant.** This component
 * has a fragment root — `<div>` then `<p v-if="error">` — which predates this
 * declaration. It is documented here rather than restructured: moving the
 * paragraph inside the box would change the layout of every consumer who has
 * spaced around it. A conformance check therefore reads the root subtree and
 * `error` stays `optional`, which is true of it in both senses.
 *
 * Left unaddressable, with the reason: the **range arc** would need `track`
 * (the same word `DzSlider` wants and the vocabulary does not have); the
 * `type="hidden"` input exists only so the knob posts with a native form, and a
 * part name invites styling a node that has no box.
 */
export const anatomy = {
  parts: ['root', 'control', 'indicator', 'label', 'error'],

  /**
   * The value arc is drawn only above zero, the readout only under `showValue`,
   * and the error line only with an `error` prop.
   */
  optionalParts: ['indicator', 'label', 'error'],

  /**
   * All five are presence-only attributes on the root; this component emits no
   * `data-state` value of its own, which is itself worth declaring — a theme
   * author reading this knows to select on the boolean attributes.
   */
  states: ['disabled', 'required', 'readonly', 'loading', 'invalid'],

  /**
   * The two properties the arcs read. Unlike most of this family, `DzKnob`
   * genuinely owns component tokens: the arc colours are set per instance.
   */
  componentTokens: ['--dz-knob-range', '--dz-knob-value'],

  recipes: ['size', 'tone'],

  /**
   * `mirrors: 'none'` deliberately, and this is the one component in the family
   * where that is the right answer: a knob's sweep is a **rotation**, and a
   * rotation has no reading direction to follow. Mirroring it would put the
   * minimum where the maximum was for no reason a reader could name.
   * `swap-horizontal` for the keyboard, because ArrowLeft/ArrowRight do change
   * the value and those two do swap.
   */
  rtl: { mirrors: 'none', keyboard: 'swap-horizontal' },

  /**
   * Keyboard contract (TASK-R5-O5). APG `slider` semantics on a radial
   * control; every row is handled in `DzKnob.vue`.
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
   * Multi-root: the `role="slider"` gauge and, under an `error` prop, a sibling
   * `<p>` message. Vue cannot pick a fallthrough target for a fragment, so this
   * component sets `inheritAttrs: false` and binds `$attrs` to the gauge.
   *
   * The gauge is the right target because it is the element a consumer means:
   * it carries the ARIA value semantics, it is the focus target, and an `id`
   * placed on it is what their `<label for>` needs to point at.
   */
  fallthrough: {
    target: 'root',
    reason:
      'Multi-root (gauge + optional error line). `$attrs` binds to the gauge, '
      + 'which is the focusable, ARIA-carrying node a consumer means.',
  },

  /** Tier B — owns focus, a pointer-drag value contract and form participation. */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names. */
export type DzKnobPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzKnob. */
export type DzKnobUi = UiOverrides<typeof anatomy>

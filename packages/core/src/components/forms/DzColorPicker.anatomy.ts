import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzColorPicker — declared anatomy (TASK-R5-O2, ADR-19).
 *
 * `root` is the wrapper, `trigger` is the button that opens the panel,
 * `indicator` is the colour swatch, `label` is the hex readout beside it,
 * `content` is Reka's `PopoverContent`, `panel` is the padded column inside it,
 * `input` is a colour or hex field, `group` is the preset grid, `item` is one
 * preset, and `error` is the `role="alert"` line.
 *
 * `indicator`, `input` and `item` all repeat — the swatch appears on the
 * trigger and again beside the hex field, there is a native colour input and a
 * text input, and the presets are a grid — so all three are `optional`, which
 * is how ADR-19 records "sometimes many".
 *
 * `content` and everything under it render into a **portal**, so a conformance
 * check on the mounted wrapper sees only the trigger side; the open-state check
 * reads `document.body`. Same shape as the `DzSelect` pilot.
 *
 * The `PopoverTrigger` is `as-child` over a `<button>` **this component
 * renders**, so stamping `trigger` on it is not the as-child mistake (S1-D2):
 * the element is ours.
 *
 * Left unaddressable, with the reason: the `type="hidden"` input that makes the
 * picker post with a native form has no box, and the fixed-height wrapper
 * around the colour canvas is a sizing element `ui.input` already reaches.
 */
export const anatomy = {
  parts: [
    'root',
    'trigger',
    'indicator',
    'label',
    'content',
    'panel',
    'input',
    'group',
    'item',
    'error',
  ],

  /**
   * Everything but the root and the trigger is conditional or repeating: the
   * panel exists only while open, the hex row only under `showInput`, the
   * preset grid only when presets are supplied, and the error line only with an
   * `error` prop.
   */
  optionalParts: [
    'indicator',
    'label',
    'content',
    'panel',
    'input',
    'group',
    'item',
    'error',
  ],

  /**
   * `disabled` is this component's own `data-state` and also a presence-only
   * attribute; `required` is presence-only; `open` / `closed` come from Reka on
   * the trigger and the content, and a component that re-exports a primitive's
   * state still owns the promise.
   */
  states: ['disabled', 'required', 'open', 'closed'],

  /**
   * Empty and measured: `DzColorPicker.tokens.ts` maps to global input and
   * semantic tokens and owns no `--dz-color-picker-*` property.
   */
  componentTokens: [],

  recipes: ['size'],

  /**
   * Mirrors with the document — swatch then value runs with the text and the
   * popper is placed by Reka's `dir`-aware positioning. `keyboard: 'none'`: the
   * preset grid is a tab list, not a roving inline axis.
   */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /**
   * Keyboard contract (TASK-R5-O5). A colour area and its sliders. The
   * saturation and value area is a two-dimensional slider, and the arrows
   * move the pointer inside it.
   */
  keyboard: [
    {
      key: 'ArrowRight',
      action: 'Move the colour pointer one step along the saturation axis.',
      wcag: ['2.1.1'],
      apg: 'slider',
      rtl: 'fixed',
    },
    {
      key: 'ArrowLeft',
      action: 'Move the colour pointer one step back along the saturation axis.',
      wcag: ['2.1.1'],
      apg: 'slider',
      rtl: 'fixed',
    },
    {
      key: 'ArrowUp',
      action: 'Move the colour pointer one step up the value axis.',
      wcag: ['2.1.1'],
      apg: 'slider',
    },
    {
      key: 'ArrowDown',
      action: 'Move the colour pointer one step down the value axis.',
      wcag: ['2.1.1'],
      apg: 'slider',
    },
    {
      key: 'Home',
      action: 'Move the colour pointer to the start of the axis.',
      wcag: ['2.1.1'],
      apg: 'slider',
    },
    { key: 'End', action: 'Move the colour pointer to the end of the axis.', wcag: ['2.1.1'], apg: 'slider' },
  ],

  /** Tier C — a popover-backed, portal-rendering, form-bearing composite. */
  riskTier: 'C',
} as const satisfies ComponentAnatomy

/** Addressable node names. */
export type DzColorPickerPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzColorPicker. */
export type DzColorPickerUi = UiOverrides<typeof anatomy>

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
   * Keyboard contract — **rewritten in RESIDUAL-13** (RESIDUAL-12 §4 `F2`).
   *
   * ## What was here, and why it was withdrawn rather than implemented
   *
   * Until this change the table declared six APG `slider` rows —
   * ArrowRight/ArrowLeft *"along the saturation axis"*, ArrowUp/ArrowDown *"up
   * the value axis"*, Home/End *"to the start / end of the axis"* — and
   * RESIDUAL-12 measured all six as backed by nothing. Reading
   * `DzColorPicker.vue` is what settled the direction: **there is no colour
   * pointer, no saturation axis and no value axis.** The panel is a native
   * `<input type="color">` sized by `canvasHeight`, a hex text field, and a grid
   * of preset `<button>`s. The rows do not describe an unimplemented behaviour of
   * this component; they describe a *different* component.
   *
   * This is the `DzChip`/`DzTag` disposition and not the `DzListItem` one, and the
   * difference is measurable rather than aesthetic. `DzListItem` had a pointer
   * action with no key, so the gap was an **SC 2.1.1 failure** and deleting the
   * rows would have hidden it. Here there is no failure to hide: a keyboard user
   * can set any colour today — Tab to the hex field and type `#ff0000`, or open
   * the native colour input, which the platform operates fully with the keyboard
   * and exposes to assistive technology. What was false was the *description* of
   * how, not the existence of a way.
   *
   * **Rejected: build a real two-dimensional HSV slider.** It is the change that
   * would have made the old rows true, and it is a redesign of a published
   * panel — a saturation/value canvas with a draggable thumb, a hue slider, HSV
   * conversion, new parts and new tokens — replacing the one element in the panel
   * that is *already* fully keyboard- and AT-operable with a custom one that would
   * have to earn that back. It also repaints the component, and visual capture is
   * owner-gated on linux while this machine is win32, so nothing here could
   * qualify it. Raised as `D-RES13-1` instead of half-done.
   *
   * ## What is declared now
   *
   * The six rows the panel actually has, each scoped to the node it is about so
   * `validate:anatomy-keyboard` resolves it against that node rather than against
   * whatever else the family renders. Every one is backed by the platform or by
   * Reka's popover, which is the honest answer for a control that composes both.
   */
  keyboard: [
    {
      key: 'Enter',
      when: 'trigger',
      action: 'Open the colour panel.',
      wcag: ['2.1.1'],
      apg: 'button',
    },
    {
      key: ' ',
      when: 'trigger',
      action: 'Open the colour panel.',
      wcag: ['2.1.1'],
      apg: 'button',
    },
    {
      key: 'Escape',
      action: 'Close the colour panel without changing the value.',
      wcag: ['2.1.1', '2.1.2'],
      apg: 'dialog',
    },
    {
      key: 'Tab',
      action: 'Move through the panel: the colour field, the hex field, then the presets.',
      wcag: ['2.1.2'],
      apg: 'dialog',
    },
    {
      key: 'Enter',
      when: 'item',
      action: 'Select the focused preset colour.',
      wcag: ['2.1.1'],
      apg: 'button',
    },
    {
      key: '<character>',
      when: 'input',
      action: 'Type a hex value into the colour field.',
      wcag: ['2.1.1'],
    },
  ],

  /** Tier C — a popover-backed, portal-rendering, form-bearing composite. */
  riskTier: 'C',
} as const satisfies ComponentAnatomy

/** Addressable node names. */
export type DzColorPickerPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzColorPicker. */
export type DzColorPickerUi = UiOverrides<typeof anatomy>

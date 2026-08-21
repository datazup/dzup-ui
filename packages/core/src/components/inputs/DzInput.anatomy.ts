import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzInput — declared anatomy (TASK-OSS-P3-03, ADR-19).
 *
 * The form-control pilot. Where DzButton has two nodes, this has eight, and
 * they are the reason a per-part override prop exists at all: a consumer who
 * wants a wider clear button or a differently-placed error message has, until
 * now, had no sanctioned way to reach either.
 *
 * `control` rather than `wrapper`: the node is the visual field — border,
 * background, focus ring — and `input` beside it is the native element that
 * actually holds the value. Naming the outer node after its implementation
 * ("wrapper") would say nothing about which one a consumer wants.
 *
 * The `prefix`/`suffix` parts ARE declared here, unlike on DzButton, because
 * this component renders a `<span>` of its own around the slot content rather
 * than emitting the consumer's nodes bare.
 */
export const anatomy = {
  parts: ['root', 'control', 'input', 'prefix', 'suffix', 'spinner', 'clear', 'error'],

  /**
   * All but `root`, `control` and `input` are conditional: the affixes need a
   * slot, the spinner needs `loading`, `clear` needs `clearable` plus a value,
   * and `error` needs an error string.
   */
  optionalParts: ['prefix', 'suffix', 'spinner', 'clear', 'error'],

  /**
   * Note what is NOT here: `invalid`. The component sets `aria-invalid` and
   * styles through the recipe, but emits no `data-invalid`, so declaring it
   * would be a promise the DOM does not keep — `expectAnatomy` reads the
   * rendered output, not the intent.
   */
  states: ['disabled', 'loading', 'readonly'],

  /**
   * Every `--dz-input-*` this component reads. Complete rather than
   * representative: `validate:ownership` compares this list against the tokens
   * the source actually references, and reported seventeen missing ones the
   * first time it ran — the size scale a consumer needs in order to change one
   * field's height without moving every control in the theme.
   */
  componentTokens: [
    '--dz-input-bg',
    '--dz-input-border',
    '--dz-input-border-focus',
    '--dz-input-disabled-opacity',
    '--dz-input-focus-ring-color',
    '--dz-input-focus-ring-width',
    '--dz-input-font-family',
    '--dz-input-lg-font-size',
    '--dz-input-lg-height',
    '--dz-input-lg-padding-x',
    '--dz-input-md-font-size',
    '--dz-input-md-height',
    '--dz-input-md-padding-x',
    '--dz-input-placeholder',
    '--dz-input-radius',
    '--dz-input-sm-font-size',
    '--dz-input-sm-height',
    '--dz-input-sm-padding-x',
    '--dz-input-transition',
    '--dz-input-xl-font-size',
    '--dz-input-xl-height',
    '--dz-input-xl-padding-x',
    '--dz-input-xs-font-size',
    '--dz-input-xs-height',
    '--dz-input-xs-padding-x',
  ],

  recipes: ['variant', 'size', 'tone'],

  /**
   * Mirrors with the document. The clear affix moves to the inline end and the
   * text aligns to the inline start, which is what `dir` on an ancestor already
   * does for the `<input>` itself.
   *
   * The **value** is not mirrored and must not be: an input holding a URL or an
   * account number in an Arabic form still reads left-to-right, and that is the
   * browser's bidi algorithm doing its job rather than something to override.
   */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /**
   * Tier A: it holds user input, carries `aria-invalid`/`aria-describedby`
   * wiring, and inherits size and validation state from `DzInputGroup` and
   * `DzFormField`. A defect is a data or accessibility failure.
   */
  riskTier: 'A',
} as const satisfies ComponentAnatomy

/** Addressable node names, for typing per-instance overrides. */
export type DzInputPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzInput. */
export type DzInputUi = UiOverrides<typeof anatomy>

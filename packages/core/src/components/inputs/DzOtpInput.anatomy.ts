import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzOtpInput — declared anatomy (TASK-N2-S1, ADR-19).
 *
 * A Reka-backed component, and so it tests the same boundary rule `DzSelect`
 * does: **a node that exists only because Reka renders it is not addressable.**
 *
 * `control` is `<PinInputRoot>` and `input` is `<PinInputInput>` — both are
 * elements *this* template writes and already passes classes to, which is what
 * makes them this library's to promise. Reka's hidden aggregate field and its
 * internal collection markers are deliberately absent.
 *
 * `input` repeats once per digit, which is why it is optional: "sometimes many"
 * has to be declared rather than inferred.
 */
export const anatomy = {
  parts: ['root', 'control', 'input', 'error'],

  /** `input` repeats once per digit; `error` renders only when there is one. */
  optionalParts: ['input', 'error'],

  states: ['disabled', 'required'],

  /**
   * Empty and measured: no `--dz-otp-input-*` property is referenced. The cell
   * geometry comes from the size recipe and the global radius/spacing scales.
   */
  componentTokens: [],

  recipes: ['size'],

  /**
   * The digit cells sit on the inline axis and flip with the document.
   * `keyboard: 'none'`: Reka's pin input moves focus with ArrowLeft/ArrowRight
   * along the *visual* row, so it already follows the mirrored layout and does
   * not need the meanings swapped on top.
   */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /** Tier B — owns focus across several cells, a value, and a paste contract. */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names, for typing per-instance overrides. */
export type DzOtpInputPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzOtpInput. */
export type DzOtpInputUi = UiOverrides<typeof anatomy>

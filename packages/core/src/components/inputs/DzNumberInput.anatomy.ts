import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzNumberInput — declared anatomy (TASK-N2-S1, ADR-19).
 *
 * `decrement` and `increment` are outside the ADR-19 shared vocabulary and are
 * meant to be. The vocabulary offers `action`, `control` and `trigger`, and all
 * three would name *both* buttons the same thing — which is precisely the case
 * where §3 says a component may name a node the vocabulary has no word for, and
 * where `validate:anatomy-parts` reports the extension so the vocabulary can
 * grow deliberately rather than by accident. A stepper's two buttons are not
 * interchangeable, and a consumer restyling only the one that reaches `min`
 * needs to be able to say which.
 *
 * They are also the reason the parts are worth declaring at all: both buttons
 * are `aria-disabled` rather than natively `disabled` (the native attribute
 * would trip the wrapper's `:has(:disabled)` rule and grey out the whole
 * field), so *the only* way a consumer can style "cannot decrement further" is
 * to select the button — which needs the button to have a name.
 */
export const anatomy = {
  parts: ['root', 'control', 'input', 'prefix', 'decrement', 'increment', 'error'],

  /** `prefix` renders only when its slot is filled; `error` only when there is one. */
  optionalParts: ['prefix', 'error'],

  states: ['disabled', 'readonly', 'loading', 'required'],

  /**
   * Empty and measured: no `--dz-number-input-*` property exists in this
   * component's files. The field is `DzInput`'s wrapper recipe, so the override
   * points are `DzInput`'s.
   */
  componentTokens: [],

  recipes: ['variant', 'size', 'tone'],

  /**
   * The stepper buttons flank the field on the inline axis and flip with the
   * document. `keyboard: 'none'` — ArrowUp/ArrowDown drive the value, and those
   * do not swap in RTL.
   */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /** Tier B — focus, a value, a `spinbutton` role and a keyboard contract. */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names, for typing per-instance overrides. */
export type DzNumberInputPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzNumberInput. */
export type DzNumberInputUi = UiOverrides<typeof anatomy>

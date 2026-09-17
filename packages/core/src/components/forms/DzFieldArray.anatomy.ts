import type { ComponentAnatomy } from '@dzup-ui/contracts'

/**
 * DzFieldArray — declared anatomy (TASK-R5-O2, ADR-19).
 *
 * `parts: 'none'`, and that is a **promise rather than an omission** — the same
 * declaration `DzProvider` and `DzThemeProvider` carry. This component renders
 * a `<template v-for>` over the model and nothing else: every element in its
 * output belongs to the consumer's slot content, so there is no node this
 * library may name, and no `ui` prop, because a per-part class map would have
 * no part to key on.
 *
 * Declaring it is what makes "renderless" checkable: if a future change adds a
 * wrapper element, `expectAnatomy` reports it as an undeclared part instead of
 * the wrapper quietly becoming part of everyone's layout.
 */
export const anatomy = {
  parts: 'none',

  /** No parts, so nothing to mark conditional. */
  optionalParts: [],

  /** No `data-state` and no presence-only attribute: it has no element to put one on. */
  states: [],

  /** No element, no tokens. */
  componentTokens: [],

  /** No recipe: there is nothing to style. */
  recipes: [],

  /**
   * `mirrors: 'none'` — it renders no box, so there is no direction to mirror.
   * The slot content's own components carry their own rtl axis.
   */
  rtl: { mirrors: 'none', keyboard: 'none' },

  /**
   * Keyboard contract (TASK-R5-O5). The array itself takes no keyboard;
   * the add and remove controls are buttons.
   */
  keyboard: [
    {
      key: 'Enter',
      when: 'action',
      action: 'Activate the focused add or remove control.',
      wcag: ['2.1.1'],
      apg: 'button',
    },
    {
      key: ' ',
      when: 'action',
      action: 'Activate the focused add or remove control.',
      wcag: ['2.1.1'],
      apg: 'button',
    },
  ],

  /**
   * Renderless: two `<slot>` roots and no element of this component's own, so
   * there is nowhere for `$attrs` to land and the component binds it nowhere.
   *
   * `'none'` is the same promise `parts: 'none'` makes, for the other half of
   * the surface. It is not "we did not check": a consumer passing `class` to
   * this component gets nothing, which they should learn from the contract
   * rather than from an empty DOM.
   */
  fallthrough: {
    target: 'none',
    reason:
      'A `<template v-for>` over the model plus an append slot. Every element in '
      + 'the output belongs to the consumer, so there is no node this library may '
      + 'put their attributes on.',
  },

  /**
   * Tier B — it owns array mutation, index-stable ids and the append/remove
   * contract the form renderer depends on, which is risk even without a box.
   */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

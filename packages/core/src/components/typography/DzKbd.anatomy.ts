import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzKbd — declared anatomy (TASK-N2-S1, ADR-19).
 *
 * The outer `<kbd>` is `root`; each rendered key is an `item`; the glyph
 * between two keys is a `separator`. Both repeat, so both are optional.
 *
 * `item` and `separator` are shared-vocabulary names and they fit: a key
 * combination is a list of keys with separators between them, and calling the
 * individual key `key` would have invented a synonym for a word the vocabulary
 * already has.
 */
export const anatomy = {
  parts: ['root', 'item', 'separator'],

  /** Both repeat once per key: "sometimes many" has to be declared. */
  optionalParts: ['item', 'separator'],
  states: [],

  /** Real component tokens: the key cap is a themable surface in its own right. */
  componentTokens: [
    '--dz-kbd-bg',
    '--dz-kbd-border',
    '--dz-kbd-fg',
    '--dz-kbd-font-size',
    '--dz-kbd-gap',
    '--dz-kbd-min-size',
    '--dz-kbd-padding-x',
    '--dz-kbd-radius',
    '--dz-kbd-shadow',
  ],
  recipes: ['size'],

  /** The key sequence runs along the inline axis and flips with the document. */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /** Tier A — presentational. It takes no focus and holds no value. */
  riskTier: 'A',
} as const satisfies ComponentAnatomy

/** Addressable node names, for typing per-instance overrides. */
export type DzKbdPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzKbd. */
export type DzKbdUi = UiOverrides<typeof anatomy>

import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzToggleButton — declared anatomy (TASK-N2-S1, ADR-19).
 *
 * `parts: ['root']`. The three slots (`prefix`, default, `suffix`) render their
 * content directly into the button with no wrapper element, so there is no node
 * to name — and inventing wrappers so that the anatomy could be longer would be
 * adding DOM to satisfy a document.
 *
 * `pressed` is declared as a `data-state` value because the template emits it,
 * and it is the state a consumer most wants: `aria-pressed` carries the meaning
 * for assistive technology, `data-state="pressed"` carries it for CSS.
 */
export const anatomy = {
  parts: ['root'],
  states: ['idle', 'pressed', 'disabled'],

  /** Empty and measured: no `--dz-toggle-button-*` property is referenced. */
  componentTokens: [],
  recipes: ['variant', 'size', 'tone'],
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /** Tier B — owns focus, keyboard activation and a boolean value. */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names, for typing per-instance overrides. */
export type DzToggleButtonPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzToggleButton. */
export type DzToggleButtonUi = UiOverrides<typeof anatomy>

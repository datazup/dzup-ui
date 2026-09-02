import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzButtonGroup — declared anatomy (TASK-N2-S1, ADR-19).
 *
 * One addressable node, and `parts: ['root']` says so — which is a different
 * statement from `parts: 'none'`. The group renders a real `role="group"`
 * element that owns the joined borders and radii; `'none'` is reserved for
 * components that render no element of their own, and this one does.
 *
 * The buttons inside are not parts. They arrive through the default slot and
 * are whatever the consumer put there — `DzButton`, `DzIconButton`, or
 * something of their own — so naming them would be a promise about a node this
 * component does not render.
 */
export const anatomy = {
  parts: ['root'],
  states: ['idle', 'disabled'],

  /**
   * Empty and measured: no `--dz-button-group-*` property is referenced in this
   * component's files. The joining geometry is expressed as `tv()` compound
   * variants over the global radius scale, so there is no per-component custom
   * property to promise.
   */
  componentTokens: [],
  recipes: ['variant', 'size', 'tone', 'orientation'],

  /** A horizontal group flips with the document; the segments reverse with it. */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /** Tier A — presentational. It joins controls and owns no focus of its own. */
  riskTier: 'A',
} as const satisfies ComponentAnatomy

/** Addressable node names, for typing per-instance overrides. */
export type DzButtonGroupPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzButtonGroup. */
export type DzButtonGroupUi = UiOverrides<typeof anatomy>

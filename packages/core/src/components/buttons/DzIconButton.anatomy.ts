import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzIconButton — declared anatomy (TASK-N2-S1, ADR-19).
 *
 * Two parts, not three. The loading spinner is a `<svg>` this component writes
 * and is therefore addressable; the icon is `<component :is="icon">` — the
 * consumer's own component, rendered with no wrapper — and naming it would put
 * a `data-part` on markup this library does not control and cannot promise to
 * keep stable. `DzFab`, which wraps its icon in a `<span>` of its own, does
 * declare an `icon` part; the difference between the two declarations is a real
 * difference between the two templates rather than an inconsistency.
 */
export const anatomy = {
  parts: ['root', 'spinner'],
  optionalParts: ['spinner'],
  states: ['idle', 'loading', 'disabled'],

  /** Empty and measured: no `--dz-icon-button-*` property is referenced. */
  componentTokens: [],
  recipes: ['variant', 'size', 'tone'],
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /** Tier B — owns focus and keyboard activation, and carries its whole label in aria. */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names, for typing per-instance overrides. */
export type DzIconButtonPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzIconButton. */
export type DzIconButtonUi = UiOverrides<typeof anatomy>

import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzRelativeTime — declared anatomy (TASK-N2-S1, ADR-19).
 *
 * One node: the `<time>` element. It is written twice in the template — once
 * inside a tooltip trigger and once bare — but only one branch renders, and
 * both are the same addressable node.
 *
 * The tooltip is **not** a part. It is a composed `DzTooltip`, which is another
 * public component with a contract of its own, and re-declaring its nodes here
 * would make this component's promise depend on another's internals.
 */
export const anatomy = {
  parts: ['root'],
  states: [],

  /** One real component token: the size of the rendered timestamp. */
  componentTokens: ['--dz-relative-time-font-size'],
  recipes: ['tone'],
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /** Tier A — presentational, and it re-renders on a timer rather than on input. */
  riskTier: 'A',
} as const satisfies ComponentAnatomy

/** Addressable node names, for typing per-instance overrides. */
export type DzRelativeTimePart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzRelativeTime. */
export type DzRelativeTimeUi = UiOverrides<typeof anatomy>

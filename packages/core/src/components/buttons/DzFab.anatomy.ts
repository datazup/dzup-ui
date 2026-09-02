import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzFab — declared anatomy (TASK-N2-S1, ADR-19).
 *
 * `spinner` and `icon` are mutually exclusive — the template is a `v-if`/`v-else`
 * pair — so both are optional and exactly one is present at a time. The parts
 * list cannot express that exclusivity and does not need to: `optional` means
 * "may be absent", and each of them may.
 *
 * The `icon` part is the `<span>` wrapper this component writes, not the icon
 * component a consumer passes. The wrapper is ours to keep stable; what goes
 * inside it is not.
 */
export const anatomy = {
  parts: ['root', 'spinner', 'icon'],
  optionalParts: ['spinner', 'icon'],
  states: ['idle', 'loading', 'disabled'],

  /**
   * The one component in this family with real component tokens, and they are
   * why a floating action button can be positioned by a consumer at all.
   */
  componentTokens: [
    '--dz-fab-icon-size',
    '--dz-fab-offset',
    '--dz-fab-shadow',
    '--dz-fab-shadow-hover',
    '--dz-fab-size',
    '--dz-fab-z',
  ],
  recipes: ['variant', 'size', 'tone'],

  /**
   * `--dz-fab-offset` is applied through logical insets, so a bottom-right FAB
   * becomes a bottom-left FAB in an RTL document — which is where a user of
   * that document reaches for it.
   */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /** Tier B — owns focus and keyboard activation. */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names, for typing per-instance overrides. */
export type DzFabPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzFab. */
export type DzFabUi = UiOverrides<typeof anatomy>

import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzCode — declared anatomy (TASK-N2-S1, ADR-19).
 *
 * One node, rendered two ways: `variant="block"` produces a `<pre><code>` and
 * anything else produces a bare `<code>`. Both carry `data-part="root"`,
 * because from a consumer's side they are the same addressable node — which is
 * what ADR-19 §3 means by *a part may change element type in a minor release*.
 */
export const anatomy = {
  parts: ['root'],
  states: [],

  /** Empty and measured: no `--dz-code-*` property is referenced. */
  componentTokens: [],
  recipes: ['variant'],

  /**
   * `mirrors: 'none'` — source code is physical on purpose. It reads left to
   * right in every locale, and mirroring an inline code span inside RTL prose
   * reverses the one run of text that must not reverse. The anatomy contract's
   * own documentation uses a code block as the canonical example of this
   * answer.
   */
  rtl: { mirrors: 'none', keyboard: 'none' },

  /** Tier A — presentational. */
  riskTier: 'A',
} as const satisfies ComponentAnatomy

/** Addressable node names, for typing per-instance overrides. */
export type DzCodePart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzCode. */
export type DzCodeUi = UiOverrides<typeof anatomy>

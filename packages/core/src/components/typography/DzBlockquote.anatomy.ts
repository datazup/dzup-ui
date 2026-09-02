import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzBlockquote — declared anatomy (TASK-N2-S1, ADR-19).
 *
 * Three nodes, all written by this template: the `<blockquote>` itself, the
 * `<div>` that holds the quotation, and the attribution `<footer>`. The inner
 * `content` div exists so the footer can sit outside the quoted text without a
 * consumer having to fight the blockquote's own spacing — which is exactly the
 * kind of node a part is for.
 */
export const anatomy = {
  parts: ['root', 'content', 'footer'],

  /** The attribution renders only when its slot is filled. */
  optionalParts: ['footer'],
  states: [],

  /** Empty and measured: no `--dz-blockquote-*` property is referenced. */
  componentTokens: [],

  /** Quoted prose reads in the document's direction, borders and all. */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /** Tier A — presentational. It renders content and takes no focus. */
  riskTier: 'A',
} as const satisfies ComponentAnatomy

/** Addressable node names, for typing per-instance overrides. */
export type DzBlockquotePart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzBlockquote. */
export type DzBlockquoteUi = UiOverrides<typeof anatomy>

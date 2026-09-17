import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzCollapse — declared anatomy (TASK-R5-O2, ADR-19).
 *
 * One node: the animated `role="region"` container. It has no trigger of its
 * own — the disclosure control belongs to whoever renders it (`DzPanel` and
 * `DzAccordion` both do), which is why `trigger` is not declared here.
 *
 * Declaring `root` also makes this component an **anatomy boundary**: a parent
 * that composes it no longer inherits `data-state="open"` as if it were its
 * own (N2-S1 finding S1-F3, the parent-covers composition rule).
 */
export const anatomy = {
  parts: ['root'],

  /** Emitted unconditionally as `data-state`, driven by the model. */
  states: ['open', 'closed'],

  /**
   * Empty and measured: the height animation is inline style computed from the
   * measured content, and `DzCollapse` reads no `--dz-collapse-*` property.
   */
  componentTokens: [],

  /**
   * Mirrors with the document — the animation is on the block axis and the box
   * carries no inline geometry. `keyboard: 'none'`: it handles no key; the
   * trigger that owns the disclosure does.
   */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /**
   * Keyboard contract (TASK-R5-O5). APG `disclosure`: one trigger, one
   * region, two keys.
   */
  keyboard: [
    {
      key: 'Enter',
      when: 'trigger',
      action: 'Expand or collapse the region.',
      wcag: ['2.1.1'],
      apg: 'disclosure',
    },
    {
      key: ' ',
      when: 'trigger',
      action: 'Expand or collapse the region.',
      wcag: ['2.1.1'],
      apg: 'disclosure',
    },
  ],

  /**
   * Tier B — it hides content from the accessibility tree with `aria-hidden`
   * and participates in a disclosure contract; a defect leaves collapsed
   * content reachable by keyboard but invisible.
   */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names for DzCollapse. */
export type DzCollapsePart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzCollapse. Not wired: `root` is what `class` already targets. */
export type DzCollapseUi = UiOverrides<typeof anatomy>

import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzAccordion — declared anatomy for the accordion family (TASK-R5-O2, ADR-19).
 *
 * **A family anatomy declared on the parent.** `DzAccordionItem`,
 * `DzAccordionTrigger` and `DzAccordionContent` are `compound-part`s of
 * `DzAccordion` in the ownership manifest; they emit `item`, `trigger` /
 * `indicator` and `content`, never `root`, so a composed accordion conforms to
 * one declaration.
 *
 * `indicator` is the chevron inside the trigger. It rotates with the open state
 * and is the one node in the family a consumer cannot reach from the call site,
 * which is why it is the only key on {@link DzAccordionTriggerUi}.
 *
 * The `AccordionHeader` element Reka renders between the item and the trigger
 * carries no part name: it is a `<h3>` wrapper whose only job is the heading
 * level, it takes no styling of its own, and naming it would give a consumer
 * two selectors for one visual row.
 */
export const anatomy = {
  parts: ['root', 'item', 'trigger', 'indicator', 'content'],

  /**
   * Everything but the root comes from consumer markup and repeats once per
   * section; `content` is additionally unmounted while its section is closed.
   */
  optionalParts: ['item', 'trigger', 'indicator', 'content'],

  /**
   * `ready` / `disabled` on the root, both already emitted, plus the
   * `open` / `closed` pair Reka's `AccordionItem`, `AccordionTrigger` and
   * `AccordionContent` put on themselves. The last two are a primitive's
   * vocabulary; declaring them makes a selector on them a supported contract
   * rather than an observation about the current dependency.
   */
  states: ['ready', 'disabled', 'open', 'closed'],

  /**
   * Empty and measured: `DzAccordion.tokens.ts` maps to global semantic tokens
   * and owns no `--dz-accordion-*` property.
   */
  componentTokens: [],

  recipes: ['size', 'variant'],

  /**
   * Mirrors with the document — a disclosure list reads as text and every
   * utility in `DzAccordion.variants.ts` is already logical.
   * `keyboard: 'none'`: Reka's accordion moves between triggers with
   * ArrowUp/ArrowDown, which have no inline axis to reverse.
   *
   * `icons: ['indicator']`: the chevron points at the panel it opens.
   */
  rtl: { mirrors: 'layout', keyboard: 'none', icons: ['indicator'] },

  /**
   * Keyboard contract (TASK-R5-O5). APG `accordion`: disclosure keys on
   * each header, plus header-to-header movement.
   */
  keyboard: [
    {
      key: 'Enter',
      when: 'trigger',
      action: 'Expand or collapse the focused section.',
      wcag: ['2.1.1'],
      apg: 'accordion',
    },
    {
      key: ' ',
      when: 'trigger',
      action: 'Expand or collapse the focused section.',
      wcag: ['2.1.1'],
      apg: 'accordion',
    },
    { key: 'ArrowDown', action: 'Move focus to the next section header.', wcag: ['2.1.1'], apg: 'accordion' },
    {
      key: 'ArrowUp',
      action: 'Move focus to the previous section header.',
      wcag: ['2.1.1'],
      apg: 'accordion',
    },
    { key: 'Home', action: 'Move focus to the first section header.', wcag: ['2.1.1'], apg: 'accordion' },
    { key: 'End', action: 'Move focus to the last section header.', wcag: ['2.1.1'], apg: 'accordion' },
  ],

  /** Tier B — the triggers own focus, keyboard activation and the open value. */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names across the accordion family. */
export type DzAccordionPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzAccordion — the one node it renders itself. */
export type DzAccordionUi = Pick<UiOverrides<typeof anatomy>, 'root'>

/**
 * `ui` prop shape for DzAccordionTrigger — the chevron.
 *
 * The trigger's own element takes `class` at the call site; the indicator it
 * renders has no call site of its own.
 */
export type DzAccordionTriggerUi = Pick<UiOverrides<typeof anatomy>, 'indicator'>

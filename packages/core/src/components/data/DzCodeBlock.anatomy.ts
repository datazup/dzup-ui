import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzCodeBlock — declared anatomy (TASK-N2-S1, ADR-19). **The alignment case.**
 *
 * This component has emitted six `data-part` names since before ADR-19 was
 * written — it is one of the two files the ADR's own measured baseline cites —
 * and until now it declared none of them. That is the exact ABI-by-accident the
 * ADR exists to prevent: six public selectors, no governing document, and
 * nothing that would notice if one disappeared. The names below are **what the
 * template already emits**, transcribed rather than redesigned. Nothing was
 * renamed; a rename is breaking (ADR-19 §3) and belongs to the owner lane.
 *
 * `copy-button` and `line-number` are outside the shared vocabulary and stay
 * that way. `action` would fit the copy control, but it has been public under
 * this name for longer than the vocabulary has existed, and swapping it to buy
 * tidiness would break every consumer already selecting it. `line-number` has
 * no vocabulary equivalent at all. Both are reported by
 * `validate:anatomy-parts` so the vocabulary can grow deliberately.
 *
 * `root` is the only name added, because ADR-19 §3 requires the root node to
 * carry `data-part="root"` and it did not. Adding an attribute is additive.
 */
export const anatomy = {
  parts: ['root', 'header', 'filename', 'language', 'copy-button', 'content', 'line-number'],

  /**
   * Everything but `root` and `content` is conditional: the header renders only
   * when there is a filename, a language or a copy control; the filename and
   * language chips only when their prop is set; the copy control only when
   * `copyable`; and `line-number` repeats once per line, or not at all.
   */
  optionalParts: ['header', 'filename', 'language', 'copy-button', 'line-number'],

  /** No lifecycle and no boolean state: the block renders what it was given. */
  states: [],

  /**
   * **Empty, and the reason is a live defect, not a design choice.**
   * `DzCodeBlock.tokens.ts` declares 14 `--dz-codeblock-*` names and is imported
   * by nothing; `CODEBLOCK_TOKENS` in `@dzup-ui/tokens` declares 15, is publicly
   * exported, and is never read by `generate.ts` — so **no `--dz-codeblock-*`
   * custom property is emitted into any stylesheet**, and this component's own
   * files reference none. Declaring them here would document override points
   * that do not exist in the CSS. See TASK-N2-T1 finding K3 and owner decision
   * T1-D2; when that tier is wired up, these names move here.
   */
  componentTokens: [],

  /**
   * Source code is physical on purpose: it reads left to right in every locale,
   * and a mirrored code block puts the line numbers on the wrong side of text
   * that did not move. `DzCodeBlock.variants.ts` already carries the
   * `rtl-physical-ok` marker for the same reason.
   */
  rtl: { mirrors: 'none', keyboard: 'none' },

  /** Tier A — presentational. It renders content and takes no focus of its own. */
  riskTier: 'A',
} as const satisfies ComponentAnatomy

/** Addressable node names, for typing per-instance overrides. */
export type DzCodeBlockPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzCodeBlock. */
export type DzCodeBlockUi = UiOverrides<typeof anatomy>

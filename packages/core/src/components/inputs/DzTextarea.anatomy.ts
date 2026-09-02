import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzTextarea — declared anatomy (TASK-N2-S1, ADR-19).
 *
 * The one field in the family with **no `control` node**, and that is a fact
 * about the component rather than an omission: the `<textarea>` element carries
 * its own border, background and focus ring, so there is no wrapper box between
 * `root` and `input` to name. Declaring a `control` here would promise a node
 * that would have to be invented to keep the promise.
 *
 * `root` is a positioning context (`relative`) whose only job is to hold the
 * absolutely-positioned spinner, and it is the node a consumer sizes.
 */
export const anatomy = {
  parts: ['root', 'input', 'spinner', 'error'],

  /** `spinner` only while loading; `error` only when there is one. */
  optionalParts: ['spinner', 'error'],

  states: ['disabled', 'loading', 'readonly', 'required'],

  /**
   * Empty and measured: no `--dz-textarea-*` property is referenced. The field
   * reads `DzInput`'s element recipe.
   */
  componentTokens: [],

  recipes: ['variant', 'size', 'tone'],

  /**
   * Mirrors with the document. The loading spinner is pinned with `right-…`
   * rather than a logical inset, which is recorded here rather than hidden:
   * `validate:rtl` reads the component's `.variants.ts`, and the spinner's
   * position is written inline in the template, so the gate does not see it.
   * See the S1 handoff finding on that blind spot.
   */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /** Tier B — owns focus and a value, and resizes itself as that value grows. */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names, for typing per-instance overrides. */
export type DzTextareaPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzTextarea. */
export type DzTextareaUi = UiOverrides<typeof anatomy>

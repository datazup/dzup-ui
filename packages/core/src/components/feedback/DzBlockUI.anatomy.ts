import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzBlockUI — declared anatomy (TASK-R5-O2, ADR-19).
 *
 * The four nodes the template renders, named for their role. The variants file
 * calls the last one `message`; the ADR-19 vocabulary's word for supporting
 * text beneath a primary indicator is `description`, and a tv() slot name is an
 * implementation detail while a part name is a public promise — so the part
 * takes the vocabulary word.
 *
 * The default overlay content is a `DzSpinner`, which has no anatomy of its own
 * and therefore emits no part; when it declares one it will become an anatomy
 * boundary and nothing here changes.
 */
export const anatomy = {
  parts: ['root', 'content', 'overlay', 'description'],

  /**
   * `overlay` renders only while `blocked`, and the message node only when a
   * `message` is supplied and the default overlay slot is used.
   */
  optionalParts: ['overlay', 'description'],

  /**
   * This component sets no `data-state` value. It advertises two presence-only
   * flags instead — `data-blocked` while the region is masked and
   * `data-full-screen` when the scrim is portalled to the body — and ADR-19 §4
   * puts presence-only attributes in `states` beside the `data-state` values.
   */
  states: ['blocked', 'full-screen'],

  /**
   * Measured from `DzBlockUI.variants.ts`: every one of these is read as
   * `var(--dz-blockui-x, <fallback>)`, so each is a real consumer override
   * point with a documented default.
   */
  componentTokens: [
    '--dz-blockui-mask',
    '--dz-blockui-blur',
    '--dz-blockui-radius',
    '--dz-blockui-gap',
    '--dz-blockui-z',
    '--dz-blockui-message-color',
  ],

  /**
   * Mirrors with the document — the overlay is `absolute inset-0`, which is
   * direction-neutral, and the content wrapper is `h-full w-full`.
   * `keyboard: 'none'`: the component takes focus to trap it, and handles no
   * inline-axis key.
   */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /**
   * Keyboard contract (TASK-R5-O5). A blocking overlay takes no keyboard
   * of its own; while it is up, focus stays where the host put it.
   */
  keyboard: 'none',

  /**
   * Tier B — it moves focus, sets `inert` on the masked content and reports
   * `aria-busy`. A defect strands a keyboard user behind an invisible scrim.
   */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names for DzBlockUI. */
export type DzBlockUIPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzBlockUI — every node comes from this template. */
export type DzBlockUIUi = UiOverrides<typeof anatomy>

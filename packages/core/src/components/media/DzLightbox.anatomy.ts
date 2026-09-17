import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzLightbox — declared anatomy (TASK-R5-O2, ADR-19).
 *
 * **No `root` part, deliberately.** This component renders its trigger through
 * a bare slot — the consumer's own element — and everything else into a portal.
 * There is no node of its own to call `root`, and naming the portalled dialog
 * `root` would claim a containment relationship the DOM does not have.
 * `DzDialogContent` already declares an anatomy with no `root` for the same
 * reason, so this is the established shape rather than a new one.
 *
 * `label` is the "3 / 7" counter — a status label, not an `indicator`, which
 * the vocabulary reserves for a non-textual state mark. The image gets no part:
 * no vocabulary word exists for it (recorded in the TASK-R5-O2 handoff as the
 * `image` / `media` request), and the visually hidden title and description get
 * none either — they are accessibility affordances, and a part name would
 * invite a consumer to style them visible.
 */
export const anatomy = {
  parts: ['overlay', 'content', 'label', 'close', 'action', 'description'],

  /**
   * The counter and both navigation buttons render only for a set of more than
   * one image, and the caption only when the current image supplies one.
   * `action` also repeats — previous and next share the name.
   */
  optionalParts: ['label', 'action', 'description'],

  /** reka-ui's `DialogContent` lifecycle, surfaced on the portalled content. */
  states: ['open', 'closed'],

  /**
   * Empty and measured: the variants read `--dz-overlay-bg` and the global
   * semantic tokens, and own no `--dz-lightbox-*` property.
   */
  componentTokens: [],

  /**
   * Mirrors with the document. Previous and next are pinned with the centring
   * idiom plus logical insets, and the caption is a text block.
   * `keyboard: 'swap-horizontal'`: ArrowLeft and ArrowRight step through the
   * set along the inline axis, so they swap meaning in an RTL document.
   *
   * `icons`: the chevrons on the navigation buttons point at the image they
   * move toward, so they mirror with the layout.
   */
  rtl: { mirrors: 'layout', keyboard: 'swap-horizontal', icons: ['action'] },

  /**
   * Keyboard contract (TASK-R5-O5). Reka dialog primitives for the shell,
   * plus the item-to-item movement the lightbox owns. The arrows follow
   * the writing direction, which is why `rtl.keyboard` is `swap-
   * horizontal`.
   */
  keyboard: [
    {
      key: 'Escape',
      action: 'Close the lightbox and return focus to the element that opened it.',
      wcag: ['2.1.1', '2.1.2'],
      apg: 'dialog',
    },
    {
      key: 'Tab',
      action: 'Move to the next focusable element, wrapping inside the lightbox.',
      wcag: ['2.1.2'],
      apg: 'dialog',
    },
    {
      key: 'Tab',
      modifiers: ['Shift'],
      action: 'Move to the previous focusable element, wrapping inside the lightbox.',
      wcag: ['2.1.2'],
      apg: 'dialog',
    },
    { key: 'ArrowRight', action: 'Show the next item.', wcag: ['2.1.1'], rtl: 'mirrored' },
    { key: 'ArrowLeft', action: 'Show the previous item.', wcag: ['2.1.1'], rtl: 'mirrored' },
  ],

  /**
   * Multi-root: the trigger `<slot />` the consumer fills, plus the portaled
   * dialog. `$attrs` binds to the dialog's content node.
   *
   * The slot is not a candidate — it is the consumer's own markup, and putting
   * their attributes back onto it would be the `as-child` mistake (S1-D2). The
   * content node is the only element this component renders that a consumer
   * could mean.
   */
  fallthrough: {
    target: 'content',
    reason:
      'Multi-root (trigger slot + portaled dialog). `$attrs` binds to '
      + 'DialogContent (`content`); the slot is the consumer\'s own markup.',
  },

  /**
   * Tier B — a modal dialog that traps focus, owns Escape and arrow-key
   * navigation, and must restore focus to the trigger on close.
   */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names for DzLightbox. */
export type DzLightboxPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzLightbox — every node comes from this template. */
export type DzLightboxUi = UiOverrides<typeof anatomy>

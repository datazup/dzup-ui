/**
 * DzAnchor — type definitions.
 *
 * An in-page table-of-contents navigation that highlights the section currently
 * in view (scrollspy via IntersectionObserver) and smooth-scrolls on click.
 * Built from scratch (not a Reka UI component); renders a `<nav>` landmark with
 * a nested list of anchor links.
 *
 * @module @dzup-ui/core/components/navigation/DzAnchor
 */

import type { BaseAccessibilityProps } from '@dzup-ui/contracts'

// ---------------------------------------------------------------------------
// Item model
// ---------------------------------------------------------------------------

/** A single anchor entry. May nest `children` for sub-sections. */
export interface DzAnchorItem {
  /** Hash link to the target element, e.g. `#installation`. */
  href: string
  /** Visible link label. */
  label: string
  /** Nested sub-section links. */
  children?: DzAnchorItem[]
  /** Whether this link is non-interactive. */
  disabled?: boolean
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzAnchor component */
export interface DzAnchorProps extends BaseAccessibilityProps {
  /** Anchor entries to render (nested via `children`). */
  items: DzAnchorItem[]
  /**
   * Pixel offset from the top of the viewport used for both scrollspy detection
   * and the scroll landing position (mirrors a sticky header height).
   */
  offsetTop?: number
  /** Stick the nav to the top of the viewport while scrolling. */
  affix?: boolean
  /** Accessible label for the `<nav>` landmark. */
  ariaLabel?: string
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/**
 * Events emitted by DzAnchor.
 *
 * Note: `update:active` is provided by `defineModel('active')` and is therefore
 * not declared here.
 */
export interface DzAnchorEmits {
  /** Active link changed (via scroll or click). Payload is the item `href`. */
  change: [href: string]
  /** A link was clicked. */
  click: [event: MouseEvent, item: DzAnchorItem]
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot scope passed to the `item` slot. */
export interface DzAnchorItemSlotProps {
  /** The item being rendered. */
  item: DzAnchorItem
  /** Whether this item is the active link. */
  active: boolean
  /** Nesting depth (0 = top level). */
  level: number
}

/** Slot definitions for DzAnchor */
export interface DzAnchorSlots {
  /** Custom rendering for a link's inner content. Defaults to `item.label`. */
  item?: (props: DzAnchorItemSlotProps) => unknown
}

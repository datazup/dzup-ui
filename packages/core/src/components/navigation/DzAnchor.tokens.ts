/**
 * DzAnchor — Component-specific token mappings.
 *
 * Maps semantic design tokens to scrollspy navigation styling (ADR-04, ADR-17
 * hybrid model). Concrete custom-property values live in `styles/base.css` under
 * `.dz-anchor`; this file documents the tokens the component consumes.
 *
 * @module @dzup-ui/core/components/navigation/DzAnchor.tokens
 */

export const anchorTokens = {
  /** Link list typography. */
  fontSize: 'var(--dz-anchor-font-size)',
  /** Vertical gap (padding) per link. */
  itemGap: 'var(--dz-anchor-item-gap)',
  /** Horizontal indentation applied per nesting level. */
  indent: 'var(--dz-anchor-indent)',
  /** Resting link color. */
  color: 'var(--dz-anchor-color)',
  /** Hover link color. */
  hoverColor: 'var(--dz-anchor-hover-color)',
  /** Active link color + rail segment color. */
  activeColor: 'var(--dz-anchor-active-color)',
  /** Inactive rail (left border) color. */
  railColor: 'var(--dz-anchor-rail-color)',
} as const

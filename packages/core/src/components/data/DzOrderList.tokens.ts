/**
 * DzOrderList — Component-specific token mappings.
 *
 * Maps semantic design tokens to the reorderable list anatomy (ADR-04, ADR-17
 * hybrid model). The concrete custom-property values live in `styles/base.css`
 * under `.dz-order-list`; this file documents the tokens the component consumes.
 *
 * @module @dzup-ui/core/components/data/DzOrderList.tokens
 */

export const orderListTokens = {
  /** Layout gaps */
  layout: {
    /** Gap between the control column and the list */
    gap: 'var(--dz-order-list-gap)',
    /** Gap between stacked control buttons */
    controlGap: 'var(--dz-order-list-control-gap)',
    /** Outer list radius (bordered variant) */
    radius: 'var(--dz-order-list-radius)',
  },
  /** Row anatomy */
  item: {
    gap: 'var(--dz-order-list-item-gap)',
    background: 'var(--dz-order-list-item-bg)',
    hoverBackground: 'var(--dz-order-list-item-hover-bg)',
    paddingX: 'var(--dz-order-list-item-padding-x)',
    paddingY: 'var(--dz-order-list-item-padding-y)',
    border: 'var(--dz-order-list-border)',
  },
  /** Selected row */
  selected: {
    background: 'var(--dz-order-list-item-selected-bg)',
    foreground: 'var(--dz-order-list-item-selected-fg)',
  },
  /** Grabbed / dragging row */
  grab: {
    background: 'var(--dz-order-list-item-grab-bg)',
    shadow: 'var(--dz-order-list-grab-shadow)',
  },
  /** Drag handle */
  handle: {
    color: 'var(--dz-order-list-handle-color)',
    hoverColor: 'var(--dz-order-list-handle-hover)',
  },
  /** Drop indicator shown while dragging */
  dropIndicator: {
    color: 'var(--dz-order-list-drop-indicator-color)',
    size: 'var(--dz-order-list-drop-indicator-size)',
  },
  /** Disabled treatment */
  disabledOpacity: 'var(--dz-order-list-disabled-opacity)',
} as const

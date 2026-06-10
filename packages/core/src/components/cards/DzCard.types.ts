import type { BaseAccessibilityProps, CardVariant } from '@dzup-ui/contracts'
import type { VNode } from 'vue'

/**
 * Card variant — visual style of the card surface.
 *
 * Re-exported alias of the canonical {@link CardVariant} contract
 * (`elevated | outlined | flat`) per ADR-02. Kept as a named alias so the
 * Cards family public API stays stable while the source of truth lives in
 * `@dzup-ui/contracts`.
 */
export type DzCardVariant = CardVariant

/**
 * Card padding — controls internal spacing.
 */
export type DzCardPadding = 'none' | 'sm' | 'md' | 'lg'

/**
 * Props for the DzCard component.
 *
 * Extends {@link BaseAccessibilityProps} so `id` and ARIA attributes are
 * uniform across the Cards family (matching DzImageCard / DzStatCard).
 */
export interface DzCardProps extends BaseAccessibilityProps {
  /** Visual style variant */
  variant?: DzCardVariant
  /** Internal padding */
  padding?: DzCardPadding
  /** Adds hover shadow effect (visual only — does not imply interactivity) */
  hoverable?: boolean
  /** Makes the card interactive (adds button role and keyboard support) */
  clickable?: boolean
}

/**
 * Events emitted by DzCard.
 */
export interface DzCardEmits {
  /** Emitted when a clickable card is clicked (mouse or keyboard) */
  click: [event: MouseEvent | KeyboardEvent]
}

/**
 * Slot definitions for DzCard.
 */
export interface DzCardSlots {
  /** Primary card content */
  default: () => VNode[]
  /** Card header section */
  header: () => VNode[]
  /** Card footer section */
  footer: () => VNode[]
  /** Action buttons area */
  actions: () => VNode[]
  /** Media/image area */
  media: () => VNode[]
}

/**
 * Props for the DzCardHeader sub-component.
 */
export interface DzCardHeaderProps {
  /** No additional props — structural sub-part */
}

/**
 * Slot definitions for DzCardHeader.
 */
export interface DzCardHeaderSlots {
  /** Header content */
  default: () => VNode[]
  /** Action buttons within the header */
  actions: () => VNode[]
}

/**
 * Props for the DzCardBody sub-component.
 */
export interface DzCardBodyProps {
  /** No additional props — structural sub-part */
}

/**
 * Slot definitions for DzCardBody.
 */
export interface DzCardBodySlots {
  /** Body content */
  default: () => VNode[]
}

/**
 * Props for the DzCardFooter sub-component.
 */
export interface DzCardFooterProps {
  /** No additional props — structural sub-part */
}

/**
 * Slot definitions for DzCardFooter.
 */
export interface DzCardFooterSlots {
  /** Footer content */
  default: () => VNode[]
}

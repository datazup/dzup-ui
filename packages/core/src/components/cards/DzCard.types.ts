import type { BaseAccessibilityProps, CardVariant } from '@dzup-ui/contracts'
import type { VNode } from 'vue'
import type { DzCardHeaderUi, DzCardUi } from './DzCard.anatomy.ts'

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
  /**
   * Per-part class overrides, keyed by the names in `DzCard.anatomy.ts`
   * (ADR-19 §5). `class` keeps its existing meaning and its existing target;
   * `ui.root` addresses the surface by name, and a typo is a type error.
   *
   * `header`, `body` and `footer` are separate components at the call site and
   * already take `class`, so they are not keys here.
   */
  ui?: DzCardUi
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
  default?: () => VNode[]
  /** Card header section */
  header?: () => VNode[]
  /** Card footer section */
  footer?: () => VNode[]
  /** Action buttons area */
  actions?: () => VNode[]
  /** Media/image area */
  media?: () => VNode[]
}

/**
 * Props for the DzCardHeader sub-component.
 */
export interface DzCardHeaderProps {
  /**
   * Per-part class override for the actions region (ADR-19 §5). The header's
   * own element takes `class` at the call site; its inner actions wrapper is
   * the one node in the card family nothing else can reach.
   */
  ui?: DzCardHeaderUi
}

/**
 * Slot definitions for DzCardHeader.
 */
export interface DzCardHeaderSlots {
  /** Header content */
  default?: () => VNode[]
  /** Action buttons within the header */
  actions?: () => VNode[]
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
  default?: () => VNode[]
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
  default?: () => VNode[]
}

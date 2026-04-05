/**
 * DzAccordion + DzAccordionItem — type definitions for the compound Accordion family.
 *
 * Uses Reka UI AccordionRoot/AccordionItem/AccordionTrigger/AccordionContent
 * primitives (ADR-07). Context injection via DZ_ACCORDION_KEY (ADR-08).
 *
 * @module @dzip-ui/core/components/data/DzAccordion
 */

import type {
  BaseAccessibilityProps,
  CanonicalSize,
} from '@dzip-ui/contracts'
import type { InjectionKey, Ref } from 'vue'

// ---------------------------------------------------------------------------
// Context (ADR-08)
// ---------------------------------------------------------------------------

/** Context provided to DzAccordionItem children via inject */
export interface DzAccordionContext {
  /** Component size */
  size: Ref<CanonicalSize>
  /** Visual style variant */
  variant: Ref<AccordionVariant>
}

/** Typed injection key for DzAccordion context (ADR-08, SCREAMING_SNAKE) */
export const DZ_ACCORDION_KEY: InjectionKey<DzAccordionContext> = Symbol('dz-accordion')

// ---------------------------------------------------------------------------
// Variant type
// ---------------------------------------------------------------------------

/** Visual variants for the DzAccordion component */
export type AccordionVariant = 'default' | 'bordered' | 'separated'

// ---------------------------------------------------------------------------
// DzAccordion (Root) Props
// ---------------------------------------------------------------------------

/** Props for the DzAccordion root component (single selection mode) */
export interface DzAccordionSingleProps extends BaseAccessibilityProps {
  /** Selection type: only one item open at a time */
  type?: 'single'
  /** Whether all items can be collapsed simultaneously */
  collapsible?: boolean
  /** Visual style variant */
  variant?: AccordionVariant
  /** Component size */
  size?: CanonicalSize
  /** Disabled state -- prevents all items from toggling */
  disabled?: boolean
}

/** Props for the DzAccordion root component (multiple selection mode) */
export interface DzAccordionMultipleProps extends BaseAccessibilityProps {
  /** Selection type: multiple items open simultaneously */
  type: 'multiple'
  /** Visual style variant */
  variant?: AccordionVariant
  /** Component size */
  size?: CanonicalSize
  /** Disabled state -- prevents all items from toggling */
  disabled?: boolean
}

/** Union props for DzAccordion */
export type DzAccordionProps = DzAccordionSingleProps | DzAccordionMultipleProps

// ---------------------------------------------------------------------------
// DzAccordion Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzAccordion */
export interface DzAccordionEmits {
  /** Emitted when the active item(s) change */
  change: [value: string | string[]]
}

// ---------------------------------------------------------------------------
// DzAccordion Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzAccordion */
export interface DzAccordionSlots {
  /** DzAccordionItem children */
  default: () => unknown
}

// ---------------------------------------------------------------------------
// DzAccordionItem Props
// ---------------------------------------------------------------------------

/** Props for the DzAccordionItem component */
export interface DzAccordionItemProps {
  /** Unique value identifying this item */
  value: string
  /** Whether this item is disabled */
  disabled?: boolean
}

/** Slot definitions for DzAccordionItem */
export interface DzAccordionItemSlots {
  /** Trigger and content for this accordion section */
  default: () => unknown
}

// ---------------------------------------------------------------------------
// DzAccordionTrigger Props
// ---------------------------------------------------------------------------

/** Props for the DzAccordionTrigger component */
export interface DzAccordionTriggerProps {
  /** Additional class name */
  class?: string
}

/** Slot definitions for DzAccordionTrigger */
export interface DzAccordionTriggerSlots {
  /** Trigger label content */
  default: () => unknown
}

// ---------------------------------------------------------------------------
// DzAccordionContent Props
// ---------------------------------------------------------------------------

/** Props for the DzAccordionContent component */
export interface DzAccordionContentProps {
  /** Additional class name */
  class?: string
}

/** Slot definitions for DzAccordionContent */
export interface DzAccordionContentSlots {
  /** Accordion panel content */
  default: () => unknown
}

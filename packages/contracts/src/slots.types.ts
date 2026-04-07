/**
 * Reusable slot prop interfaces for component contracts.
 *
 * Components define their own `Dz{Name}Slots` interface by picking or
 * extending from these canonical slot shapes.
 *
 * @module @dzup-ui/contracts/slots
 */

// ---------------------------------------------------------------------------
// Slot prop shapes
// ---------------------------------------------------------------------------

/** Default slot -- provides no scoped props by default */
export interface DefaultSlotProps {
  // Intentionally empty. Components extend when scoped props are needed.
}

/** Label slot -- scoped props for form field labels */
export interface LabelSlotProps {
  /** ID of the labeled element (for `for` attribute) */
  id: string
  /** Whether the field is required */
  required: boolean
}

/** Description slot -- scoped props for help/description text */
export interface DescriptionSlotProps {
  /** ID of the described element */
  id: string
}

/** Prefix/Suffix slot -- no scoped props needed */
export interface AffixSlotProps {
  // Intentionally empty. Used for prefix/suffix content.
}

/**
 * Item slot -- scoped props for individual items in collections.
 *
 * @typeParam T - The item type
 */
export interface ItemSlotProps<T = unknown> {
  /** The data item */
  item: T
  /** Zero-based index of the item */
  index: number
  /** Whether the item is currently selected */
  selected: boolean
  /** Whether the item is disabled */
  disabled: boolean
}

/** Empty slot -- shown when no data/content is available */
export interface EmptySlotProps {
  // Intentionally empty. Components may extend.
}

/** Trigger slot -- scoped props for popup/overlay triggers */
export interface TriggerSlotProps {
  /** Whether the popup/overlay is currently open */
  open: boolean
}

/** Header slot -- no scoped props by default */
export interface HeaderSlotProps {
  // Intentionally empty. Components extend when needed.
}

/** Footer slot -- no scoped props by default */
export interface FooterSlotProps {
  // Intentionally empty. Components extend when needed.
}

/** Actions slot -- no scoped props by default */
export interface ActionsSlotProps {
  // Intentionally empty. Components extend when needed.
}

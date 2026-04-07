/**
 * DzEmpty — Type definitions for the empty state placeholder component.
 *
 * @module @dzup-ui/core/components/feedback/DzEmpty
 */

import type { Component } from 'vue'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzEmpty component */
export interface DzEmptyProps {
  /** Title text for the empty state */
  title?: string
  /** Description text for additional context */
  description?: string
  /** Icon component to display */
  icon?: Component
  /** Unique element ID */
  id?: string
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzEmpty */
export interface DzEmptySlots {
  /** Custom content (overrides title/description/icon) */
  default?: () => unknown
  /** Custom icon slot (overrides icon prop) */
  icon?: () => unknown
  /** Action buttons area */
  actions?: () => unknown
}

/**
 * DzBreadcrumb — type definitions for the compound Breadcrumb family.
 *
 * Built from scratch (not a Reka UI component).
 * Semantic <nav> with ordered list for accessible breadcrumb navigation.
 *
 * @module @dzup-ui/core/components/navigation/DzBreadcrumb
 */

import type { BaseAccessibilityProps } from '@dzup-ui/contracts'
import type { InjectionKey, Ref } from 'vue'

// ---------------------------------------------------------------------------
// Context (ADR-08)
// ---------------------------------------------------------------------------

/** Context provided to child breadcrumb components via inject */
export interface DzBreadcrumbContext {
  /** Separator string used between items */
  separator: Ref<string>
}

/** Typed injection key for DzBreadcrumb context (ADR-08, SCREAMING_SNAKE) */
export const DZ_BREADCRUMB_KEY: InjectionKey<DzBreadcrumbContext>
  = Symbol('dz-breadcrumb')

// ---------------------------------------------------------------------------
// DzBreadcrumb (Root) Props
// ---------------------------------------------------------------------------

/** Props for the DzBreadcrumb root component */
export interface DzBreadcrumbProps extends BaseAccessibilityProps {
  /** Separator character displayed between breadcrumb items */
  separator?: string
}

/** Slot definitions for DzBreadcrumb */
export interface DzBreadcrumbSlots {
  /** Breadcrumb items */
  default: () => unknown
}

// ---------------------------------------------------------------------------
// DzBreadcrumbItem Props
// ---------------------------------------------------------------------------

/** Props for the DzBreadcrumbItem component */
export interface DzBreadcrumbItemProps {
  /** URL for the breadcrumb link. Renders as <span> when absent. */
  href?: string
  /** Whether this item represents the current page */
  current?: boolean
  /** Whether this item is disabled */
  disabled?: boolean
}

/** Slot definitions for DzBreadcrumbItem */
export interface DzBreadcrumbItemSlots {
  /** Breadcrumb item content */
  default: () => unknown
}

// ---------------------------------------------------------------------------
// DzBreadcrumbSeparator Props
// ---------------------------------------------------------------------------

/** Props for the DzBreadcrumbSeparator component */
export interface DzBreadcrumbSeparatorProps {
  /** Custom separator string (overrides parent context) */
  separator?: string
}

/** Slot definitions for DzBreadcrumbSeparator */
export interface DzBreadcrumbSeparatorSlots {
  /** Custom separator content */
  default: () => unknown
}

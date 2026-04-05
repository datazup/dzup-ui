/**
 * DzMenu — Type definitions for the vertical navigation menu compound.
 *
 * Uses typed injection key (ADR-08).
 *
 * @module @dzip-ui/core/components/navigation/DzMenu
 */

import type { BaseAccessibilityProps, CanonicalSize } from '@dzip-ui/contracts'
import type { InjectionKey, Ref } from 'vue'

// ---------------------------------------------------------------------------
// Compound context (ADR-08)
// ---------------------------------------------------------------------------

/** Context provided to DzMenu children via inject */
export interface DzMenuContext {
  /** Component size */
  size: Ref<CanonicalSize>
  /** Whether the menu is collapsed (icon-only mode) */
  collapsed: Ref<boolean>
}

/** Typed injection key for DzMenu context (ADR-08, SCREAMING_SNAKE) */
export const DZ_MENU_KEY: InjectionKey<DzMenuContext> = Symbol('dz-menu')

// ---------------------------------------------------------------------------
// DzMenu (Root)
// ---------------------------------------------------------------------------

/** Props for the DzMenu root component */
export interface DzMenuProps extends BaseAccessibilityProps {
  /** Component size */
  size?: CanonicalSize
  /** Collapse the menu to icon-only mode */
  collapsed?: boolean
}

/** Slot definitions for DzMenu */
export interface DzMenuSlots {
  /** DzMenuItem and DzMenuSeparator children */
  default: () => unknown
}

// ---------------------------------------------------------------------------
// DzMenuItem
// ---------------------------------------------------------------------------

/** Props for the DzMenuItem component */
export interface DzMenuItemProps {
  /** Whether this item is currently active/selected */
  active?: boolean
  /** Whether this item is disabled */
  disabled?: boolean
  /** URL to navigate to (renders as <a>) */
  href?: string
  /** Accessible label */
  ariaLabel?: string
}

/** Events emitted by DzMenuItem */
export interface DzMenuItemEmits {
  /** Item clicked */
  click: [event: MouseEvent]
}

/** Slot definitions for DzMenuItem */
export interface DzMenuItemSlots {
  /** Item label content */
  default: () => unknown
  /** Icon slot (rendered before the label) */
  icon?: () => unknown
}

// ---------------------------------------------------------------------------
// DzMenuSeparator
// ---------------------------------------------------------------------------

/** No props for the separator */
export interface DzMenuSeparatorProps {
  // Visual divider only
}

/**
 * DzCommandPalette — Type definitions for the command palette compound.
 *
 * Uses Reka UI Dialog + Combobox primitives (ADR-07).
 *
 * @module @dzup-ui/core/components/overlays/DzCommandPalette
 */

import type { BaseAccessibilityProps } from '@dzup-ui/contracts'
import type { Component } from 'vue'

// ---------------------------------------------------------------------------
// Data types
// ---------------------------------------------------------------------------

/** A single command item */
export interface CommandItem {
  /** Unique identifier */
  id: string
  /** Display label */
  label: string
  /** Optional icon component */
  icon?: Component
  /** Keyboard shortcut display string (e.g., 'Ctrl+K') */
  shortcut?: string
  /** Group identifier to categorize this item */
  group?: string
  /** Whether the item is disabled */
  disabled?: boolean
}

/** A group of command items */
export interface CommandGroup {
  /** Unique group identifier */
  id: string
  /** Display label for the group */
  label: string
}

// ---------------------------------------------------------------------------
// DzCommandPalette (Root)
// ---------------------------------------------------------------------------

/** Props for the DzCommandPalette root component */
export interface DzCommandPaletteProps extends BaseAccessibilityProps {
  /** Placeholder text for the search input */
  placeholder?: string
  /** Command items to display */
  items?: CommandItem[]
  /** Groups for categorizing items */
  groups?: CommandGroup[]
  /** Whether to bind Ctrl+K / Cmd+K globally */
  enableGlobalShortcut?: boolean
}

/** Events emitted by DzCommandPalette */
export interface DzCommandPaletteEmits {
  /** A command item was selected */
  select: [item: CommandItem]
  /** Search query changed */
  search: [query: string]
}

/** Slot definitions for DzCommandPalette */
export interface DzCommandPaletteSlots {
  /** Default slot for custom layout override */
  default?: () => unknown
  /** Custom empty state */
  empty?: () => unknown
  /** Custom item rendering */
  item?: (props: { item: CommandItem }) => unknown
}

// ---------------------------------------------------------------------------
// DzCommandPaletteInput
// ---------------------------------------------------------------------------

/** Props for the DzCommandPaletteInput component */
export interface DzCommandPaletteInputProps {
  /** Placeholder text */
  placeholder?: string
}

/** Slot definitions for DzCommandPaletteInput */
export interface DzCommandPaletteInputSlots {
  /** Optional prefix icon slot */
  prefix?: () => unknown
}

// ---------------------------------------------------------------------------
// DzCommandPaletteList
// ---------------------------------------------------------------------------

/** Slot definitions for DzCommandPaletteList */
export interface DzCommandPaletteListSlots {
  /** List items */
  default: () => unknown
}

// ---------------------------------------------------------------------------
// DzCommandPaletteItem
// ---------------------------------------------------------------------------

/** Props for the DzCommandPaletteItem component */
export interface DzCommandPaletteItemProps {
  /** The command item data */
  item: CommandItem
  /** Whether the item is disabled */
  disabled?: boolean
}

/** Events emitted by DzCommandPaletteItem */
export interface DzCommandPaletteItemEmits {
  /** Item selected */
  select: [item: CommandItem]
}

/** Slot definitions for DzCommandPaletteItem */
export interface DzCommandPaletteItemSlots {
  /** Custom item content */
  default?: (props: { item: CommandItem }) => unknown
}

// ---------------------------------------------------------------------------
// DzCommandPaletteGroup
// ---------------------------------------------------------------------------

/** Props for the DzCommandPaletteGroup component */
export interface DzCommandPaletteGroupProps {
  /** Group heading text */
  heading?: string
}

/** Slot definitions for DzCommandPaletteGroup */
export interface DzCommandPaletteGroupSlots {
  /** Group items */
  default: () => unknown
}

// ---------------------------------------------------------------------------
// DzCommandPaletteEmpty
// ---------------------------------------------------------------------------

/** Slot definitions for DzCommandPaletteEmpty */
export interface DzCommandPaletteEmptySlots {
  /** Custom empty state content */
  default?: () => unknown
}

/**
 * DzTabs — type definitions for the compound Tabs component family.
 *
 * Uses Reka UI TabsRoot/TabsList/TabsTrigger/TabsContent primitives (ADR-07).
 * v-model via defineModel<string>() (ADR-16).
 * Context injection via DZ_TABS_KEY (ADR-08).
 *
 * @module @dzup-ui/core/components/navigation/DzTabs
 */

import type {
  BaseAccessibilityProps,
  CanonicalSize,
  TabsVariant,
} from '@dzup-ui/contracts'
import type { InjectionKey, Ref } from 'vue'

// ---------------------------------------------------------------------------
// Context (ADR-08)
// ---------------------------------------------------------------------------

/** Context provided to child tab components via inject */
export interface DzTabsContext {
  /** Visual style variant */
  variant: Ref<TabsVariant>
  /** Component size */
  size: Ref<CanonicalSize>
  /** Layout orientation */
  orientation: Ref<'horizontal' | 'vertical'>
}

/** Typed injection key for DzTabs context (ADR-08, SCREAMING_SNAKE) */
export const DZ_TABS_KEY: InjectionKey<DzTabsContext> = Symbol('dz-tabs')

// ---------------------------------------------------------------------------
// DzTabs (Root) Props
// ---------------------------------------------------------------------------

/** Props for the DzTabs root component */
export interface DzTabsProps extends BaseAccessibilityProps {
  /** Layout orientation */
  orientation?: 'horizontal' | 'vertical'
  /** Visual style variant */
  variant?: TabsVariant
  /** Component size */
  size?: CanonicalSize
  /** Tab activation mode: automatic (on focus) or manual (on click) */
  activationMode?: 'automatic' | 'manual'
}

// ---------------------------------------------------------------------------
// DzTabs Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzTabs */
export interface DzTabsEmits {
  /** Active tab value changed */
  change: [value: string]
}

// ---------------------------------------------------------------------------
// DzTabs Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzTabs */
export interface DzTabsSlots {
  /** Tab list and tab content children */
  default: () => unknown
}

// ---------------------------------------------------------------------------
// DzTabList Props
// ---------------------------------------------------------------------------

/** Props for the DzTabList component */
export interface DzTabListProps {
  /** Whether to loop focus through tabs */
  loop?: boolean
}

/** Slot definitions for DzTabList */
export interface DzTabListSlots {
  /** Tab trigger children */
  default: () => unknown
}

// ---------------------------------------------------------------------------
// DzTabTrigger Props
// ---------------------------------------------------------------------------

/** Props for the DzTabTrigger component */
export interface DzTabTriggerProps {
  /** Unique value identifying this tab */
  value: string
  /** Whether this tab trigger is disabled */
  disabled?: boolean
}

/** Slot definitions for DzTabTrigger */
export interface DzTabTriggerSlots {
  /** Tab trigger label content */
  default: () => unknown
}

// ---------------------------------------------------------------------------
// DzTabContent Props
// ---------------------------------------------------------------------------

/** Props for the DzTabContent component */
export interface DzTabContentProps {
  /** Value matching the corresponding tab trigger */
  value: string
  /** Force mount content even when inactive (useful for SEO) */
  forceMount?: boolean
}

/** Slot definitions for DzTabContent */
export interface DzTabContentSlots {
  /** Tab panel content */
  default: () => unknown
}

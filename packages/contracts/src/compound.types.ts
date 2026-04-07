/**
 * Compound component injection patterns (ADR-08).
 *
 * Every compound family defines an `InjectionKey<T>` in its own
 * `.types.ts` file. This module provides the generic context shape
 * and helper types used by those keys.
 *
 * Naming convention:
 * - Key constant: `DZ_{FAMILY}_KEY` (SCREAMING_SNAKE)
 * - Context interface: `Dz{Family}Context`
 *
 * @module @dzup-ui/contracts/compound
 */

import type { Ref } from 'vue'
import type { CanonicalSize, CanonicalTone } from './canonical.types'

// ---------------------------------------------------------------------------
// Generic compound context
// ---------------------------------------------------------------------------

/**
 * Base context shape shared by compound component families.
 *
 * Individual families extend this with component-specific fields.
 *
 * @typeParam TValue - The type of the compound group's bound value
 */
export interface CompoundContext<TValue = unknown> {
  /** Shared model value of the compound group */
  modelValue: Ref<TValue>
  /** Whether the entire compound group is disabled */
  disabled: Ref<boolean>
  /** Size propagated to all children */
  size: Ref<CanonicalSize>
  /** Tone propagated to all children */
  tone: Ref<CanonicalTone>
}

// ---------------------------------------------------------------------------
// Registration pattern
// ---------------------------------------------------------------------------

/**
 * Registration interface for compound children that register themselves
 * with the parent context (e.g., TabsPanel registers with Tabs).
 *
 * @typeParam TItem - Shape of the registered item descriptor
 */
export interface CompoundRegistration<TItem = unknown> {
  /** Register a child item with the parent */
  register: (item: TItem) => void
  /** Unregister a child item (called in `onUnmounted`) */
  unregister: (id: string) => void
}

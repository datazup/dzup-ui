/**
 * DzAccordion + DzAccordionItem — type definitions for the compound Accordion family.
 *
 * Uses Reka UI AccordionRoot/AccordionItem/AccordionTrigger/AccordionContent
 * primitives (ADR-07). Context injection via DZ_ACCORDION_KEY (ADR-08).
 *
 * @module @dzup-ui/core/components/data/DzAccordion
 */

import type {
  BaseAccessibilityProps,
  CanonicalSize,
} from '@dzup-ui/contracts'
import type { InjectionKey, Ref } from 'vue'
import type { DzAccordionTriggerUi, DzAccordionUi } from './DzAccordion.anatomy.ts'

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

/**
 * Visual variants for the DzAccordion component.
 *
 * - `default`   — flush list, a divider under each item (no chrome).
 * - `bordered`  — single rounded container with internal dividers.
 * - `separated` — each item is its own outlined card with a gap between them.
 * - `filled`    — each item is a soft, filled card (no borders) with a gap.
 */
export type AccordionVariant = 'default' | 'bordered' | 'separated' | 'filled'

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
  /**
   * Per-part class override for the accordion root (ADR-19 §5). Items,
   * triggers and panels are sub-components the consumer writes, where
   * `class` at the call site already lands.
   */
  ui?: DzAccordionUi
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
  /**
   * Per-part class override for the accordion root (ADR-19 §5). Items,
   * triggers and panels are sub-components the consumer writes, where
   * `class` at the call site already lands.
   */
  ui?: DzAccordionUi
}

/** Union props for DzAccordion */
export type DzAccordionProps = DzAccordionSingleProps | DzAccordionMultipleProps

/**
 * The flat prop declaration `defineProps` receives (TASK-R5-O8, A3-D3).
 *
 * `defineProps<DzAccordionProps>()` — a UNION type argument — is resolved to
 * `{}` by `vue-language-core`, the engine behind both `vue-tsc` and
 * `vue-component-meta`. Measured at `99b963a`:
 *
 *   - `<DzAccordion :size="123" type="multiple" collapsible />` type-checks
 *     CLEAN, while the same mistake on `DzTabs` is rejected — the union bought
 *     no discrimination and cost every consumer their prop type-checking;
 *   - `vue-component-meta` returned **0 props, 0 events, 0 slots and 0 exposed
 *     members** for the whole component, which is why its docs page, its
 *     `llms.txt` entry and its three MCP tool answers were empty (A3-D3).
 *
 * Vue's own SFC compiler already flattens the union to exactly these eleven
 * members plus `modelValue`, so the runtime prop declaration is unchanged —
 * this interface is a transcription of the compiler's own output, held in the
 * type system where the language service can read it.
 *
 * `DzAccordionSingleProps`, `DzAccordionMultipleProps` and `DzAccordionProps`
 * remain the authored, exported consumer contract; `_DzAccordionRootCoversUnion`
 * below fails the build if this flat form ever stops covering them.
 */
export interface DzAccordionRootProps extends BaseAccessibilityProps {
  /** Selection type: `single` opens one item at a time, `multiple` any number */
  type?: 'single' | 'multiple'
  /** Whether all items can be collapsed simultaneously (single mode only; defaults to `true`) */
  collapsible?: boolean
  /** Visual style variant */
  variant?: AccordionVariant
  /** Component size */
  size?: CanonicalSize
  /** Disabled state -- prevents all items from toggling */
  disabled?: boolean
  /**
   * Per-part class override for the accordion root (ADR-19 §5). Items,
   * triggers and panels are sub-components the consumer writes, where
   * `class` at the call site already lands.
   */
  ui?: DzAccordionUi
}

/** Compile-time proof that the flat runtime declaration still covers the union. */
type Assert<T extends true> = T
export type _DzAccordionRootCoversUnion
  = Assert<DzAccordionProps extends DzAccordionRootProps ? true : false>

// ---------------------------------------------------------------------------
// DzAccordion Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzAccordion */
export interface DzAccordionEmits {
  /** An item was revealed imperatively and its panel has rendered */
  revealed: [value: string]
  /** Emitted when the active item(s) change */
  change: [value: string | string[]]
}

// ---------------------------------------------------------------------------
// DzAccordion Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzAccordion */
export interface DzAccordionSlots {
  /** DzAccordionItem children */
  default?: () => unknown
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
  /**
   * Per-part class override for the chevron (ADR-19 §5). The trigger's own
   * element takes `class` at the call site; the indicator it renders has no
   * call site of its own.
   */
  ui?: DzAccordionTriggerUi
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

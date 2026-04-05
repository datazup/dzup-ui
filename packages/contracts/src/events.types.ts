/**
 * Canonical event interfaces for component contracts.
 *
 * Components use `defineEmits<SomeEvents>()` referencing these interfaces.
 * `update:modelValue` is NOT included because ADR-16 mandates
 * `defineModel<T>()` which handles it implicitly.
 *
 * @module @dzip-ui/contracts/events
 */

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

/** Metadata payload for change events indicating how the value was changed */
export interface ChangeMetadata {
  /** Whether the change was triggered by a user action or programmatic API */
  source: 'user' | 'api'
}

// ---------------------------------------------------------------------------
// Base events
// ---------------------------------------------------------------------------

/** Focus/blur events -- required for all interactive components */
export interface BaseEvents {
  /** Focus gained */
  focus: [event: FocusEvent]
  /** Focus lost */
  blur: [event: FocusEvent]
}

// ---------------------------------------------------------------------------
// Value change events
// ---------------------------------------------------------------------------

/**
 * Events for components that emit value changes.
 *
 * @typeParam T - The value type of the component
 */
export interface ChangeEvents<T = unknown> extends BaseEvents {
  /** Value committed (after user finishes editing, not during typing) */
  change: [value: T, metadata?: ChangeMetadata]
}

// ---------------------------------------------------------------------------
// Input-specific events
// ---------------------------------------------------------------------------

/** Events for text input components (DzInput, DzTextarea) */
export interface InputEvents extends ChangeEvents<string> {
  /** Value changed during typing (every keystroke) */
  input: [value: string]
}

// ---------------------------------------------------------------------------
// Selection events
// ---------------------------------------------------------------------------

/**
 * Events for selectable components (DzSelect, DzCombobox, etc.)
 *
 * @typeParam T - The item/value type
 */
export interface SelectEvents<T = unknown> extends ChangeEvents<T> {
  /** An item was selected from a list/collection */
  select: [value: T]
  /** Value was cleared/reset */
  clear: []
}

// ---------------------------------------------------------------------------
// Openable events
// ---------------------------------------------------------------------------

/** Events for components with open/close behavior (Dialog, Popover, Menu) */
export interface OpenableEvents extends BaseEvents {
  /** Popup/overlay opened */
  open: []
  /** Popup/overlay closed */
  close: []
}

// ---------------------------------------------------------------------------
// Combined patterns
// ---------------------------------------------------------------------------

/**
 * Events for selectable + openable components (DzSelect with dropdown).
 *
 * @typeParam T - The item/value type
 */
export interface SelectOpenableEvents<T = unknown>
  extends SelectEvents<T>,
  OpenableEvents {}

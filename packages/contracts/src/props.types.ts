/**
 * Base prop interfaces composable by every component family.
 *
 * Components combine these via intersection (`&`) or `extends` to form
 * their concrete prop types. `modelValue` is NOT included here because
 * ADR-16 mandates `defineModel<T>()` — the prop is implicit.
 *
 * @module @dzip-ui/contracts/props
 */

import type { CanonicalSize, CanonicalTone } from './canonical.types'

// ---------------------------------------------------------------------------
// Behavior
// ---------------------------------------------------------------------------

/** Shared behavior props for all interactive components */
export interface BaseBehaviorProps {
  /** Disabled state -- prevents interaction */
  disabled?: boolean
  /** Read-only state -- visible but not editable */
  readonly?: boolean
  /** Loading state -- shows loading indicator */
  loading?: boolean
  /** Component name for form integration */
  name?: string
}

// ---------------------------------------------------------------------------
// Appearance
// ---------------------------------------------------------------------------

/**
 * Shared appearance props.
 *
 * @typeParam TSize    - Size union (defaults to {@link CanonicalSize})
 * @typeParam TVariant - Variant union (family-specific, defaults to `string`)
 */
export interface BaseAppearanceProps<
  TSize extends string = CanonicalSize,
  TVariant extends string = string,
> {
  /** Component size */
  size?: TSize
  /** Visual style variant */
  variant?: TVariant
  /** Semantic color tone */
  tone?: CanonicalTone
}

// ---------------------------------------------------------------------------
// Validation / State
// ---------------------------------------------------------------------------

/** Shared validation props for form-connected components */
export interface BaseValidationProps {
  /** Whether the field value is invalid */
  invalid?: boolean
  /** Error message to display */
  error?: string
  /** Whether the field is required */
  required?: boolean
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

/** Shared ARIA props for all interactive components */
export interface BaseAccessibilityProps {
  /** Unique element ID (prefer `useId()` from Vue 3.5 when auto-generated) */
  id?: string
  /** Accessible label */
  ariaLabel?: string
  /** ID of element that labels this component */
  ariaLabelledby?: string
  /** ID of element that describes this component */
  ariaDescribedby?: string
  /** Indicates the component has invalid input */
  ariaInvalid?: boolean | 'grammar' | 'spelling'
}

// ---------------------------------------------------------------------------
// Composed base interfaces
// ---------------------------------------------------------------------------

/**
 * Combined base for interactive (non-form) components.
 *
 * Includes behavior, appearance, and accessibility -- but NOT validation,
 * which is only relevant for form controls.
 *
 * @typeParam TVariant - Variant union (family-specific)
 */
export interface BaseInteractiveProps<TVariant extends string = string>
  extends BaseBehaviorProps,
  BaseAppearanceProps<CanonicalSize, TVariant>,
  BaseAccessibilityProps {}

/**
 * Combined base for form-control components.
 *
 * Extends {@link BaseInteractiveProps} with validation props.
 *
 * @typeParam TVariant - Variant union (family-specific)
 */
export interface BaseFormControlProps<TVariant extends string = string>
  extends BaseInteractiveProps<TVariant>,
  BaseValidationProps {}

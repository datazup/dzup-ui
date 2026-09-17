/**
 * Base prop interfaces composable by every component family.
 *
 * Components combine these via intersection (`&`) or `extends` to form
 * their concrete prop types. `modelValue` is NOT included here because
 * ADR-16 mandates `defineModel<T>()` — the prop is implicit.
 *
 * @module @dzup-ui/contracts/props
 */

import type { CanonicalSize, CanonicalTone } from './canonical.types.js'

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
  // ariaInvalid's HOME, as of TASK-R5-O1 (2026-09-04, from N5-02 D1). It sits
  // beside `invalid`, `error` and `required` because it is the same claim they
  // make; declaring it on the *labelling* base gives a validity claim to every
  // component that only wants an accessible name, which nine points of use
  // already undo with `Omit<BaseAccessibilityProps, 'ariaInvalid'>`.
  //
  // BaseAccessibilityProps still declares it, deprecated, so this change is
  // ADDITIVE and no component's prop surface moves. See that declaration for
  // what the removal costs and who owns it.
  //
  // The doc comment below is deliberately byte-identical to the one on
  // BaseAccessibilityProps: `component-meta.json` records prop DESCRIPTIONS, so
  // two declarations of one prop must describe it the same way or a generated
  // artifact three sessions were holding would have gone stale for a wording
  // change.
  /** Indicates the component has invalid input */
  ariaInvalid?: boolean | 'grammar' | 'spelling'
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
  // DEPRECATED HERE — moved to BaseValidationProps by TASK-R5-O1 (2026-09-04,
  // from N5-02 D1). Validity is a form-control concern; declaring it on the
  // labelling base hands it to every component that only wants an accessible
  // name, which is why nine points of use write
  // `Omit<BaseAccessibilityProps, 'ariaInvalid'>` to take it back.
  //
  // It is still declared here so the move is ADDITIVE: a form control extending
  // BaseFormControlProps inherits it from the validation half with an identical
  // type and an identical description, and no component's prop surface changes.
  //
  // DELETING THIS LINE IS THE BREAKING HALF -- a `minor` under VERSIONING.md s1
  // -- and it is a separate change because it removes `ariaInvalid` from THIRTY
  // components that reference it without a validation base (measured on
  // 99b963a; the list is in
  // docs/program-2026-09-04/reports/TASK-R5-O1-handoff.md). Six of those
  // genuinely forward aria-invalid and must gain BaseValidationProps; the rest
  // declare it and never forward it. It also requires regenerating
  // component-meta.json (97 references), llms{,-full}.txt and the docs pages,
  // which TASK-R5-O1 could not do: a concurrent session held those artifacts.
  //
  // The `@deprecated` tag is deliberately NOT used, for the same reason the
  // description is unchanged -- the extractor records it, and a tag here would
  // have moved a generated artifact this task was told not to regenerate.
  /** Indicates the component has invalid input */
  ariaInvalid?: boolean | 'grammar' | 'spelling'
}

// ---------------------------------------------------------------------------
// Portals
// ---------------------------------------------------------------------------

/**
 * Shared portal placement props for components backed by an overlay primitive.
 *
 * The defaults are intentionally left to each component and its headless
 * primitive. Consumers can render inline for embedded surfaces and component
 * tests without replacing the real primitive with a stub.
 */
export interface BasePortalProps {
  /** Portal target. Defaults to `document.body` when omitted. */
  portalTo?: string | HTMLElement
  /** Render inline instead of teleporting to the portal target. */
  portalDisabled?: boolean
  /** Defer target resolution until the application has mounted. */
  portalDefer?: boolean
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

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
  // ariaInvalid's HOME and, since TASK-R0-O2 (2026-09-22), its ONLY home on a
  // base interface. Added here by TASK-R5-O1 (2026-09-04) and removed from
  // BaseAccessibilityProps here; both halves answer N5-02 D1. It sits beside
  // `invalid`, `error` and `required` because it is the same claim they make;
  // declaring it on the *labelling* base gave a validity claim to every
  // component that only wanted an accessible name.
  //
  // Seven components forward `aria-invalid` without a validation base and now
  // declare the prop themselves — see the note on BaseAccessibilityProps for
  // which, and why they did not simply extend this interface.
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
  // `ariaInvalid` USED TO BE DECLARED HERE and is not any more.
  //
  // It moved to BaseValidationProps in two steps, both from N5-02 D1:
  //   1. TASK-R5-O1 (2026-09-04) ADDED it to BaseValidationProps and left the
  //      deprecated declaration here, so that step was additive and no
  //      component's prop surface moved.
  //   2. TASK-R0-O2 (2026-09-22) DELETED it here. That is the breaking half —
  //      a `minor` under VERSIONING.md §1 — and it is what closes D1.
  //
  // Validity is a form-control concern. Declaring it on the *labelling* base
  // handed a validity claim to every component that only wanted an accessible
  // name, which is why six points of use write
  // `Omit<BaseAccessibilityProps, …'ariaInvalid'…>` to take it back
  // (DzGrid, DzStack, DzInplace, DzStepper, DzTabs, and DzFloatLabel's
  // four-key form). Those narrowings are now no-ops and are DELIBERATELY LEFT
  // IN PLACE: `validate:form-readiness`'s probe spec pins DzGrid's clause as
  // the fixture that proves `Omit` in an `extends` clause is read at all
  // (packages/tooling/src/validators/form-readiness.spec.ts, "honours an Omit
  // in the extends clause"). Deleting them would delete that coverage to buy
  // tidiness. They may be dropped by whoever next re-homes that fixture.
  //
  // Seven components forward `aria-invalid` without extending a validation
  // base — DzCard, DzCheckbox, DzCheckboxGroup, DzInputGroup, DzRadio,
  // DzRadioGroup, DzSwitch. Each now DECLARES `ariaInvalid` on its own props
  // interface rather than gaining BaseValidationProps, because that base also
  // carries `invalid`, `error` and `required`, and those seven read none of
  // them — they resolve invalidity from the enclosing DzFormField. Adding three
  // props nothing reads would recreate exactly the defect
  // `.changeset/nine-aria-props-that-did-nothing-are-gone.md` removed.
  //
  // Each of those seven declarations repeats the doc comment BYTE-IDENTICALLY
  // (`Indicates the component has invalid input`) for the reason recorded on
  // BaseValidationProps: component-meta.json records prop DESCRIPTIONS.
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

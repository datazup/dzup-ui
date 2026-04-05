/**
 * @dzip-ui/contracts
 *
 * Canonical public API contracts (types, events, slots) for all dzip-ui
 * components. Every public component MUST conform to these interfaces.
 *
 * This package is types-only with one exception: {@link assertNever} is a
 * tiny runtime helper for exhaustive switch checking.
 *
 * Dependency: `vue` (for `Ref`, `InjectionKey` types only).
 * Does NOT depend on `@dzip-ui/tokens` at runtime.
 */

// Canonical taxonomies & variant enums
export type {
  AlertVariant,
  AnyVariant,
  BadgeVariant,
  ButtonVariant,
  CanonicalSize,
  CanonicalTone,
  CardVariant,
  ChipVariant,
  InputVariant,
  ProgressVariant,
  TabsVariant,
} from './canonical.types.ts'

// Compound component context types
export type {
  CompoundContext,
  CompoundRegistration,
} from './compound.types.ts'

// Data attribute types
export type {
  DataAttributes,
  DataState,
} from './data-attributes.types.ts'

// Event interfaces
export type {
  BaseEvents,
  ChangeEvents,
  ChangeMetadata,
  InputEvents,
  OpenableEvents,
  SelectEvents,
  SelectOpenableEvents,
} from './events.types.ts'

// Base prop interfaces
export type {
  BaseAccessibilityProps,
  BaseAppearanceProps,
  BaseBehaviorProps,
  BaseFormControlProps,
  BaseInteractiveProps,
  BaseValidationProps,
} from './props.types.ts'

// Slot prop interfaces
export type {
  ActionsSlotProps,
  AffixSlotProps,
  DefaultSlotProps,
  DescriptionSlotProps,
  EmptySlotProps,
  FooterSlotProps,
  HeaderSlotProps,
  ItemSlotProps,
  LabelSlotProps,
  TriggerSlotProps,
} from './slots.types.ts'

// Utility types
export type {
  Branded,
  EmitPayload,
  OptionalProps,
  Prettify,
  RequireProps,
} from './utility.types.ts'

// Runtime exports
export { assertNever } from './utility.types.ts'

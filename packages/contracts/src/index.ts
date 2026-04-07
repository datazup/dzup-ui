/**
 * @dzup-ui/contracts
 *
 * Canonical public API contracts (types, events, slots) for all dzup-ui
 * components. Every public component MUST conform to these interfaces.
 *
 * This package is types-only with one exception: {@link assertNever} is a
 * tiny runtime helper for exhaustive switch checking.
 *
 * Dependency: `vue` (for `Ref`, `InjectionKey` types only).
 * Does NOT depend on `@dzup-ui/tokens` at runtime.
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
} from './canonical.types'

// Compound component context types
export type {
  CompoundContext,
  CompoundRegistration,
} from './compound.types'

// Data attribute types
export type {
  DataAttributes,
  DataState,
} from './data-attributes.types'

// Event interfaces
export type {
  BaseEvents,
  ChangeEvents,
  ChangeMetadata,
  InputEvents,
  OpenableEvents,
  SelectEvents,
  SelectOpenableEvents,
} from './events.types'

// Base prop interfaces
export type {
  BaseAccessibilityProps,
  BaseAppearanceProps,
  BaseBehaviorProps,
  BaseFormControlProps,
  BaseInteractiveProps,
  BaseValidationProps,
} from './props.types'

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
} from './slots.types'

// Utility types
export type {
  Branded,
  EmitPayload,
  OptionalProps,
  Prettify,
  RequireProps,
} from './utility.types'

// Runtime exports
export { assertNever } from './utility.types'

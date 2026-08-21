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

// Component anatomy (Contract Spec v1 styling surface, ADR-19)
export { ANATOMY_PART_VOCABULARY } from './anatomy.types'

export type {
  AnatomyPart,
  ComponentAnatomy,
  ComponentRtl,
  DzClassValue,
  RecipeAxis,
  RiskTier,
  UiOverrides,
  VocabularyPart,
} from './anatomy.types'
// Canonical taxonomies & variant enums
export type {
  AlertVariant,
  AnyVariant,
  BadgeVariant,
  ButtonVariant,
  CanonicalDensity,
  CanonicalSize,
  CanonicalTone,
  CardVariant,
  ChipVariant,
  InputVariant,
  Orientation,
  PanelVariant,
  ProgressVariant,
  TabsVariant,
  ToolbarVariant,
} from './canonical.types'

// Compound component context types
export type { CompoundContext, CompoundRegistration } from './compound.types'
// Data attribute types
export type { DataAttributes, DataState } from './data-attributes.types'

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
  BasePortalProps,
  BaseValidationProps,
} from './props.types'

// Provider contract — injection keys and concern shapes (ADR-20)
export {
  DZ_DEFAULTS_KEY,
  DZ_DIRECTION_KEY,
  DZ_FORMATS_KEY,
  DZ_LOCALE_KEY,
  DZ_MESSAGES_KEY,
  DZ_MOTION_KEY,
  DZ_NONCE_KEY,
  DZ_PORTAL_TARGET_KEY,
  DZ_PROVIDER_DEFAULTS,
  DZ_TEST_IDS_KEY,
} from './provider.types'

export type {
  DzDefaults,
  DzDirection,
  DzDirectionPreference,
  DzFormatDefaults,
  DzFormats,
  DzLocale,
  DzMessageCatalog,
  DzMessages,
  DzMotion,
  DzMotionPreference,
  DzTestIds,
} from './provider.types'

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
export type { Branded, EmitPayload, OptionalProps, Prettify, RequireProps } from './utility.types'

// Runtime exports
export { assertNever } from './utility.types'

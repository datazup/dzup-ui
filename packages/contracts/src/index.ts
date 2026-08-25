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

// Async option sources and file references (renderer contract C9, TASK-FORM-OSS-03)
export type {
  AsyncOptionsEmits,
  AsyncOptionsProps,
  AsyncOptionsState,
  DzFileRef,
  DzFileRefStatus,
  LoadOptionsReason,
  LoadOptionsRequest,
  UploadRequest,
} from './async-options.types'

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
// Value codecs a form renderer binds through (renderer contract C1).
//
// The second runtime export this package carries, after `assertNever`, and for
// the same reason: pure, dependency-free, and part of the contract rather than
// an implementation of it.
export type { FormValueKind, JsonValue } from './form-value'

export {
  emptyValueFor,
  fromIsoDate,
  fromIsoTime,
  isEmptyValue,
  isFileRef,
  isJsonSerializable,
  toFileRef,
  toIsoDate,
  toIsoTime,
  toNumberValue,
} from './form-value'

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

// Quality tiers — the evidence a component owes at its risk tier (P5-01)
export {
  APG_PATTERNS,
  BASELINE_WCAG,
  baselineWcagFor,
  BOUNDARY_EVIDENCE,
  COMPONENT_TRAITS,
  EVIDENCE_KINDS,
  evidenceFor,
  evidenceOrigin,
  INTERACTIVE_WCAG,
  requiredEvidence,
  RISK_TIER_ORDER,
  SECURITY_BOUNDARIES,
  TIER_EVIDENCE_INCREMENT,
  TRAIT_EVIDENCE,
  TRAIT_WCAG,
  WCAG_22_CRITERIA,
  WCAG_CRITERION_IDS,
} from './quality-tiers'

export type {
  ApgPattern,
  ComponentQuality,
  ComponentTrait,
  EvidenceKind,
  SecurityBoundary,
  WcagCriterion,
  WcagLevel,
} from './quality-tiers'

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

/**
 * @dzup-ui/contracts
 *
 * Canonical public API contracts (types, events, slots) for all dzup-ui
 * components. Every public component MUST conform to these interfaces.
 *
 * This package is types-first. Its runtime exports are deliberately few, and
 * each is there because it is an **identity** the tiers must share rather than
 * an implementation they each keep: {@link assertNever}, the form-value codecs,
 * the `DZ_*_KEY` injection symbols, and `DzSanitizeLimitError` — a class two
 * packages must be able to `instanceof` against the same constructor. All are
 * pure and dependency-free.
 *
 * Dependency: `vue` (for `Ref`, `InjectionKey` types only).
 * Does NOT depend on `@dzup-ui/tokens` at runtime.
 */

// Component anatomy (Contract Spec v1 styling surface, ADR-19)
export { ANATOMY_PART_EXTENSIONS, ANATOMY_PART_VOCABULARY } from './anatomy.types.js'

export type {
  AnatomyPart,
  ComponentAnatomy,
  ComponentFallthrough,
  ComponentKeyboard,
  ComponentRtl,
  DzClassValue,
  KeyboardBinding,
  KeyboardModifier,
  RecipeAxis,
  RiskTier,
  UiOverrides,
  VocabularyPart,
} from './anatomy.types.js'

// The composition contract (TASK-R5-O6, ADR-19 §5 · finding R-021).
// The `asChild` allowlist is a central list on purpose: its value is that a
// component cannot add itself to it. See the module doc for why that is not a
// per-component declaration like every other contract fact in the repo.
export { AS_CHILD_ALLOWLIST, asChildEntryFor } from './as-child-allowlist.js'

export type { AsChildEntry, AsChildGuarantee, AsChildMode } from './as-child-allowlist.js'

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
} from './async-options.types.js'

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
} from './canonical.types.js'

export { HANDLER_COMPOSITION_RULE, SAFE_FALLTHROUGH_ATTRS, UI_MERGE_ORDER } from './composition.types.js'

export type { UiMergeLayer } from './composition.types.js'
// Compound component context types
export type { CompoundContext, CompoundRegistration } from './compound.types.js'
// Data attribute types
export type { DataAttributes, DataState } from './data-attributes.types.js'

// Event interfaces
export type {
  BaseEvents,
  ChangeEvents,
  ChangeMetadata,
  InputEvents,
  OpenableEvents,
  SelectEvents,
  SelectOpenableEvents,
} from './events.types.js'
// Value codecs a form renderer binds through (renderer contract C1).
//
// The second runtime export this package carries, after `assertNever`, and for
// the same reason: pure, dependency-free, and part of the contract rather than
// an implementation of it.
export type { FormValueKind, JsonValue } from './form-value.js'

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
} from './form-value.js'

// Base prop interfaces
export type {
  BaseAccessibilityProps,
  BaseAppearanceProps,
  BaseBehaviorProps,
  BaseFormControlProps,
  BaseInteractiveProps,
  BasePortalProps,
  BaseValidationProps,
} from './props.types.js'

// Provider contract — injection keys and concern shapes (ADR-20; sanitizer
// concern added by ADR-20 amendment A6, TASK-R3-O2; URL policy added by ADR-20
// amendment A7, TASK-R2-O4)
export {
  DZ_ALLOWED_URL_SCHEMES,
  DZ_DEFAULTS_KEY,
  DZ_DIRECTION_KEY,
  DZ_FORMATS_KEY,
  DZ_LOCALE_KEY,
  DZ_MESSAGES_KEY,
  DZ_MOTION_KEY,
  DZ_NONCE_KEY,
  DZ_PORTAL_TARGET_KEY,
  DZ_PROVIDER_DEFAULTS,
  DZ_SANITIZER_KEY,
  DZ_TEST_IDS_KEY,
  DZ_URL_POLICY_KEY,
  // Runtime: the error the sanitizer seam throws. Exported as a value because
  // `instanceof` is the point — see its docstring.
  DzSanitizeLimitError,
} from './provider.types.js'

export type {
  DzDefaults,
  DzDirection,
  DzDirectionPreference,
  DzFormatDefaults,
  DzFormats,
  DzInstant,
  DzLocale,
  DzLocalePack,
  DzMessage,
  DzMessageArg,
  DzMessageArgsOf,
  DzMessageCatalog,
  DzMessageKey,
  DzMessages,
  DzMessageValues,
  DzMotion,
  DzMotionPreference,
  DzObjectUrlSink,
  DzPlainDate,
  DzPlainTime,
  DzSanitizeContext,
  DzSanitizeLimits,
  DzSanitizerAdapter,
  DzSanitizerOptions,
  DzSanitizeSink,
  DzTestIds,
  DzUrlPolicy,
  DzUrlPolicyContext,
  DzUrlPolicyOptions,
  DzUrlSink,
} from './provider.types.js'

// Quality tiers — the evidence a component owes at its risk tier (P5-01)
export {
  APG_PATTERNS,
  BASELINE_WCAG,
  baselineWcagFor,
  BOUNDARY_COVERS_COMPOUND_PARTS,
  BOUNDARY_EVIDENCE,
  COMPONENT_TRAITS,
  crossesBoundary,
  EVIDENCE_KINDS,
  evidenceFor,
  evidenceOrigin,
  formatBoundaries,
  INTERACTIVE_WCAG,
  normaliseBoundaries,
  requiredAtPairs,
  requiredEvidence,
  RISK_TIER_ORDER,
  SECURITY_BOUNDARIES,
  TIER_AT_PAIR_INCREMENT,
  TIER_EVIDENCE_INCREMENT,
  TRAIT_EVIDENCE,
  TRAIT_WCAG,
  WCAG_22_CRITERIA,
  WCAG_CRITERION_IDS,
} from './quality-tiers.js'

export type {
  ApgPattern,
  ComponentQuality,
  ComponentTrait,
  EvidenceKind,
  SecurityBoundary,
  SecurityBoundarySet,
  WcagCriterion,
  WcagLevel,
} from './quality-tiers.js'

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
} from './slots.types.js'

// Utility types
export type { Branded, EmitPayload, OptionalProps, Prettify, RequireProps } from './utility.types.js'

// Runtime exports
export { assertNever } from './utility.types.js'

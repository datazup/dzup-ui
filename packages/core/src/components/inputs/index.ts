/**
 * Inputs family — public exports.
 *
 * @module @dzip-ui/core/components/inputs
 */

// Types
export type {
  DzInputEmits,
  DzInputProps,
  DzInputSlots,
} from './DzInput.types.ts'
// Variants (for consumer customization)
export {
  type InputElementVariantProps,
  inputElementVariants,
  type InputWrapperVariantProps,
  inputWrapperVariants,
} from './DzInput.variants.ts'
// Components
export { default as DzInput } from './DzInput.vue'

export type {
  DzInputGroupProps,
  DzInputGroupSlots,
} from './DzInputGroup.types.ts'

export { type InputGroupVariantProps, inputGroupVariants } from './DzInputGroup.variants.ts'

// ── DzInputGroup ──
export { default as DzInputGroup } from './DzInputGroup.vue'

export type {
  DzNumberInputEmits,
  DzNumberInputProps,
  DzNumberInputSlots,
} from './DzNumberInput.types.ts'

export { default as DzNumberInput } from './DzNumberInput.vue'

export type {
  DzOtpInputEmits,
  DzOtpInputProps,
  DzOtpInputSlots,
} from './DzOtpInput.types.ts'

export { type OtpInputVariantProps, otpInputVariants } from './DzOtpInput.variants.ts'

// ── DzOtpInput ──
export { default as DzOtpInput } from './DzOtpInput.vue'

export type {
  DzPasswordInputEmits,
  DzPasswordInputProps,
  DzPasswordInputSlots,
} from './DzPasswordInput.types.ts'

// ── DzPasswordInput ──
export { default as DzPasswordInput } from './DzPasswordInput.vue'

export type {
  DzSearchInputEmits,
  DzSearchInputProps,
  DzSearchInputSlots,
} from './DzSearchInput.types.ts'

// ── DzSearchInput ──
export { default as DzSearchInput } from './DzSearchInput.vue'

export type {
  DzTextareaEmits,
  DzTextareaProps,
  DzTextareaSlots,
} from './DzTextarea.types.ts'

export {
  type TextareaVariantProps,
  textareaVariants,
} from './DzTextarea.variants.ts'

export { default as DzTextarea } from './DzTextarea.vue'

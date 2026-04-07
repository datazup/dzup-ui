/**
 * Buttons family — public exports.
 *
 * @module @dzup-ui/core/components/buttons
 */

// Types
export type {
  DzButtonEmits,
  DzButtonProps,
  DzButtonSlots,
} from './DzButton.types.ts'
// Variants (for consumer customization)
export { type ButtonVariantProps, buttonVariants } from './DzButton.variants.ts'
// Components
export { default as DzButton } from './DzButton.vue'

export type {
  DzButtonGroupContext,
  DzButtonGroupProps,
  DzButtonGroupSlots,
} from './DzButtonGroup.types.ts'

// Injection key (runtime export)
export { DZ_BUTTON_GROUP_KEY } from './DzButtonGroup.types.ts'

export { type ButtonGroupVariantProps, buttonGroupVariants } from './DzButtonGroup.variants.ts'

export { default as DzButtonGroup } from './DzButtonGroup.vue'

export type {
  DzIconButtonEmits,
  DzIconButtonProps,
} from './DzIconButton.types.ts'

export { default as DzIconButton } from './DzIconButton.vue'

export type {
  DzSplitButtonActionEmits,
  DzSplitButtonActionProps,
  DzSplitButtonActionSlots,
  DzSplitButtonContext,
  DzSplitButtonMenuProps,
  DzSplitButtonMenuSlots,
  DzSplitButtonProps,
  DzSplitButtonSlots,
} from './DzSplitButton.types.ts'
export { DZ_SPLIT_BUTTON_KEY } from './DzSplitButton.types.ts'
// ── DzSplitButton (Compound) ──
export { default as DzSplitButton } from './DzSplitButton.vue'

export { default as DzSplitButtonAction } from './DzSplitButtonAction.vue'

export { default as DzSplitButtonMenu } from './DzSplitButtonMenu.vue'

export type {
  DzToggleButtonEmits,
  DzToggleButtonProps,
  DzToggleButtonSlots,
} from './DzToggleButton.types.ts'
export { type ToggleButtonVariantProps, toggleButtonVariants } from './DzToggleButton.variants.ts'
// ── DzToggleButton ──
export { default as DzToggleButton } from './DzToggleButton.vue'

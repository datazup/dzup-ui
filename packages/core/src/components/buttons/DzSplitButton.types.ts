/**
 * DzSplitButton — Type definitions for the compound split button.
 *
 * Split button = primary action button + dropdown trigger button.
 * Uses typed injection key (ADR-08).
 *
 * @module @dzip-ui/core/components/buttons/DzSplitButton
 */

import type {
  BaseAccessibilityProps,
  ButtonVariant,
  CanonicalSize,
  CanonicalTone,
} from '@dzip-ui/contracts'
import type { InjectionKey, Ref } from 'vue'

// ---------------------------------------------------------------------------
// Compound context (ADR-08)
// ---------------------------------------------------------------------------

/** Context provided to DzSplitButton children via inject */
export interface DzSplitButtonContext {
  /** Visual variant */
  variant: Ref<ButtonVariant>
  /** Component size */
  size: Ref<CanonicalSize>
  /** Semantic tone */
  tone: Ref<CanonicalTone>
  /** Disabled state */
  disabled: Ref<boolean>
  /** Loading state */
  loading: Ref<boolean>
}

/** Typed injection key for DzSplitButton context (ADR-08, SCREAMING_SNAKE) */
export const DZ_SPLIT_BUTTON_KEY: InjectionKey<DzSplitButtonContext>
  = Symbol('dz-split-button')

// ---------------------------------------------------------------------------
// DzSplitButton (Root) Props
// ---------------------------------------------------------------------------

/** Props for the DzSplitButton root component */
export interface DzSplitButtonProps extends BaseAccessibilityProps {
  /** Visual style variant */
  variant?: ButtonVariant
  /** Component size */
  size?: CanonicalSize
  /** Semantic color tone */
  tone?: CanonicalTone
  /** Disabled state -- prevents interaction */
  disabled?: boolean
  /** Loading state -- shows spinner on primary action */
  loading?: boolean
}

// ---------------------------------------------------------------------------
// DzSplitButton Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzSplitButton root */
export interface DzSplitButtonSlots {
  /** DzSplitButtonAction and DzSplitButtonMenu children */
  default: () => unknown
}

// ---------------------------------------------------------------------------
// DzSplitButtonAction Props
// ---------------------------------------------------------------------------

/** Props for the DzSplitButtonAction component */
export interface DzSplitButtonActionProps {
  /** Accessible label for the primary action */
  ariaLabel?: string
}

/** Events emitted by DzSplitButtonAction */
export interface DzSplitButtonActionEmits {
  /** Primary action clicked */
  click: [event: MouseEvent]
}

/** Slot definitions for DzSplitButtonAction */
export interface DzSplitButtonActionSlots {
  /** Primary action label */
  default: () => unknown
}

// ---------------------------------------------------------------------------
// DzSplitButtonMenu Props
// ---------------------------------------------------------------------------

/** Props for the DzSplitButtonMenu trigger */
export interface DzSplitButtonMenuProps {
  /** Accessible label for the dropdown trigger */
  ariaLabel?: string
}

/** Slot definitions for DzSplitButtonMenu */
export interface DzSplitButtonMenuSlots {
  /** Dropdown menu content */
  default: () => unknown
}

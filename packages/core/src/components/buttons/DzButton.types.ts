/**
 * DzButton — type definitions.
 *
 * @module @dzip-ui/core/components/buttons/DzButton
 */

import type {
  BaseAccessibilityProps,
  ButtonVariant,
  CanonicalSize,
  CanonicalTone,
} from '@dzip-ui/contracts'
import type { Component } from 'vue'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzButton component */
export interface DzButtonProps extends BaseAccessibilityProps {
  /** Visual style variant */
  variant?: ButtonVariant
  /** Component size */
  size?: CanonicalSize
  /** Semantic color tone */
  tone?: CanonicalTone
  /** Disabled state -- prevents interaction */
  disabled?: boolean
  /** Loading state -- shows spinner and sets aria-busy */
  loading?: boolean
  /** HTML button type attribute */
  type?: 'button' | 'submit' | 'reset'
  /** Render as child element (slot content becomes the root) */
  asChild?: boolean
  /**
   * Element or component to render as (polymorphic root).
   * Overrides the default `<button>` element.
   *
   * @example
   * ```vue
   * <DzButton as="a" href="/about">About</DzButton>
   * <DzButton :as="RouterLink" to="/home">Home</DzButton>
   * ```
   */
  as?: string | Component
  /** When set, renders as `<a>` automatically and forwards href */
  href?: string
  /**
   * When set, renders as `<router-link>` (with `<a>` fallback).
   * Accepts a string path or a vue-router location object.
   */
  to?: string | Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzButton */
export interface DzButtonEmits {
  /** Native click event (suppressed when disabled or loading) */
  click: [event: MouseEvent]
  /** Focus gained */
  focus: [event: FocusEvent]
  /** Focus lost */
  blur: [event: FocusEvent]
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzButton */
export interface DzButtonSlots {
  /** Primary button content (label text) */
  default?: () => unknown
  /** Content before the label (typically an icon) */
  prefix?: () => unknown
  /** Content after the label (typically an icon) */
  suffix?: () => unknown
}

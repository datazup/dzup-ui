/**
 * DzAvatar — Type definitions for the avatar component.
 *
 * Displays a user avatar with image, fallback initials, or icon.
 *
 * @module @dzup-ui/core/components/media/DzAvatar
 */

import type { BaseAccessibilityProps, CanonicalSize } from '@dzup-ui/contracts'
import type { InjectionKey, Ref } from 'vue'

// ---------------------------------------------------------------------------
// Compound context (ADR-08) — used by DzAvatarGroup
// ---------------------------------------------------------------------------

/** Context provided to DzAvatar children from DzAvatarGroup */
export interface DzAvatarGroupContext {
  /** Size propagated to all children */
  size: Ref<CanonicalSize>
}

/** Typed injection key for DzAvatarGroup context (ADR-08, SCREAMING_SNAKE) */
export const DZ_AVATAR_GROUP_KEY: InjectionKey<DzAvatarGroupContext>
  = Symbol('dz-avatar-group')

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Avatar shape options */
export type AvatarShape = 'circle' | 'square'

/** Props for the DzAvatar component */
export interface DzAvatarProps extends BaseAccessibilityProps {
  /** Image source URL */
  src?: string
  /** Alt text for the avatar image */
  alt?: string
  /** Fallback text (typically initials) when image is not available */
  fallback?: string
  /** Component size */
  size?: CanonicalSize
  /** Avatar shape */
  shape?: AvatarShape
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzAvatar */
export interface DzAvatarEmits {
  /** Emitted when the avatar image fails to load */
  error: [event: Event]
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzAvatar */
export interface DzAvatarSlots {
  /** Custom fallback content (overrides fallback prop) */
  default?: () => unknown
}

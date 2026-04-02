/**
 * DzIcon — Type definitions for the icon component.
 *
 * Wraps icon components (e.g. from lucide-vue-next) with consistent sizing
 * and accessibility attributes.
 */
import type { Component } from 'vue'

/** Icon size */
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface DzIconProps {
  /** Icon component to render (e.g. from lucide-vue-next) */
  icon: Component
  /** Icon size */
  size?: IconSize
  /** SVG stroke width override */
  strokeWidth?: number
  /** Accessible label. When provided, the icon is treated as meaningful (not decorative). */
  ariaLabel?: string
  /** Accessible identifier */
  id?: string
}

export interface DzIconSlots {
  // DzIcon has no slots — it renders the icon component directly
}

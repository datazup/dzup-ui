/**
 * DzKbd — Type definitions for the keyboard-key hint component.
 *
 * Renders one or more semantic `<kbd>` chips, optionally platform-aware
 * (⌘ on macOS, Ctrl on Windows/Linux for the synthetic `mod` key).
 *
 * @module @dzup-ui/core/components/typography/DzKbd
 */

import type { CanonicalSize } from '@dzup-ui/contracts'

/** Props for the DzKbd component */
export interface DzKbdProps {
  /**
   * Ordered list of keys to render as a combo, e.g. `['mod', 'k']`.
   * Synthetic keys (`mod`, `alt`, `shift`, `enter`, `esc`, …) are mapped to
   * platform-appropriate symbols when {@link DzKbdProps.platformAware} is on.
   * When omitted, the default slot is rendered as a single chip instead.
   */
  keys?: string[]
  /**
   * Map synthetic keys to platform-appropriate glyphs:
   * `mod` → ⌘ on macOS, `Ctrl` elsewhere; `alt` → ⌥ / `Alt`; etc.
   * @default true
   */
  platformAware?: boolean
  /** Canonical sizing of the rendered chips. @default 'md' */
  size?: CanonicalSize
  /**
   * Visual separator rendered between chips. Pass an empty string for
   * joined chips with no separator.
   * @default '+'
   */
  separator?: string
  /** Unique element ID */
  id?: string
}

/** Slot definitions for DzKbd */
export interface DzKbdSlots {
  /** Raw key content, used when the `keys` prop is not provided */
  default?: () => unknown
}

/**
 * Canonical option arrays for story `argTypes` and gallery matrices.
 *
 * These mirror the frozen taxonomies in `@dzup-ui/contracts` (ADR-02). Import
 * them instead of re-typing literal arrays in every story so a taxonomy change
 * propagates from one place.
 */

import type { ButtonVariant, CanonicalSize, CanonicalTone } from '@dzup-ui/contracts'
import { BREAKPOINTS } from '@dzup-ui/tokens'

/** Canonical sizes, smallest → largest. */
export const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const satisfies readonly CanonicalSize[]

/** Canonical semantic tones. */
export const TONES = [
  'neutral',
  'primary',
  'success',
  'warning',
  'danger',
  'info',
] as const satisfies readonly CanonicalTone[]

/** Per-family `variant` taxonomies (ADR-02). */
export const VARIANTS = {
  button: ['solid', 'outline', 'ghost', 'text', 'link'] as const satisfies readonly ButtonVariant[],
  card: ['elevated', 'outlined', 'flat'] as const,
  input: ['outline', 'filled', 'underlined'] as const,
  alert: ['filled', 'outline', 'subtle', 'ghost'] as const,
  badge: ['solid', 'outline', 'subtle'] as const,
  tabs: ['line', 'enclosed', 'pills'] as const,
  progress: ['bar', 'circular'] as const,
  chip: ['solid', 'outline', 'subtle'] as const,
}

/**
 * Reusable `argTypes` fragments grouped by the house-style categories
 * (Appearance / Behavior / State / Accessibility — see Contributing.mdx).
 * Spread these into a story's `argTypes` to avoid re-declaring the common props.
 */
export const sizeArgType = {
  control: 'select',
  options: SIZES,
  description: 'Component size',
  table: { category: 'Appearance', defaultValue: { summary: 'md' } },
} as const

export const toneArgType = {
  control: 'select',
  options: TONES,
  description: 'Semantic color tone',
  table: { category: 'Appearance', defaultValue: { summary: 'primary' } },
} as const

export const disabledArgType = {
  control: 'boolean',
  description: 'Disabled state — prevents interaction',
  table: { category: 'Behavior', defaultValue: { summary: 'false' } },
} as const

/**
 * Named viewports for responsive stories (TASK-7.D), registered GLOBALLY by
 * `.storybook/preview.ts` so every story gets the viewport toolbar — not only the
 * handful that opt in via `parameters.viewport.options` (TASK-FREE-17).
 *
 * Every width except `mobile` is read from `BREAKPOINTS` in `@dzup-ui/tokens`
 * rather than typed here, so the docs demo the exact breakpoints the library
 * ships: change the token and the toolbar follows.
 *
 * `mobile` (375px) is the deliberate exception and is NOT a token. The scale
 * starts at `sm` 640, so nothing in it describes a phone — yet 375 is where a
 * component library most needs to be checked, and it is the width at which the
 * `unprefixed` base styles are what you are looking at. Naming it here is honest
 * about that; inventing a `--dz-breakpoint-xs` to launder it would not be.
 *
 * The `mobile` / `tablet` / `desktop` keys are load-bearing — `DzAppShell`,
 * `DzContainer` and `DzGrid` pin them via `globals.viewport.value`.
 *
 * ```ts
 * export const Mobile: Story = {
 *   parameters: { layout: 'fullscreen' },
 *   globals: { viewport: { value: 'mobile' } },
 *   render: ...,
 * }
 * ```
 */
export const RESPONSIVE_VIEWPORTS = {
  mobile: { name: 'Mobile (375px)', styles: { width: '375px', height: '720px' }, type: 'mobile' },
  sm: { name: `Small (${BREAKPOINTS.sm} · sm)`, styles: { width: BREAKPOINTS.sm, height: '900px' }, type: 'mobile' },
  tablet: { name: `Tablet (${BREAKPOINTS.md} · md)`, styles: { width: BREAKPOINTS.md, height: '1024px' }, type: 'tablet' },
  lg: { name: `Laptop (${BREAKPOINTS.lg} · lg)`, styles: { width: BREAKPOINTS.lg, height: '800px' }, type: 'desktop' },
  desktop: { name: `Desktop (${BREAKPOINTS.xl} · xl)`, styles: { width: BREAKPOINTS.xl, height: '800px' }, type: 'desktop' },
  wide: { name: `Wide (${BREAKPOINTS['2xl']} · 2xl)`, styles: { width: BREAKPOINTS['2xl'], height: '900px' }, type: 'desktop' },
} as const

/** Canonical accessibility arg-types shared by every interactive component. */
export const a11yArgTypes = {
  id: {
    control: 'text',
    description: 'Unique element ID',
    table: { category: 'Accessibility' },
  },
  ariaLabel: {
    control: 'text',
    description: 'Accessible label',
    table: { category: 'Accessibility' },
  },
  ariaLabelledby: {
    control: 'text',
    description: 'ID of labelling element',
    table: { category: 'Accessibility' },
  },
  ariaDescribedby: {
    control: 'text',
    description: 'ID of describing element',
    table: { category: 'Accessibility' },
  },
} as const

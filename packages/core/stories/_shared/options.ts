/**
 * Canonical option arrays for story `argTypes` and gallery matrices.
 *
 * These mirror the frozen taxonomies in `@dzup-ui/contracts` (ADR-02). Import
 * them instead of re-typing literal arrays in every story so a taxonomy change
 * propagates from one place.
 */

import type { ButtonVariant, CanonicalSize, CanonicalTone } from '@dzup-ui/contracts'

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
 * Named viewports for responsive stories (TASK-7.D).
 *
 * Register on a story via `parameters.viewport.options` and pick the active one
 * with story-level `globals.viewport`. The widths bracket the common Tailwind
 * breakpoints used by `DzGrid`/`DzContainer` (`sm` 640 · `md` 768 · `lg` 1024).
 *
 * ```ts
 * import { RESPONSIVE_VIEWPORTS } from '../_shared'
 * export const Mobile: Story = {
 *   parameters: { viewport: { options: RESPONSIVE_VIEWPORTS }, layout: 'fullscreen' },
 *   globals: { viewport: { value: 'mobile' } },
 *   render: ...,
 * }
 * ```
 */
export const RESPONSIVE_VIEWPORTS = {
  mobile: { name: 'Mobile (375px)', styles: { width: '375px', height: '720px' }, type: 'mobile' },
  tablet: { name: 'Tablet (768px)', styles: { width: '768px', height: '1024px' }, type: 'tablet' },
  desktop: { name: 'Desktop (1280px)', styles: { width: '1280px', height: '800px' }, type: 'desktop' },
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

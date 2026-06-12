/**
 * DzKnob — tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04). The `tone` variant
 * sets the local `--dz-knob-value` custom property, which the value arc
 * references via `stroke`, keeping the tone→color mapping in one place.
 *
 * @module @dzup-ui/core/components/forms/DzKnob.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const knobVariants = tv({
  slots: {
    root: [
      'relative inline-flex items-center justify-center',
      'rounded-full outline-none',
      'dz-focus-ring-control',
      '[--dz-knob-range:var(--dz-muted)]',
    ].join(' '),
    svg: [
      'block touch-none select-none',
      'cursor-pointer',
    ].join(' '),
    rangeArc: [
      'fill-none',
      'stroke-[var(--dz-knob-range)]',
    ].join(' '),
    valueArc: [
      'fill-none',
      'stroke-[var(--dz-knob-value)]',
      'transition-[stroke-dashoffset] duration-150',
    ].join(' '),
    label: [
      'pointer-events-none absolute inset-0 flex items-center justify-center',
      'font-medium text-[var(--dz-foreground)] tabular-nums',
    ].join(' '),
  },
  variants: {
    size: {
      icon: { label: 'text-[length:var(--dz-text-sm)]' },
      xs: { label: 'text-[length:var(--dz-text-xs)]' },
      sm: { label: 'text-[length:var(--dz-text-xs)]' },
      md: { label: 'text-[length:var(--dz-text-sm)]' },
      lg: { label: 'text-[length:var(--dz-text-base)]' },
      xl: { label: 'text-[length:var(--dz-text-lg)]' },
    },
    tone: {
      neutral: { root: '[--dz-knob-value:var(--dz-foreground)]' },
      primary: { root: '[--dz-knob-value:var(--dz-primary)]' },
      success: { root: '[--dz-knob-value:var(--dz-success)]' },
      warning: { root: '[--dz-knob-value:var(--dz-warning-solid)]' },
      danger: { root: '[--dz-knob-value:var(--dz-danger)]' },
      info: { root: '[--dz-knob-value:var(--dz-info)]' },
    },
    disabled: {
      true: { root: 'dz-disabled-control', svg: 'cursor-not-allowed' },
    },
    readonly: {
      true: { svg: 'cursor-default' },
    },
    invalid: {
      true: { root: '[--dz-knob-range:color-mix(in_oklab,var(--dz-danger)_30%,var(--dz-muted))]' },
    },
  },
  defaultVariants: {
    size: 'md',
    tone: 'primary',
  },
})

/** Variant prop types extracted from the tv() definition */
export type KnobVariantProps = VariantProps<typeof knobVariants>

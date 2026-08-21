/**
 * DzPanel -- tailwind-variants (tv) style definitions.
 *
 * Token-only styling (ADR-04): all colors reference CSS token variables.
 * `size` density is driven by the data-size token hook in base.css, so the
 * per-size variants carry no classes here.
 *
 * @module @dzup-ui/core/components/layout/DzPanel.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

/** Root surface container. */
export const panelVariants = tv({
  base: [
    'dz-panel',
    'rounded-[var(--dz-panel-radius)]',
    'bg-[var(--dz-panel-bg)]',
    'text-[var(--dz-panel-foreground)]',
    '[contain:layout_style]',
  ].join(' '),
  variants: {
    variant: {
      outlined: 'border border-[var(--dz-panel-border)]',
      elevated: 'border border-[var(--dz-panel-border)] shadow-[var(--dz-panel-shadow)]',
      legend: 'border border-[var(--dz-panel-border)]',
    },
    // `size` drives header/body density via the data-size token hook in
    // base.css; `icon` falls back to default (md) density.
    size: {
      icon: '',
      xs: '',
      sm: '',
      md: '',
      lg: '',
      xl: '',
    },
  },
  defaultVariants: {
    variant: 'outlined',
    size: 'md',
  },
})

/** Header row: title on the left, actions on the right. */
export const panelHeaderVariants = tv({
  base: [
    'dz-panel__header',
    'flex items-center justify-between',
    'gap-[var(--dz-panel-gap)]',
    'px-[var(--dz-panel-padding-x)]',
    'py-[var(--dz-panel-header-padding-y)]',
  ].join(' '),
  variants: {
    // Full-width divider under the header for non-legend surfaces.
    bordered: {
      true: 'border-b border-[var(--dz-panel-border)]',
    },
  },
})

/** Header toggle / title wrapper. Becomes a focusable button when collapsible. */
export const panelTriggerVariants = tv({
  base: 'flex flex-1 items-center gap-[var(--dz-panel-gap)] min-w-0 text-start',
  variants: {
    collapsible: {
      true: 'cursor-pointer rounded-[var(--dz-radius-sm)] dz-focus-ring-control -m-1 p-1',
    },
  },
})

/** Title text — `tone` drives the accent color. */
export const panelTitleVariants = tv({
  base: [
    'min-w-0 truncate',
    'font-semibold',
    'text-[length:var(--dz-panel-title-size)]',
    'text-[var(--dz-panel-accent)]',
  ].join(' '),
})

/** Collapse-chevron indicator. */
export const panelChevronVariants = tv({
  base: [
    'shrink-0',
    'size-[1em]',
    'transition-transform',
    '[transition-duration:var(--dz-duration-fast)]',
    '[transition-timing-function:var(--dz-ease-default)]',
  ].join(' '),
  variants: {
    expanded: {
      true: 'rotate-180',
    },
  },
})

/** Body content padding. */
export const panelBodyVariants = tv({
  base: [
    'dz-panel__body',
    'px-[var(--dz-panel-padding-x)]',
    'py-[var(--dz-panel-padding-y)]',
  ].join(' '),
})

/** Variant prop types extracted from the tv() definition */
export type PanelVariantProps = VariantProps<typeof panelVariants>

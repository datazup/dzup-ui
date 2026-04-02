import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

/**
 * Card variant definitions using tailwind-variants (tv).
 *
 * Token-only styling (ADR-04): all colors reference CSS custom properties.
 * Surface-like variant taxonomy: elevated | outlined | flat.
 */
export const cardVariants = tv({
  base: [
    'relative',
    'rounded-[var(--dz-card-radius)]',
    'text-[var(--dz-card-foreground)]',
    'transition-shadow',
    '[transition-duration:var(--dz-duration-fast)]',
    '[transition-timing-function:var(--dz-ease-default)]',
    '[contain:layout_style]',
  ].join(' '),
  variants: {
    variant: {
      elevated: [
        'bg-[var(--dz-card)]',
        'shadow-[var(--dz-shadow-md)]',
      ].join(' '),
      outlined: [
        'bg-[var(--dz-card)]',
        'border',
        'border-[var(--dz-card-border-color)]',
      ].join(' '),
      flat: [
        'bg-[var(--dz-card)]',
      ].join(' '),
    },
    padding: {
      none: 'p-0',
      sm: 'p-[var(--dz-spacing-3)]',
      md: 'p-[var(--dz-card-padding)]',
      lg: 'p-[var(--dz-spacing-8)]',
    },
    hoverable: {
      true: 'hover:shadow-[var(--dz-shadow-lg)] cursor-pointer',
    },
    clickable: {
      true: [
        'cursor-pointer',
        'focus-visible:outline-none',
        'focus-visible:ring-2',
        'focus-visible:ring-[var(--dz-ring)]',
        'focus-visible:ring-offset-2',
      ].join(' '),
    },
  },
  defaultVariants: {
    variant: 'elevated',
    padding: 'md',
  },
})

/** Type-safe variant props derived from the tv() definition. */
export type CardVariantProps = VariantProps<typeof cardVariants>

/**
 * Card header variant definitions.
 */
export const cardHeaderVariants = tv({
  base: [
    'flex items-center justify-between',
    'px-[var(--dz-card-padding)]',
    'pt-[var(--dz-card-padding)]',
    'pb-[var(--dz-spacing-2)]',
  ].join(' '),
})

/**
 * Card body variant definitions.
 */
export const cardBodyVariants = tv({
  base: [
    'px-[var(--dz-card-padding)]',
    'py-[var(--dz-spacing-2)]',
  ].join(' '),
})

/**
 * Card footer variant definitions.
 */
export const cardFooterVariants = tv({
  base: [
    'flex items-center',
    'px-[var(--dz-card-padding)]',
    'pt-[var(--dz-spacing-2)]',
    'pb-[var(--dz-card-padding)]',
  ].join(' '),
})

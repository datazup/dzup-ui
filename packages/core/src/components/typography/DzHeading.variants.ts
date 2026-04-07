/**
 * DzHeading — Variant definitions using tailwind-variants (tv).
 *
 * Token-only styling: all colors reference CSS custom properties from @dzup-ui/tokens.
 */
import { tv } from 'tailwind-variants'

export const headingVariants = tv({
  base: 'text-[var(--dz-foreground)] font-[var(--dz-font-sans)] m-0',
  variants: {
    size: {
      'xs': 'text-[length:var(--dz-text-sm)] font-semibold leading-[var(--dz-leading-snug)] tracking-[var(--dz-tracking-tight)]',
      'sm': 'text-[length:var(--dz-text-base)] font-semibold leading-[var(--dz-leading-snug)] tracking-[var(--dz-tracking-tight)]',
      'md': 'text-[length:var(--dz-text-lg)] font-semibold leading-[var(--dz-leading-snug)] tracking-[var(--dz-tracking-tight)]',
      'lg': 'text-[length:var(--dz-text-xl)] font-semibold leading-[var(--dz-leading-tight)] tracking-[var(--dz-tracking-tight)]',
      'xl': 'text-[length:var(--dz-text-2xl)] font-bold leading-[var(--dz-leading-tight)] tracking-[var(--dz-tracking-tight)]',
      '2xl': 'text-[length:var(--dz-text-3xl)] font-bold leading-[var(--dz-leading-tight)] tracking-[var(--dz-tracking-tight)]',
      '3xl': 'text-[length:var(--dz-text-4xl)] font-bold leading-[var(--dz-leading-tight)] tracking-[var(--dz-tracking-tighter)]',
      '4xl': 'text-[length:var(--dz-text-5xl)] font-bold leading-[var(--dz-leading-none)] tracking-[var(--dz-tracking-tighter)]',
    },
    weight: {
      light: 'font-[var(--dz-font-light)]',
      normal: 'font-[var(--dz-font-normal)]',
      medium: 'font-[var(--dz-font-medium)]',
      semibold: 'font-[var(--dz-font-semibold)]',
      bold: 'font-[var(--dz-font-bold)]',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    },
    truncate: {
      true: 'truncate',
      false: '',
    },
  },
  defaultVariants: {
    size: 'lg',
    truncate: false,
  },
})

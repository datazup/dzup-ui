/**
 * DzText — Variant definitions using tailwind-variants (tv).
 *
 * Token-only styling: all colors reference CSS custom properties from @dzup-ui/tokens.
 */
import { tv } from 'tailwind-variants'

export const textVariants = tv({
  base: 'font-[var(--dz-font-sans)] m-0',
  variants: {
    size: {
      xs: 'text-[length:var(--dz-text-xs)] leading-[var(--dz-leading-normal)]',
      sm: 'text-[length:var(--dz-text-sm)] leading-[var(--dz-leading-normal)]',
      md: 'text-[length:var(--dz-text-base)] leading-[var(--dz-leading-normal)]',
      lg: 'text-[length:var(--dz-text-lg)] leading-[var(--dz-leading-relaxed)]',
      xl: 'text-[length:var(--dz-text-xl)] leading-[var(--dz-leading-relaxed)]',
    },
    tone: {
      default: 'text-[var(--dz-foreground)]',
      muted: 'text-[var(--dz-muted-foreground)]',
      success: 'text-[var(--dz-success)]',
      warning: 'text-[var(--dz-warning)]',
      danger: 'text-[var(--dz-danger)]',
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
    size: 'md',
    tone: 'default',
    truncate: false,
  },
})

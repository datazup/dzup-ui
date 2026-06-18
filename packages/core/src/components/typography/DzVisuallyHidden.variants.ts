/**
 * DzVisuallyHidden — Variant definitions using tailwind-variants (tv).
 *
 * The `base` is the audited clip-rect + 1px hiding technique. Unlike
 * `display:none` or `visibility:hidden`, this keeps the content in the
 * accessibility tree so it is announced by screen readers and contributes to
 * accessible-name computation.
 *
 * No design tokens are referenced — see DzVisuallyHidden.tokens.ts for why this
 * primitive is intentionally token-free (it has no visual surface to theme).
 */
import { tv } from 'tailwind-variants'

export const visuallyHiddenVariants = tv({
  // `sr-only` expands to the standard clip technique:
  //   position:absolute; width:1px; height:1px; padding:0; margin:-1px;
  //   overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0;
  base: 'sr-only',
  variants: {
    focusable: {
      // `not-sr-only` restores normal rendering (static position, in place) so
      // the content appears where it sits in the document when focused. Applied
      // both on direct focus and on `focus-within` so a focusable descendant
      // (e.g. an anchor in a skip link) reveals the wrapper too.
      true: 'focus:not-sr-only focus-within:not-sr-only',
      false: '',
    },
  },
  defaultVariants: {
    focusable: false,
  },
})

export type VisuallyHiddenVariantProps = Parameters<typeof visuallyHiddenVariants>[0]

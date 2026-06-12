/**
 * DzFloatLabel — tailwind-variants (tv) style definitions.
 *
 * Styles the relative wrapper and the absolutely-positioned label that floats
 * from a resting (placeholder) position to a caption position when the slotted
 * control is focused or filled. All values reference `--dz-float-label-*` tokens
 * (see styles/base.css); no raw colors (ADR-04). The float transition is CSS
 * only and disabled under `prefers-reduced-motion`.
 *
 * @module @dzup-ui/core/components/forms/DzFloatLabel.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const floatLabelVariants = tv({
  slots: {
    root: 'dz-float-label relative inline-flex w-full flex-col',
    label: [
      'pointer-events-none absolute z-[1] origin-top-left',
      'left-[var(--dz-float-label-padding-x)]',
      'max-w-[calc(100%-2*var(--dz-float-label-padding-x))] truncate',
      'text-[var(--dz-float-label-color)]',
      'transition-all duration-[var(--dz-float-label-duration)] ease-out',
      'motion-reduce:transition-none',
    ].join(' '),
  },
  variants: {
    variant: {
      over: {},
      in: {},
      on: {},
    },
    floated: {
      true: { label: 'text-[var(--dz-float-label-active-color)]' },
      false: {},
    },
  },
  compoundVariants: [
    // ── Rest position — identical across variants (placeholder-like) ──
    {
      floated: false,
      class: {
        label: 'top-1/2 -translate-y-1/2 text-[length:var(--dz-float-label-rest-font-size)]',
      },
    },
    // ── Floated — `over`: rises above the control ──
    {
      variant: 'over',
      floated: true,
      class: {
        label: 'top-0 -translate-y-[calc(100%+var(--dz-float-label-gap))] text-[length:var(--dz-float-label-float-font-size)]',
      },
    },
    // ── Floated — `in`: shrinks to the top inside the control ──
    {
      variant: 'in',
      floated: true,
      class: {
        label: 'top-[var(--dz-float-label-gap)] translate-y-0 text-[length:var(--dz-float-label-float-font-size)]',
      },
    },
    // ── Floated — `on`: sits on the top border, masked by a background ──
    {
      variant: 'on',
      floated: true,
      class: {
        label: 'top-0 -translate-y-1/2 px-[var(--dz-float-label-gap)] bg-[var(--dz-float-label-bg)] text-[length:var(--dz-float-label-float-font-size)]',
      },
    },
  ],
})

/** Variant prop types extracted from the tv() definition */
export type FloatLabelVariantProps = VariantProps<typeof floatLabelVariants>

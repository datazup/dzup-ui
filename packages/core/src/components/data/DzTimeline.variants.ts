/**
 * DzTimeline + DzTimelineItem — tailwind-variants (tv) style definitions.
 *
 * Uses semantic CSS token variables exclusively (ADR-04).
 *
 * @module @dzip-ui/core/components/data/DzTimeline.variants
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const timelineVariants = tv({
  slots: {
    root: 'relative',
    item: 'relative flex',
    indicator: [
      'flex items-center justify-center rounded-full',
      'bg-[var(--dz-muted)] border-[length:2px] border-[var(--dz-background)]',
      'z-10',
    ].join(' '),
    connector: 'bg-[var(--dz-border)]',
    content: 'flex-1',
    status: 'text-[var(--dz-muted-foreground)]',
  },

  variants: {
    size: {
      xs: {
        indicator: 'h-[var(--dz-spacing-4)] w-[var(--dz-spacing-4)]',
        content: 'text-[length:var(--dz-text-xs)]',
        status: 'text-[length:var(--dz-text-xs)]',
      },
      sm: {
        indicator: 'h-[var(--dz-spacing-5)] w-[var(--dz-spacing-5)]',
        content: 'text-[length:var(--dz-text-sm)]',
        status: 'text-[length:var(--dz-text-xs)]',
      },
      md: {
        indicator: 'h-[var(--dz-spacing-6)] w-[var(--dz-spacing-6)]',
        content: 'text-[length:var(--dz-text-sm)]',
        status: 'text-[length:var(--dz-text-sm)]',
      },
      lg: {
        indicator: 'h-[var(--dz-spacing-7)] w-[var(--dz-spacing-7)]',
        content: 'text-[length:var(--dz-text-base)]',
        status: 'text-[length:var(--dz-text-sm)]',
      },
      xl: {
        indicator: 'h-[var(--dz-spacing-8)] w-[var(--dz-spacing-8)]',
        content: 'text-[length:var(--dz-text-lg)]',
        status: 'text-[length:var(--dz-text-sm)]',
      },
    },

    orientation: {
      vertical: {
        root: 'flex flex-col',
        item: 'flex-row gap-[var(--dz-spacing-3)] pb-[var(--dz-spacing-6)] last:pb-0',
        connector: 'absolute w-[2px] left-[calc(var(--dz-spacing-3)-1px)] top-[var(--dz-spacing-6)] bottom-0',
      },
      horizontal: {
        root: 'flex flex-row',
        item: 'flex-col items-center gap-[var(--dz-spacing-2)] flex-1',
        connector: 'absolute h-[2px] top-[calc(var(--dz-spacing-3)-1px)] left-[calc(50%+var(--dz-spacing-4))] right-[calc(-50%+var(--dz-spacing-4))]',
      },
    },
  },

  defaultVariants: {
    size: 'md',
    orientation: 'vertical',
  },
})

/** Variant prop types extracted from the tv() definition */
export type TimelineVariantProps = VariantProps<typeof timelineVariants>

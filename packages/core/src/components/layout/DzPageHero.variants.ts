/**
 * DzPageHero -- tailwind-variants style definitions (ADR-04 token-only).
 */

import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export const pageHeroVariants = tv({
  base: [
    'dz-page-hero',
    'relative isolate flex flex-wrap items-end justify-between overflow-hidden',
    'gap-[var(--dz-page-hero-gap)] rounded-[var(--dz-page-hero-radius)] p-[var(--dz-page-hero-padding)]',
    '[background:var(--dz-page-hero-bg)]',
    "after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:content-['']",
    'after:[background:var(--dz-page-hero-overlay)]',
    'after:[background-position:center] after:[background-size:auto,auto,2rem_2rem,2rem_2rem]',
    'max-sm:flex-col max-sm:items-stretch',
  ],
})

export const pageHeroBodyVariants = tv({ base: 'dz-page-hero__body min-w-0' })

export const pageHeroEyebrowVariants = tv({
  base: [
    'dz-page-hero__eyebrow',
    'mb-[var(--dz-spacing-2)] text-[0.6875rem] font-bold uppercase leading-[1.4] tracking-[0.12em]',
    'text-[var(--dz-page-hero-eyebrow-foreground)]',
  ],
})

export const pageHeroTitleVariants = tv({
  base: [
    'dz-page-hero__title',
    // background-image (not the `background` shorthand): the shorthand resets
    // background-clip to border-box, defeating bg-clip-text in consumer builds.
    'bg-clip-text text-transparent [background-image:var(--dz-page-hero-title-gradient)]',
    '[font-size:var(--dz-page-hero-title-size)] leading-[1.05] tracking-[-0.045em]',
  ],
})

export const pageHeroDescVariants = tv({
  base: [
    'dz-page-hero__desc',
    'mt-[var(--dz-spacing-2)] max-w-[60ch] text-[0.9375rem] leading-[1.55]',
    'text-[var(--dz-page-hero-desc-foreground)]',
  ],
})

export const pageHeroMetaVariants = tv({
  base: [
    'dz-page-hero__meta',
    'mt-[var(--dz-spacing-4)] flex flex-wrap items-center gap-[var(--dz-spacing-3)]',
    'text-[0.8125rem] text-[var(--dz-page-hero-meta-foreground)]',
  ],
})

export const pageHeroActionsVariants = tv({
  base: [
    'dz-page-hero__actions flex shrink-0 flex-wrap gap-[var(--dz-spacing-2)]',
    '[&_button]:border [&_button]:[border-color:var(--dz-page-hero-action-border)]',
    '[&_button]:[background:var(--dz-page-hero-action-bg)]',
    '[&_button]:[color:var(--dz-page-hero-action-foreground)]',
    '[&_button]:backdrop-blur-[8px]',
    '[&_button]:[box-shadow:var(--dz-page-hero-action-shadow)]',
    '[&_button:hover]:[background:var(--dz-page-hero-action-bg-hover)]',
  ],
})

export type PageHeroVariantProps = VariantProps<typeof pageHeroVariants>

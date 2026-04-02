/**
 * Typography family — public exports.
 */

export type {
  DzBlockquoteProps,
  DzBlockquoteSlots,
} from './DzBlockquote.types.ts'
export { type BlockquoteVariantProps, blockquoteVariants } from './DzBlockquote.variants.ts'

// ── DzBlockquote ──
export { default as DzBlockquote } from './DzBlockquote.vue'

export type {
  CaptionTone,
  DzCaptionProps,
  DzCaptionSlots,
} from './DzCaption.types.ts'

export { type CaptionVariantProps, captionVariants } from './DzCaption.variants.ts'
// ── DzCaption ──
export { default as DzCaption } from './DzCaption.vue'

export type {
  CodeVariant,
  DzCodeProps,
  DzCodeSlots,
} from './DzCode.types.ts'
export { type CodeVariantProps, codeVariants } from './DzCode.variants.ts'

// ── DzCode ──
export { default as DzCode } from './DzCode.vue'

// Tokens
export { headingTokens } from './DzHeading.tokens.ts'

// Types
export type {
  DzHeadingProps,
  DzHeadingSlots,
  HeadingAlign,
  HeadingLevel,
  HeadingSize,
  HeadingWeight,
} from './DzHeading.types.ts'

// Variants
export { headingVariants } from './DzHeading.variants.ts'

// Components
export { default as DzHeading } from './DzHeading.vue'

export { textTokens } from './DzText.tokens.ts'

export type {
  DzTextProps,
  DzTextSlots,
  TextAlign,
  TextElement,
  TextSize,
  TextTone,
  TextWeight,
} from './DzText.types.ts'

export { textVariants } from './DzText.variants.ts'

export { default as DzText } from './DzText.vue'

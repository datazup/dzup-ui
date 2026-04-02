/**
 * Media family — public exports.
 */

export type {
  AvatarShape,
  DzAvatarEmits,
  DzAvatarGroupContext,
  DzAvatarProps,
  DzAvatarSlots,
} from './DzAvatar.types.ts'

export { DZ_AVATAR_GROUP_KEY } from './DzAvatar.types.ts'

export { type AvatarVariantProps, avatarVariants } from './DzAvatar.variants.ts'

// ── DzAvatar ──
export { default as DzAvatar } from './DzAvatar.vue'

export type {
  DzAvatarGroupProps,
  DzAvatarGroupSlots,
} from './DzAvatarGroup.types.ts'

export {
  type AvatarGroupOverflowVariantProps,
  avatarGroupOverflowVariants,
  type AvatarGroupVariantProps,
  avatarGroupVariants,
} from './DzAvatarGroup.variants.ts'

// ── DzAvatarGroup ──
export { default as DzAvatarGroup } from './DzAvatarGroup.vue'

export type {
  CarouselOrientation,
  DzCarouselContext,
  DzCarouselDotsProps,
  DzCarouselDotsSlots,
  DzCarouselEmits,
  DzCarouselNavProps,
  DzCarouselNavSlots,
  DzCarouselProps,
  DzCarouselSlideProps,
  DzCarouselSlideSlots,
  DzCarouselSlots,
} from './DzCarousel.types.ts'

export { DZ_CAROUSEL_KEY } from './DzCarousel.types.ts'

export { type CarouselVariantProps, carouselVariants } from './DzCarousel.variants.ts'

// ── DzCarousel ──
export { default as DzCarousel } from './DzCarousel.vue'

export { default as DzCarouselDots } from './DzCarouselDots.vue'

export { default as DzCarouselNext } from './DzCarouselNext.vue'

export { default as DzCarouselPrevious } from './DzCarouselPrevious.vue'

export { default as DzCarouselSlide } from './DzCarouselSlide.vue'
// Tokens
export { iconTokens } from './DzIcon.tokens.ts'
// Types
export type {
  DzIconProps,
  DzIconSlots,
  IconSize,
} from './DzIcon.types.ts'
// Variants
export { defaultStrokeWidth, iconVariants } from './DzIcon.variants.ts'
// Components
export { default as DzIcon } from './DzIcon.vue'

export type {
  DzImageEmits,
  DzImageProps,
  DzImageSlots,
} from './DzImage.types.ts'

export { type ImageVariantProps, imageVariants } from './DzImage.variants.ts'
// ── DzImage ──
export { default as DzImage } from './DzImage.vue'

export type {
  DzLightboxEmits,
  DzLightboxProps,
  DzLightboxSlots,
  LightboxImage,
} from './DzLightbox.types.ts'

export { type LightboxVariantProps, lightboxVariants } from './DzLightbox.variants.ts'

// ── DzLightbox ──
export { default as DzLightbox } from './DzLightbox.vue'

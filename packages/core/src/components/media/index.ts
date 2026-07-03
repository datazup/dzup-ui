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

// ── DzEmoji ──
export { emojiTokens } from './DzEmoji.tokens.ts'

export type {
  DzEmojiProps,
  DzEmojiSlots,
  EmojiSize,
} from './DzEmoji.types.ts'

export { type EmojiVariantProps, emojiVariants } from './DzEmoji.variants.ts'

export { default as DzEmoji } from './DzEmoji.vue'

export type {
  DzImageEmits,
  DzImageProps,
  DzImageSlots,
} from './DzImage.types.ts'

export { type ImageVariantProps, imageVariants } from './DzImage.variants.ts'
// ── DzImage ──
export { default as DzImage } from './DzImage.vue'

export { imageComparisonTokens } from './DzImageComparison.tokens.ts'

export type {
  DzImageComparisonEmits,
  DzImageComparisonProps,
  DzImageComparisonSlots,
  ImageComparisonOrientation,
} from './DzImageComparison.types.ts'

export {
  type ImageComparisonVariantProps,
  imageComparisonVariants,
} from './DzImageComparison.variants.ts'

// ── DzImageComparison ──
export { default as DzImageComparison } from './DzImageComparison.vue'

export type {
  DzLightboxEmits,
  DzLightboxProps,
  DzLightboxSlots,
  LightboxImage,
} from './DzLightbox.types.ts'

export { type LightboxVariantProps, lightboxVariants } from './DzLightbox.variants.ts'

// ── DzLightbox ──
export { default as DzLightbox } from './DzLightbox.vue'

export { qrCodeTokens } from './DzQRCode.tokens.ts'

export type {
  DzQRCodeEmits,
  DzQRCodeProps,
  DzQRCodeSlots,
  DzQRErrorLevel,
  DzQRStatus,
} from './DzQRCode.types.ts'

export { type QRCodeVariantProps, qrCodeVariants } from './DzQRCode.variants.ts'

// ── DzQRCode ──
export { default as DzQRCode } from './DzQRCode.vue'

export { watermarkTokens } from './DzWatermark.tokens.ts'

export type {
  DzWatermarkProps,
  DzWatermarkSlots,
} from './DzWatermark.types.ts'

export { type WatermarkVariantProps, watermarkVariants } from './DzWatermark.variants.ts'

// ── DzWatermark ──
export { default as DzWatermark } from './DzWatermark.vue'

/**
 * DzCarousel — type definitions for the compound Carousel family.
 *
 * Built from scratch. Context injection via DZ_CAROUSEL_KEY (ADR-08).
 *
 * @module @dzip-ui/core/components/media/DzCarousel
 */

import type {
  BaseAccessibilityProps,
  CanonicalSize,
} from '@dzip-ui/contracts'
import type { InjectionKey, Ref } from 'vue'

// ---------------------------------------------------------------------------
// Direction type
// ---------------------------------------------------------------------------

/** Carousel scroll orientation */
export type CarouselOrientation = 'horizontal' | 'vertical'

// ---------------------------------------------------------------------------
// Context (ADR-08)
// ---------------------------------------------------------------------------

/** Context provided to carousel children via inject */
export interface DzCarouselContext {
  /** Total number of slides */
  slideCount: Ref<number>
  /** Current active slide index */
  activeIndex: Ref<number>
  /** Orientation */
  orientation: Ref<CarouselOrientation>
  /** Component size */
  size: Ref<CanonicalSize>
  /** Whether loop is enabled */
  loop: Ref<boolean>
  /** Navigate to a specific slide */
  goTo: (index: number) => void
  /** Navigate to previous slide */
  prev: () => void
  /** Navigate to next slide */
  next: () => void
  /** Register a slide (returns unregister function) */
  registerSlide: () => () => void
  /** Whether previous navigation is possible */
  canPrev: Ref<boolean>
  /** Whether next navigation is possible */
  canNext: Ref<boolean>
}

/** Typed injection key for DzCarousel context (ADR-08, SCREAMING_SNAKE) */
export const DZ_CAROUSEL_KEY: InjectionKey<DzCarouselContext> = Symbol('dz-carousel')

// ---------------------------------------------------------------------------
// DzCarousel (Root) Props
// ---------------------------------------------------------------------------

/** Props for the DzCarousel root component */
export interface DzCarouselProps extends BaseAccessibilityProps {
  /** Scroll orientation */
  orientation?: CarouselOrientation
  /** Whether to auto-advance slides */
  autoplay?: boolean
  /** Auto-advance interval in milliseconds */
  interval?: number
  /** Whether to loop back to start when reaching end */
  loop?: boolean
  /** Component size */
  size?: CanonicalSize
  /** Disabled state */
  disabled?: boolean
}

// ---------------------------------------------------------------------------
// DzCarousel Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzCarousel */
export interface DzCarouselEmits {
  /** Emitted when the active slide changes */
  'update:modelValue': [index: number]
  /** Emitted when the slide changes (alias for semantic clarity) */
  'slideChange': [index: number]
}

// ---------------------------------------------------------------------------
// DzCarousel Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzCarousel */
export interface DzCarouselSlots {
  /** Carousel slides, navigation, and dots */
  default: () => unknown
}

// ---------------------------------------------------------------------------
// DzCarouselSlide Props
// ---------------------------------------------------------------------------

/** Props for the DzCarouselSlide component */
export interface DzCarouselSlideProps {
  /** Additional class for the slide */
  class?: string
}

/** Slot definitions for DzCarouselSlide */
export interface DzCarouselSlideSlots {
  /** Slide content */
  default: () => unknown
}

// ---------------------------------------------------------------------------
// DzCarouselPrevious / DzCarouselNext Props
// ---------------------------------------------------------------------------

/** Props for navigation button components */
export interface DzCarouselNavProps {
  /** Additional class */
  class?: string
}

/** Slot definitions for navigation button components */
export interface DzCarouselNavSlots {
  /** Custom navigation button content */
  default?: () => unknown
}

// ---------------------------------------------------------------------------
// DzCarouselDots Props
// ---------------------------------------------------------------------------

/** Props for the DzCarouselDots component */
export interface DzCarouselDotsProps {
  /** Additional class */
  class?: string
}

/** Slot definitions for DzCarouselDots */
export interface DzCarouselDotsSlots {
  /** Custom dot renderer */
  default?: (props: { index: number, active: boolean }) => unknown
}

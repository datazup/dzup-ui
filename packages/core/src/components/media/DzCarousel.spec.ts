import { mount } from '@vue/test-utils'
/**
 * DzCarousel (compound) — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzCarousel from './DzCarousel.vue'
import DzCarouselDots from './DzCarouselDots.vue'
import DzCarouselNext from './DzCarouselNext.vue'
import DzCarouselPrevious from './DzCarouselPrevious.vue'
import DzCarouselSlide from './DzCarouselSlide.vue'

function mountCarousel(carouselProps = {}) {
  return mount(DzCarousel, {
    props: { ...carouselProps },
    slots: {
      default: () => [
        h(DzCarouselSlide, null, { default: () => 'Slide 1' }),
        h(DzCarouselSlide, null, { default: () => 'Slide 2' }),
        h(DzCarouselSlide, null, { default: () => 'Slide 3' }),
        h(DzCarouselPrevious),
        h(DzCarouselNext),
        h(DzCarouselDots),
      ],
    },
  })
}

describe('dzCarousel', () => {
  it('renders successfully', () => {
    const wrapper = mountCarousel()
    expect(wrapper.exists()).toBe(true)
  })

  it('has role="region" and aria-roledescription', () => {
    const wrapper = mountCarousel()
    const root = wrapper.find('[role="region"]')
    expect(root.exists()).toBe(true)
    expect(root.attributes('aria-roledescription')).toBe('carousel')
  })

  it('has contain: layout style', () => {
    const wrapper = mountCarousel()
    expect(wrapper.find('[role="region"]').attributes('style')).toContain('contain: layout style')
  })

  it('renders slide content', () => {
    const wrapper = mountCarousel()
    expect(wrapper.text()).toContain('Slide 1')
  })

  it('renders previous and next buttons', () => {
    const wrapper = mountCarousel()
    expect(wrapper.find('[aria-label="Previous slide"]').exists()).toBe(true)
    expect(wrapper.find('[aria-label="Next slide"]').exists()).toBe(true)
  })

  it('forwards aria-label', () => {
    const wrapper = mountCarousel({ ariaLabel: 'Image gallery' })
    expect(wrapper.find('[role="region"]').attributes('aria-label')).toBe('Image gallery')
  })

  it('applies default aria-label', () => {
    const wrapper = mountCarousel()
    expect(wrapper.find('[role="region"]').attributes('aria-label')).toBe('Carousel')
  })

  it('sets data-disabled when disabled', () => {
    const wrapper = mountCarousel({ disabled: true })
    expect(wrapper.find('[role="region"]').attributes('data-disabled')).toBe('')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzCarousel, {
      attrs: { class: 'my-carousel' },
      slots: {
        default: () => h(DzCarouselSlide, null, { default: () => 'Slide' }),
      },
    })
    expect(wrapper.find('[role="region"]').classes()).toContain('my-carousel')
  })

  it('renders slide with aria-roledescription', () => {
    const wrapper = mountCarousel()
    const slides = wrapper.findAll('[aria-roledescription="slide"]')
    expect(slides.length).toBe(3)
  })
})

describe('dzCarouselDots', () => {
  it('renders dot navigation', () => {
    const wrapper = mountCarousel()
    const tablist = wrapper.find('[role="tablist"]')
    expect(tablist.exists()).toBe(true)
  })
})

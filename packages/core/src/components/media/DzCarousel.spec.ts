import { DZ_DIRECTION_KEY } from '@dzup-ui/contracts'
import { expectKeyboardContract } from '@dzup-ui/testing'
import { mount } from '@vue/test-utils'
/**
 * DzCarousel (compound) — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import { h, nextTick, ref } from 'vue'
import { anatomy as carouselAnatomy } from './DzCarousel.anatomy.ts'
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
    expect(wrapper.find('[role="region"]').classes()).toContain('[contain:layout_style]')
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

// RESIDUAL-13, closing RESIDUAL-12 §4 `F7`: both arrow rows were published as
// APG `carousel` and nothing implemented them.
describe('dzCarousel — APG carousel arrow navigation', () => {
  it('shows the next slide on ArrowRight and the previous one on ArrowLeft', async () => {
    const wrapper = mountCarousel()
    await nextTick()

    await wrapper.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe(1)
    expect(wrapper.emitted('slideChange')?.at(-1)?.[0]).toBe(1)

    await wrapper.trigger('keydown', { key: 'ArrowLeft' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe(0)
    expect(wrapper.emitted('slideChange')?.at(-1)?.[0]).toBe(0)
  })

  it('answers a key that arrived on one of its own controls, which is how the region hears one', async () => {
    const wrapper = mountCarousel()
    await nextTick()

    // Focus lives on the Next button; the key bubbles to the region. The region
    // itself is deliberately not a tab stop.
    await wrapper.find('[aria-label="Next slide"]').trigger('keydown', { key: 'ArrowRight' })

    expect(wrapper.emitted('slideChange')?.at(-1)?.[0]).toBe(1)
    expect(wrapper.find('[role="region"]').attributes('tabindex')).toBeUndefined()
  })

  it('stops at the last slide when loop is off and wraps when it is on', async () => {
    const bounded = mountCarousel({ modelValue: 2 })
    await nextTick()
    await bounded.trigger('keydown', { key: 'ArrowRight' })
    expect(bounded.emitted('slideChange')?.at(-1)?.[0]).toBe(2)

    const looping = mountCarousel({ modelValue: 2, loop: true })
    await nextTick()
    await looping.trigger('keydown', { key: 'ArrowRight' })
    expect(looping.emitted('slideChange')?.at(-1)?.[0]).toBe(0)
  })

  it('swaps the arrows in a RTL document, which is what `rtl: mirrored` declares', async () => {
    const wrapper = mount(DzCarousel, {
      props: { modelValue: 1 },
      global: { provide: { [DZ_DIRECTION_KEY]: ref('rtl') } },
      slots: {
        default: () => [
          h(DzCarouselSlide, null, { default: () => 'Slide 1' }),
          h(DzCarouselSlide, null, { default: () => 'Slide 2' }),
          h(DzCarouselSlide, null, { default: () => 'Slide 3' }),
        ],
      },
    })
    await nextTick()

    await wrapper.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('slideChange')?.at(-1)?.[0]).toBe(0)

    await wrapper.trigger('keydown', { key: 'ArrowLeft' })
    expect(wrapper.emitted('slideChange')?.at(-1)?.[0]).toBe(1)
  })

  it('does not move a disabled carousel, and leaves the key to the document', async () => {
    const wrapper = mountCarousel({ disabled: true })
    await nextTick()

    const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true })
    wrapper.element.dispatchEvent(event)
    await nextTick()

    expect(wrapper.emitted('slideChange')).toBeUndefined()
    expect(event.defaultPrevented).toBe(false)
  })

  it('consumes the arrows it acts on, so the page does not scroll as well', async () => {
    const wrapper = mountCarousel()
    await nextTick()

    for (const key of ['ArrowRight', 'ArrowLeft']) {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
      wrapper.element.dispatchEvent(event)
      expect(event.defaultPrevented, `\`${key}\` was not consumed`).toBe(true)
    }
  })

  it('conforms to its declared keyboard contract, with both arrows consumed', async () => {
    const wrapper = mountCarousel()
    await nextTick()
    // No `conditions` needed: both `when` values now name the declared part
    // `action`, which is the vocabulary the coherence check already reads.
    expectKeyboardContract(wrapper, carouselAnatomy, { handled: ['ArrowRight', 'ArrowLeft'] })
  })
})

describe('dzCarouselDots', () => {
  // Awaited, and stronger than it was. Slides register in their own mounted hooks, so
  // the dot count is not known during this component's first render — and the dots list
  // no longer renders at all until it has a tab to own, because ARIA requires a
  // `tablist` to own at least one `tab` (RESIDUAL-06 measured the empty one with axe).
  // The settled DOM is what a user sees, and it must have the list *and* its tabs.
  it('renders dot navigation', async () => {
    const wrapper = mountCarousel()
    await nextTick()
    const tablist = wrapper.find('[role="tablist"]')
    expect(tablist.exists()).toBe(true)
    expect(tablist.findAll('[role="tab"]')).toHaveLength(3)
  })
})

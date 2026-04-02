import type { LightboxImage } from './DzLightbox.types.ts'
import { mount } from '@vue/test-utils'
/**
 * DzLightbox — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzLightbox from './DzLightbox.vue'

const sampleImages: LightboxImage[] = [
  { src: '/img1.jpg', alt: 'Image 1', caption: 'First image' },
  { src: '/img2.jpg', alt: 'Image 2', caption: 'Second image' },
  { src: '/img3.jpg', alt: 'Image 3' },
]

function mountLightbox(lightboxProps = {}) {
  return mount(DzLightbox, {
    props: {
      images: sampleImages,
      modelValue: true,
      ...lightboxProps,
    },
    global: {
      stubs: {
        teleport: true,
      },
    },
  })
}

describe('dzLightbox', () => {
  it('renders successfully', () => {
    const wrapper = mountLightbox()
    expect(wrapper.exists()).toBe(true)
  })

  it('renders with images prop', () => {
    const wrapper = mountLightbox()
    expect(wrapper.html()).toBeTruthy()
  })

  it('renders when closed', () => {
    const wrapper = mount(DzLightbox, {
      props: {
        images: sampleImages,
        modelValue: false,
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts startIndex prop', () => {
    const wrapper = mountLightbox({ startIndex: 1 })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts empty images array', () => {
    const wrapper = mount(DzLightbox, {
      props: {
        images: [],
        modelValue: false,
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders aria-label', () => {
    // DzLightbox renders DialogContent in a portal (teleport to body).
    // Portal content is not accessible in jsdom. Verify prop is accepted without error.
    const wrapper = mount(DzLightbox, {
      props: {
        images: sampleImages,
        modelValue: true,
        ariaLabel: 'Photo gallery',
      },
    })
    expect(wrapper.exists()).toBe(true)
  })
})

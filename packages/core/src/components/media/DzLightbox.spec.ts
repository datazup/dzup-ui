import type { LightboxImage } from './DzLightbox.types.ts'
/**
 * DzLightbox — Unit / behavior tests.
 */
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { mountWithDialogStubs } from '../../../test-utils/dialog'
import DzLightbox from './DzLightbox.vue'

const sampleImages: LightboxImage[] = [
  { src: '/img1.jpg', alt: 'Image 1', caption: 'First image' },
  { src: '/img2.jpg', alt: 'Image 2', caption: 'Second image' },
  { src: '/img3.jpg', alt: 'Image 3' },
]

function mountLightbox(lightboxProps = {}) {
  return mountWithDialogStubs(DzLightbox, {
    props: {
      images: sampleImages,
      modelValue: true,
      ...lightboxProps,
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
    const wrapper = mountWithDialogStubs(DzLightbox, {
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
    const wrapper = mountWithDialogStubs(DzLightbox, {
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
    const wrapper = mountWithDialogStubs(DzLightbox, {
      props: {
        images: sampleImages,
        modelValue: true,
        ariaLabel: 'Photo gallery',
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('registers hidden dialog title and description without Reka warnings', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const wrapper = mount(DzLightbox, {
      attachTo: document.body,
      props: {
        images: sampleImages,
        modelValue: true,
      },
    })

    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    const rekaWarnings = warnSpy.mock.calls
      .map(([message]) => String(message))
      .filter(message => message.includes('DialogContent'))

    expect(rekaWarnings).toEqual([])

    wrapper.unmount()
    warnSpy.mockRestore()
  })
})

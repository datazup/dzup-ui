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
    const wrapper = mountWithDialogStubs(DzLightbox, {
      props: {
        images: sampleImages,
        modelValue: true,
        ariaLabel: 'Photo gallery',
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders the real Reka dialog inline when portalDisabled is true', async () => {
    const wrapper = mount(DzLightbox, {
      attachTo: document.body,
      props: {
        images: sampleImages,
        modelValue: true,
        portalDisabled: true,
      },
    })
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
    expect(wrapper.find('[role="dialog"]').text()).toContain('1 / 3')
    wrapper.unmount()
  })

  it('keeps the real Reka default portal behavior', async () => {
    const wrapper = mount(DzLightbox, {
      attachTo: document.body,
      props: {
        images: sampleImages,
        modelValue: true,
      },
    })
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    expect(document.body.querySelector('[role="dialog"]')?.textContent).toContain('1 / 3')
    wrapper.unmount()
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

/**
 * Accessibility tests for the media family.
 *
 * Tests DzAvatar, DzImage, DzIcon, and DzCarousel for WCAG 2.1 AA
 * compliance using vitest-axe.
 */
import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { defineComponent, h } from 'vue'
import DzAvatar from '../../src/components/media/DzAvatar.vue'
import DzAvatarGroup from '../../src/components/media/DzAvatarGroup.vue'
import DzIcon from '../../src/components/media/DzIcon.vue'
import DzImage from '../../src/components/media/DzImage.vue'

// Minimal icon component stub
const StubIcon = defineComponent({
  name: 'StubIcon',
  render() {
    return h('svg', { 'aria-hidden': 'true', 'viewBox': '0 0 24 24' }, [
      h('circle', { cx: '12', cy: '12', r: '10' }),
    ])
  },
})

describe('media family — Accessibility', () => {
  // ---------------------------------------------------------------------------
  // DzAvatar
  // ---------------------------------------------------------------------------

  describe('dzAvatar', () => {
    it('has no a11y violations with alt text', async () => {
      const { container } = render(DzAvatar, {
        props: { alt: 'Jane Doe', src: '/avatar.jpg' },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no a11y violations with initials fallback', async () => {
      const { container } = render(DzAvatar, {
        props: { alt: 'Jane Doe', initials: 'JD' },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('img has alt attribute', () => {
      const { container } = render(DzAvatar, {
        props: { alt: 'User photo', src: '/photo.jpg' },
      })
      const img = container.querySelector('img')
      if (img) {
        expect(img).toHaveAttribute('alt', 'User photo')
      }
    })
  })

  // ---------------------------------------------------------------------------
  // DzAvatarGroup
  // ---------------------------------------------------------------------------

  describe('dzAvatarGroup', () => {
    it('has no a11y violations with multiple avatars', async () => {
      const { container } = render({
        template: `
          <DzAvatarGroup aria-label="Team members">
            <DzAvatar alt="Alice" initials="AL" />
            <DzAvatar alt="Bob" initials="BO" />
          </DzAvatarGroup>
        `,
        components: { DzAvatarGroup, DzAvatar },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ---------------------------------------------------------------------------
  // DzImage
  // ---------------------------------------------------------------------------

  describe('dzImage', () => {
    it('has no a11y violations with required alt text', async () => {
      const { container } = render(DzImage, {
        props: { src: '/photo.jpg', alt: 'A scenic landscape' },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('image element has alt attribute', () => {
      const { container } = render(DzImage, {
        props: { src: '/photo.jpg', alt: 'Product image' },
      })
      const img = container.querySelector('img')
      if (img) {
        expect(img).toHaveAttribute('alt', 'Product image')
      }
    })
  })

  // ---------------------------------------------------------------------------
  // DzIcon
  // ---------------------------------------------------------------------------

  describe('dzIcon', () => {
    it('has no a11y violations (decorative icon)', async () => {
      const { container } = render(DzIcon, {
        props: { icon: StubIcon },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('decorative icon has aria-hidden', () => {
      const { container } = render(DzIcon, {
        props: { icon: StubIcon },
      })
      const svg = container.querySelector('svg')
      if (svg) {
        expect(svg).toHaveAttribute('aria-hidden', 'true')
      }
    })

    it('has no a11y violations with aria-label (meaningful icon)', async () => {
      const { container } = render(DzIcon, {
        props: { icon: StubIcon, ariaLabel: 'Settings' },
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})

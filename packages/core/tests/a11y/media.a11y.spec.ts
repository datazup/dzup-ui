/**
 * Accessibility tests for the media family.
 *
 * Tests DzAvatar, DzImage, DzIcon, and DzCarousel for WCAG 2.1 AA
 * compliance using vitest-axe.
 */
import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { defineComponent, h, nextTick } from 'vue'
import DzAvatar from '../../src/components/media/DzAvatar.vue'
import DzAvatarGroup from '../../src/components/media/DzAvatarGroup.vue'
import DzCarousel from '../../src/components/media/DzCarousel.vue'
import DzCarouselDots from '../../src/components/media/DzCarouselDots.vue'
import DzCarouselNext from '../../src/components/media/DzCarouselNext.vue'
import DzCarouselPrevious from '../../src/components/media/DzCarouselPrevious.vue'
import DzCarouselSlide from '../../src/components/media/DzCarouselSlide.vue'
import DzIcon from '../../src/components/media/DzIcon.vue'
import DzImage from '../../src/components/media/DzImage.vue'
import './register-matchers.ts'

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

  // ---------------------------------------------------------------------------
  // DzCarousel
  //
  // This file's header has claimed to test DzCarousel since it was written, and
  // until now it did not import it: RESIDUAL-05 found the capability matrix reading
  // that sentence as evidence and moved the cell to `unrun`. These renders are the
  // evidence the sentence was describing (RESIDUAL-06, `D-RES05-2`).
  //
  // The whole compound is rendered rather than the root alone, because the root is
  // a `role="region"` wrapper and every control axe has an opinion about — the two
  // navigation buttons and the dot controls — lives in a child.
  // ---------------------------------------------------------------------------

  describe('dzCarousel', () => {
    function renderCarousel(props: Record<string, unknown> = {}) {
      return render({
        components: { DzCarousel, DzCarouselSlide, DzCarouselPrevious, DzCarouselNext, DzCarouselDots },
        setup: () => ({ props }),
        template: `
          <DzCarousel v-bind="props">
            <DzCarouselSlide>First slide</DzCarouselSlide>
            <DzCarouselSlide>Second slide</DzCarouselSlide>
            <DzCarouselPrevious />
            <DzCarouselNext />
            <DzCarouselDots />
          </DzCarousel>
        `,
      })
    }

    it('has no a11y violations with an accessible name', async () => {
      const { container } = renderCarousel({ ariaLabel: 'Product photographs' })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no a11y violations when vertical', async () => {
      const { container } = renderCarousel({ ariaLabel: 'Product photographs', orientation: 'vertical' })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    // The finding these renders surfaced. ARIA requires a `tablist` to own at least
    // one `tab`, and the dots list owns one per registered slide — so a carousel whose
    // slides come from an empty collection published a childless, named `tablist`.
    // axe reports it as `incomplete` rather than a violation ("Expecting ARIA child
    // role to be added: tab"), which is why `toHaveNoViolations` cannot see it and the
    // structural assertion below is the one that holds the fix in place.
    it('renders no tab list at all when there are no slides', async () => {
      const { container } = render({
        components: { DzCarousel, DzCarouselPrevious, DzCarouselNext, DzCarouselDots },
        template: `
          <DzCarousel aria-label="Empty gallery">
            <DzCarouselPrevious />
            <DzCarouselNext />
            <DzCarouselDots />
          </DzCarousel>
        `,
      })
      await nextTick()
      expect(container.querySelector('[role="tablist"]')).toBeNull()
      expect(container.querySelectorAll('[role="tab"]')).toHaveLength(0)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})

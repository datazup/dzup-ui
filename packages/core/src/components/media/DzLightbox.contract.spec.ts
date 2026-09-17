import { expectFallthrough } from '@dzup-ui/testing'
import { mount } from '@vue/test-utils'
/**
 * DzLightbox — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import { anatomy } from './DzLightbox.anatomy.ts'
import DzLightbox from './DzLightbox.vue'

/** Renders portaled content inline so jsdom can see it (the repo's idiom). */
const InlinePortal = { template: '<div data-testid="portal"><slot /></div>' }

const images = [
  { src: '/photo1.jpg', alt: 'Photo 1' },
  { src: '/photo2.jpg', alt: 'Photo 2' },
]

describe('dzLightbox — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzLightbox, { props: { images } })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders default slot (trigger)', () => {
    const wrapper = mount(DzLightbox, {
      props: { images },
      slots: { default: '<button data-testid="trigger">Open</button>' },
    })
    expect(wrapper.find('[data-testid="trigger"]').exists()).toBe(true)
  })

  it('merges consumer class via cn()', () => {
    // DzLightbox applies class to DialogContent which renders in a portal.
    // Portal content is not accessible via wrapper.html() or document.body in jsdom.
    // Verify that the component accepts the class prop without errors.
    const wrapper = mount(DzLightbox, {
      props: { images, modelValue: true },
      attrs: { class: 'custom-class' },
    })
    expect(wrapper.exists()).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Attribute fallthrough (TASK-R5-O6)
// ---------------------------------------------------------------------------

describe('dzLightbox — attribute fallthrough', () => {
  // Multi-root: the trigger `<slot />` the consumer fills, plus the portaled
  // dialog. The slot is never a candidate — it is the consumer's own markup,
  // and putting their attributes back onto it would be the `as-child` mistake
  // (S1-D2). So the content node is the declared target.
  //
  // The older `merges consumer class via cn()` test above asserts only that the
  // component "accepts the class prop without errors", on the belief that
  // portal content is unreachable in jsdom. It is reachable with
  // `attachTo: document.body`, which is what makes this a real assertion rather
  // than a smoke test.
  it('a consumer\'s class lands on the dialog content, not the trigger slot', () => {
    const wrapper = mount(DzLightbox, {
      props: { images, modelValue: true },
      attrs: { class: 'dz-fallthrough-probe' },
      slots: { default: '<button data-testid="trigger">Open</button>' },
      // The repo's existing idiom for reaching portaled content under jsdom
      // (DzDialog.contract.spec.ts, DzCascader.spec.ts). The older
      // `merges consumer class via cn()` test above concluded portal content
      // was unreachable and settled for "accepts the class without errors" —
      // which is also true of a component that drops the class entirely.
      global: { stubs: { DialogPortal: InlinePortal } },
      attachTo: document.body,
    })

    expectFallthrough(
      document.body,
      anatomy.fallthrough,
      { className: 'dz-fallthrough-probe' },
      'DzLightbox',
    )
    wrapper.unmount()
  })
})

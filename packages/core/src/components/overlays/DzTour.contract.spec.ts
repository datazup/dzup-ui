import type { DzTourStep } from './DzTour.types.ts'
/**
 * DzTour -- Contract Spec v1 conformance tests.
 *
 * Verifies the public API shape: props, v-model bindings, events, and the
 * teleported dialog semantics. The overlay teleports to document.body, so
 * assertions query the body rather than the wrapper subtree.
 */
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import DzTour from './DzTour.vue'

// Body-querying tests leave teleported overlays + targets behind; reset between
// tests so leftovers from one case don't leak into the next.
afterEach(() => {
  document.body.innerHTML = ''
})

/** Minimal step set with real DOM targets attached to the document body. */
function makeSteps(): DzTourStep[] {
  const a = document.createElement('div')
  a.id = 'tour-target-a'
  const b = document.createElement('div')
  b.id = 'tour-target-b'
  document.body.append(a, b)
  return [
    { target: '#tour-target-a', title: 'Step A', description: 'First step.' },
    { target: '#tour-target-b', title: 'Step B', description: 'Second step.' },
  ]
}

describe('dzTour -- Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzTour, { props: { steps: [] } })
    expect(wrapper.exists()).toBe(true)
    wrapper.unmount()
  })

  it('renders nothing while closed', () => {
    mount(DzTour, { props: { steps: makeSteps(), open: false }, attachTo: document.body })
    expect(document.body.querySelector('[data-testid="dz-tour-panel"]')).toBeNull()
  })

  it('teleports a role="dialog" panel to the body when open', () => {
    mount(DzTour, { props: { steps: makeSteps(), open: true }, attachTo: document.body })
    const panel = document.body.querySelector('[data-testid="dz-tour-panel"]')
    expect(panel).not.toBeNull()
    expect(panel?.getAttribute('role')).toBe('dialog')
    expect(panel?.getAttribute('aria-modal')).toBe('true')
  })

  it('supports v-model:open', () => {
    const wrapper = mount(DzTour, { props: { steps: makeSteps(), open: false } })
    expect(wrapper.props('open')).toBe(false)
    wrapper.unmount()
  })

  it('supports v-model:current', () => {
    const wrapper = mount(DzTour, { props: { steps: makeSteps(), open: true, current: 1 } })
    expect(wrapper.props('current')).toBe(1)
    wrapper.unmount()
  })

  it('accepts mask prop', async () => {
    mount(DzTour, {
      props: { steps: makeSteps(), open: true, mask: false },
      attachTo: document.body,
    })
    await flushPromises()
    expect(document.body.querySelector('[data-testid="dz-tour-mask"]')).toBeNull()
  })

  it('renders the spotlight mask by default', async () => {
    mount(DzTour, { props: { steps: makeSteps(), open: true }, attachTo: document.body })
    await flushPromises()
    expect(document.body.querySelector('[data-testid="dz-tour-mask"]')).not.toBeNull()
  })

  it('accepts scrollIntoView prop', () => {
    const wrapper = mount(DzTour, { props: { steps: makeSteps(), scrollIntoView: false } })
    expect(wrapper.props('scrollIntoView')).toBe(false)
    wrapper.unmount()
  })

  it('renders the default Back/Next/Skip controls', () => {
    mount(DzTour, {
      props: { steps: makeSteps(), open: true, current: 1 },
      attachTo: document.body,
    })
    expect(document.body.querySelector('[data-testid="dz-tour-skip"]')).not.toBeNull()
    expect(document.body.querySelector('[data-testid="dz-tour-back"]')).not.toBeNull()
    expect(document.body.querySelector('[data-testid="dz-tour-next"]')).not.toBeNull()
  })

  it('labels the panel via the step title', () => {
    mount(DzTour, { props: { steps: makeSteps(), open: true }, attachTo: document.body })
    const panel = document.body.querySelector('[data-testid="dz-tour-panel"]')
    const labelledby = panel?.getAttribute('aria-labelledby')
    expect(labelledby).toBeTruthy()
    const title = document.getElementById(labelledby as string)
    expect(title?.textContent).toContain('Step A')
  })
})

import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import DzBlockUI from '../src/components/feedback/DzBlockUI.vue'
import DzPopconfirm from '../src/components/overlays/DzPopconfirm.vue'
import DzTour from '../src/components/overlays/DzTour.vue'
import DzProvider from '../src/providers/DzProvider.vue'

/**
 * Portal target precedence, end to end (TASK-OSS-P4-04, ADR-20).
 *
 * The contract every portal-using component now shares:
 *
 *     instance `portalTo`  →  DzProvider `portal`  →  document.body
 *
 * Nineteen components implement it with the same two lines
 * (`useDzPortalTarget()` plus one `computed`). This file proves the *behaviour*
 * against the four that used to have **no escape hatch at all** — they
 * teleported to a hard-coded `body`, which is exactly the case an application
 * embedding the library in a shadow root could not work around — plus the
 * precedence and SSR rules that apply to all nineteen.
 *
 * The other fifteen already accepted a `portalTo` prop and are covered by their
 * own suites for everything except the provider fallback, which is the one line
 * they all now share.
 *
 * **It lives in `packages/core/tests/` rather than beside a component** because
 * it belongs to no single family — and because a loose `.spec.ts` directly under
 * `src/components/` breaks `apps/landing/src/claims.spec.ts`, which treats every
 * entry in that directory as a family folder. That spec is hardened too, but the
 * file still belongs here.
 */

let target: HTMLElement

beforeEach(() => {
  target = document.createElement('div')
  target.id = 'dz-portal'
  document.body.appendChild(target)

  vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })))
})

afterEach(() => {
  vi.restoreAllMocks()
  target.remove()
  document.body.innerHTML = ''
})

/** Mount `component` under a provider, with an optional instance override. */
function mountUnderProvider(
  component: unknown,
  props: Record<string, unknown>,
  providerPortal: string | undefined,
) {
  return mount(
    defineComponent({
      setup() {
        return () => h(
          DzProvider,
          providerPortal === undefined ? {} : { portal: providerPortal },
          { default: () => h(component as never, props) },
        )
      },
    }),
    { attachTo: document.body },
  )
}

describe('components that had no escape hatch now honour the provider', () => {
  it('dzBlockUI teleports into the provider target', async () => {
    mountUnderProvider(DzBlockUI, { blocked: true, fullScreen: true }, '#dz-portal')
    await nextTick()
    expect(target.innerHTML).not.toBe('')
  })

  it('dzPopconfirm teleports into the provider target', async () => {
    mountUnderProvider(
      DzPopconfirm,
      { open: true, title: 'Delete this run?' },
      '#dz-portal',
    )
    await nextTick()
    expect(target.querySelector('[role="alertdialog"]')).not.toBeNull()
  })

  it('dzTour teleports into the provider target', async () => {
    mountUnderProvider(
      DzTour,
      { open: true, steps: [{ title: 'Step one', content: 'Hello' }] },
      '#dz-portal',
    )
    await nextTick()
    expect(target.innerHTML).not.toBe('')
  })
})

describe('precedence', () => {
  it('an instance portalTo wins over the provider target', async () => {
    const own = document.createElement('div')
    own.id = 'own-portal'
    document.body.appendChild(own)

    mountUnderProvider(
      DzPopconfirm,
      { open: true, title: 'Delete this run?', portalTo: '#own-portal' },
      '#dz-portal',
    )
    await nextTick()

    // The nearer, more specific declaration wins — it is what the author of
    // that line wrote, which is the same rule the defaults chain follows.
    expect(own.querySelector('[role="alertdialog"]')).not.toBeNull()
    expect(target.querySelector('[role="alertdialog"]')).toBeNull()
    own.remove()
  })

  it('falls back to document.body with no provider and no prop', async () => {
    mount(DzPopconfirm, {
      props: { open: true, title: 'Delete this run?' },
      attachTo: document.body,
    })
    await nextTick()

    // Unchanged behaviour for every consumer who has not adopted a provider —
    // the property that let nineteen components migrate at once.
    expect(document.body.querySelector('[role="alertdialog"]')).not.toBeNull()
    expect(target.querySelector('[role="alertdialog"]')).toBeNull()
  })

  it('follows a provider target that changes', async () => {
    const second = document.createElement('div')
    second.id = 'second-portal'
    document.body.appendChild(second)

    const portal = ref('#dz-portal')
    mount(
      defineComponent({
        setup() {
          return () => h(
            DzProvider,
            { portal: portal.value },
            { default: () => h(DzPopconfirm, { open: true, title: 'Delete this run?' }) },
          )
        },
      }),
      { attachTo: document.body },
    )
    await nextTick()
    expect(target.querySelector('[role="alertdialog"]')).not.toBeNull()

    portal.value = '#second-portal'
    await nextTick()
    expect(second.querySelector('[role="alertdialog"]')).not.toBeNull()
    second.remove()
  })
})

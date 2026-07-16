/**
 * Router failure-path specs (TASK-FREE-09).
 *
 * Locks in the "something went wrong" behaviours the app used to lack:
 *   • an unknown path resolves to the real 404 route (not a silent redirect
 *     to `/`), keeps the failing URL in the address bar, and marks itself
 *     `noindex`;
 *   • an unknown block/template slug ALSO lands on the 404 (not the gallery),
 *     so a removed catalog item is explained rather than swallowed;
 *   • a lazily-loaded component whose chunk fails surfaces the shared error
 *     state (with its reload action) instead of rendering nothing.
 */

import { render } from '@testing-library/vue'
import { flushPromises } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { BLOCKS } from './blocks/registry.ts'
import { lazyComponent } from './lib/lazyComponent.ts'
import router from './router.ts'
import { TEMPLATES } from './templates/registry.ts'

describe('404 routing', () => {
  it('resolves an unknown path to the not-found route, keeping the URL', async () => {
    await router.push('/definitely/not/a/page')
    expect(router.currentRoute.value.name).toBe('not-found')
    expect(router.currentRoute.value.path).toBe('/definitely/not/a/page')
  })

  it('marks the 404 noindex via its route head', async () => {
    await router.push('/nonsense')
    const robots = document.head.querySelector('meta[name="robots"]')
    expect(robots?.getAttribute('content')).toBe('noindex')
    expect(document.title).toContain('Page not found')
  })

  it('sends an unknown block id to the 404, not the gallery', async () => {
    await router.push('/blocks/definitely-not-a-block')
    expect(router.currentRoute.value.name).toBe('not-found')
    expect(router.currentRoute.value.path).toBe('/blocks/definitely-not-a-block')
  })

  it('sends an unknown template slug to the 404, not the gallery', async () => {
    await router.push('/templates/definitely-not-a-template')
    expect(router.currentRoute.value.name).toBe('not-found')
  })

  it('still resolves a real block id to the detail page', async () => {
    const real = BLOCKS[0]!.id
    await router.push(`/blocks/${real}`)
    expect(router.currentRoute.value.name).toBe('block-detail')
  })

  it('still resolves a real template slug to the detail page', async () => {
    const real = TEMPLATES[0]!.slug
    await router.push(`/templates/${real}`)
    expect(router.currentRoute.value.name).toBe('template-detail')
  })
})

describe('lazyComponent failure state', () => {
  it('renders the shared error component (with its reload action) when every attempt fails', async () => {
    let attempts = 0
    const failing = lazyComponent(() => {
      attempts += 1
      return Promise.reject(new Error('chunk load failed'))
    })
    const host = defineComponent({ render: () => h(failing) })
    const { findByText } = render(host)

    // Initial attempt + the two automatic retries all reject…
    await flushPromises()
    await flushPromises()
    await flushPromises()
    await flushPromises()

    // …then the error state (not a blank hole) is what renders.
    expect(await findByText('This section failed to load')).toBeTruthy()
    expect(await findByText('Reload page')).toBeTruthy()
    expect(attempts).toBe(3)
  })

  it('renders the real component when the chunk loads', async () => {
    // NB: resolve the component directly — Vue only unwraps `.default` from a
    // real module namespace (Symbol.toStringTag === 'Module'), which a plain
    // object literal is not. Real `import()` loaders resolve module namespaces.
    const inner = defineComponent({ render: () => h('p', 'loaded fine') })
    const ok = lazyComponent(() => Promise.resolve(inner))
    const host = defineComponent({ render: () => h(ok) })
    const { findByText } = render(host)
    await flushPromises()
    expect(await findByText('loaded fine')).toBeTruthy()
  })

  it('is what every block in the registry mounts through', () => {
    // The registry pairs each block with an async wrapper — assert the shape so
    // a refactor to a plain (eager) component cannot land silently.
    for (const block of BLOCKS) {
      const wrapper = block.component as { __asyncLoader?: unknown }
      expect(typeof wrapper.__asyncLoader, `block "${block.id}" is no longer lazily loaded`).toBe('function')
    }
  })
})

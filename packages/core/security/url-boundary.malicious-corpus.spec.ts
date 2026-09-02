import { payloadOf } from '@dzup-ui/testing/security-corpus'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import DzAnchor from '../src/components/navigation/DzAnchor.vue'
import { BINDINGS, CONTENT_COMPONENTS } from './boundary-bindings.ts'
import { expectContained, runBoundarySuite } from './boundary-suites.ts'

/**
 * `malicious-corpus` for every `SecurityBoundary` declarer (TASK-N1-O5).
 *
 * The URL suite next door asks what happens to a hostile *URL*. This one asks
 * what happens to hostile *content*: the label, caption, alt text, fallback
 * initials and accessible names these components render on the host's behalf.
 * Those are the values that arrive from a CMS, a user profile or a model
 * response, and they are markup as often as they are text.
 *
 * Every assertion reads the DOM. `expect(wrapper.html()).not.toContain('onerror')`
 * is the obvious check and it is wrong in the direction that matters: a text
 * node holding a correctly escaped `<img … onerror=…>` re-serializes with the
 * substring in it, so the assertion fails the component that got it right.
 */

for (const [name, binding] of Object.entries(BINDINGS.content))
  runBoundarySuite(binding, ['markup-injection', 'degenerate-input'], `hostile content · ${name}`)

runBoundarySuite(BINDINGS.style.DzQRCode!, ['css-injection'], 'hostile CSS value · DzQRCode color')

describe('coverage', () => {
  it('binds a content sink for every declarer, including the payload one', async () => {
    const matrix = (await import('../docs/quality-matrix.json', { with: { type: 'json' } })).default
    const declared = matrix.components
      .filter(c => c.securityBoundary !== 'none' && c.component !== 'DzFileUpload')
      .map(c => c.component)
      .sort()
    // DzFileUpload has its own corpus beside this one — it is the Tier D
    // component and its sink is files, not markup props.
    expect(CONTENT_COMPONENTS).toEqual(declared)
  })
})

describe('containment, which is what an oversized value is actually held by', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('bounds a 4 096-character label inside the component box', async () => {
    const fixture = (await import('../../testing/security-corpus/degenerate-input.corpus.json', {
      with: { type: 'json' },
    })).default.fixtures.find(f => f.id === 'degenerate-input.length.four-kilobyte-run')
    expect(fixture).toBeDefined()

    const wrapper = mount(DzAnchor, {
      props: { items: [{ href: '#a', label: payloadOf(fixture as never) }] },
    })
    await nextTick()
    expectContained(wrapper.element as Element)
    wrapper.unmount()
  })
})

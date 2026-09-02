import type { SecurityCategory } from '@dzup-ui/testing'
import { fixturesForSink, loadSecurityCorpus, payloadOf } from '@dzup-ui/testing/security-corpus'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import DzFileUpload from '../src/components/forms/DzFileUpload.vue'

/**
 * `DzFileUpload` — URL policy (TASK-N1-O5, Tier D).
 *
 * ## What this replaces
 *
 * Until this file existed, `url-policy` was an **exception** on the only Tier D
 * component in the catalog, reading: *"The component accepts no URL of any
 * kind … There is no URL for a policy to be about."* The claim was true. The
 * problem was its shape: a tier rule whose only member is excepted from it is a
 * rule that does not exist, and "there is no URL here" is not an absence of a
 * policy — **it is a policy**, and the strictest one available: an allowlist of
 * zero schemes. A policy can be asserted. An exception can only be believed.
 *
 * So the exception is deleted and the claim it rested on is stated as the
 * policy it always was, and checked:
 *
 *   > No attacker-influenced value reaches a URL-bearing attribute, no object
 *   > URL is ever minted, and no `blob:` or `data:` string appears in the
 *   > rendered tree — under every hostile input in the corpus, on both the
 *   > picker path and the drop path, in every state the component can be in.
 *
 * The difference matters the day somebody adds an image preview. Under the
 * exception, `createObjectURL` appears in a diff and the matrix cell stays
 * `excepted` for as long as nobody re-reads the threat model. Under this file,
 * the same diff turns this spec red on the line that says the count must be
 * zero.
 */

/** Every URL-bearing attribute an HTML document has. */
const URL_ATTRIBUTES = [
  'href',
  'src',
  'srcset',
  'action',
  'formaction',
  'poster',
  'data',
  'cite',
  'background',
  'ping',
  'xlink:href',
]

function elementsOf(root: Element): Element[] {
  return [root, ...root.querySelectorAll('*')]
}

/** Every URL-bearing attribute actually present, as `tag[attr]=value` strings. */
function urlAttributes(root: Element): string[] {
  const found: string[] = []
  for (const el of elementsOf(root)) {
    for (const name of URL_ATTRIBUTES) {
      const value = el.getAttribute(name)
      if (value !== null)
        found.push(`${el.tagName.toLowerCase()}[${name}]=${JSON.stringify(value)}`)
    }
  }
  return found
}

/** Any attribute value carrying a scheme the policy would have to have an opinion about. */
function schemeBearingValues(root: Element): string[] {
  const found: string[] = []
  for (const el of elementsOf(root)) {
    for (const attr of el.attributes) {
      if (/^(?:blob|data|javascript|vbscript|filesystem):/i.test(attr.value.trim()))
        found.push(`${el.tagName.toLowerCase()}[${attr.name}]`)
    }
  }
  return found
}

function file(name: string, type = 'application/octet-stream', size = 8): File {
  return new File([new Uint8Array(size)], name, { type })
}

async function drop(wrapper: ReturnType<typeof mount>, files: File[]): Promise<void> {
  await wrapper.get('[role="button"]').trigger('drop', { dataTransfer: { files } })
  await nextTick()
}

describe('the URL policy is an allowlist of zero schemes', () => {
  let createObjectURL: ReturnType<typeof vi.fn>
  let revokeObjectURL: ReturnType<typeof vi.fn>

  beforeEach(() => {
    // jsdom leaves `URL.createObjectURL` undefined, so a component that started
    // calling it would throw rather than silently mint a URL — which is a fine
    // failure mode but not an observable one. Installing a spy makes the call
    // *succeed* and be counted, so the assertion below is about the component's
    // behaviour rather than about jsdom's gaps.
    createObjectURL = vi.fn(() => 'blob:https://example.test/spy')
    revokeObjectURL = vi.fn()
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, writable: true, value: createObjectURL })
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, writable: true, value: revokeObjectURL })
  })

  afterEach(() => {
    Reflect.deleteProperty(URL, 'createObjectURL')
    Reflect.deleteProperty(URL, 'revokeObjectURL')
    document.body.innerHTML = ''
  })

  it('renders no URL-bearing attribute at rest', () => {
    const wrapper = mount(DzFileUpload)
    expect(urlAttributes(wrapper.element as Element)).toEqual([])
  })

  it('renders no URL-bearing attribute once files are in the list', async () => {
    const wrapper = mount(DzFileUpload, { props: { multiple: true } })
    await drop(wrapper, [file('a.png', 'image/png'), file('b.pdf', 'application/pdf')])
    expect(urlAttributes(wrapper.element as Element)).toEqual([])
  })

  it('renders no URL-bearing attribute in the error, disabled and invalid states', async () => {
    for (const props of [
      { error: 'Upload failed' },
      { disabled: true },
      { invalid: true },
      { accept: 'image/*', maxSize: 1, multiple: true },
    ]) {
      const wrapper = mount(DzFileUpload, { props })
      await drop(wrapper, [file('too-big.png', 'image/png', 4096)])
      expect(urlAttributes(wrapper.element as Element), JSON.stringify(props)).toEqual([])
      wrapper.unmount()
    }
  })

  it('mints no object URL, on either door, in either model mode', async () => {
    for (const modelMode of ['file', 'ref'] as const) {
      const wrapper = mount(DzFileUpload, { props: { modelMode, multiple: true } })
      await drop(wrapper, [file('photo.png', 'image/png')])

      // The picker path as well as the drop path: `accept` and `multiple`
      // behave differently on the two, so a preview added to only one of them
      // would be invisible to a drop-only assertion.
      const input = wrapper.get('input[type="file"]')
      Object.defineProperty(input.element, 'files', { configurable: true, value: [file('picked.png', 'image/png')] })
      await input.trigger('change')
      await nextTick()

      expect(createObjectURL, modelMode).not.toHaveBeenCalled()
      wrapper.unmount()
    }
  })

  it('lets no blob:, data: or javascript: value into any attribute', async () => {
    const wrapper = mount(DzFileUpload, { props: { multiple: true } })
    await drop(wrapper, [file('a.png', 'image/png')])
    expect(schemeBearingValues(wrapper.element as Element)).toEqual([])
  })
})

describe('the URL policy holds under the whole corpus', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  // A file NAME is the only channel a hostile URL can arrive on: there is no
  // URL prop. Every url-scheme case is therefore run as a name, because "the
  // component builds no URL" has to survive being handed one.
  const urlCases = fixturesForSink('navigation', ['url-scheme'])

  for (const fixture of urlCases) {
    it(`${fixture.id} as a file name produces no URL attribute`, async () => {
      const wrapper = mount(DzFileUpload, { props: { multiple: true } })
      await drop(wrapper, [file(payloadOf(fixture))])
      const root = wrapper.element as Element

      expect(
        urlAttributes(root),
        `a hostile file name reached a URL-bearing attribute; the url-policy exception this `
        + 'file replaced said no such attribute exists',
      ).toEqual([])
      expect(schemeBearingValues(root)).toEqual([])
      // …and it is still readable, because a policy that neutralized the value
      // by dropping it would be a different, worse component.
      expect(root.textContent).toContain(payloadOf(fixture))
    })
  }

  for (const category of ['file-metadata', 'markup-injection'] as SecurityCategory[]) {
    it(`no fixture in ${category} produces a URL attribute either`, async () => {
      for (const fixture of loadSecurityCorpus(category).fixtures) {
        const wrapper = mount(DzFileUpload, { props: { multiple: true } })
        await drop(wrapper, [file(payloadOf(fixture))])
        expect(urlAttributes(wrapper.element as Element), fixture.id).toEqual([])
        wrapper.unmount()
      }
    })
  }
})

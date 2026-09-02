import { loadSecurityCorpus, payloadOf } from '@dzup-ui/testing/security-corpus'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { h, nextTick } from 'vue'
import DzFileUpload from '../src/components/forms/DzFileUpload.vue'
import DzProvider from '../src/providers/DzProvider.vue'

/**
 * `DzFileUpload` — behaviour under a strict CSP (TASK-N1-O5, Tier D).
 *
 * ## The policy this asserts against
 *
 * ```
 * default-src 'self';
 * script-src  'self';        (no 'unsafe-inline', no 'unsafe-eval')
 * style-src   'self';        (no 'unsafe-inline', so no style ATTRIBUTES either)
 * img-src     'self';
 * object-src  'none';
 * base-uri    'none';
 * frame-src   'none';
 * ```
 *
 * ## Why the old exception was wrong
 *
 * The `csp-fixture` exception this file deletes read: *"No inline style, no
 * inline script, no `blob:` or `data:` URL, no HTML sink and no worker — so
 * there is no CSP directive whose absence changes its behaviour."*
 *
 * Four of those five clauses were true. The first was not: the component's
 * template root carried `style="contain: layout style"`. A `style` **attribute**
 * is governed by `style-src-attr`, which falls back to `style-src`, and a
 * `style-src` without `'unsafe-inline'` blocks it. So the one CSP directive the
 * exception said did not exist was the one that silently removed the
 * component's CSS containment — and containment is precisely what the hostile
 * corpus next door relies on to keep a 4 096-character file name inside the
 * component box. The strictest hosts got the weakest component.
 *
 * The declaration is unchanged; it moved into the `tv()` recipe as
 * `[contain:layout_style]`, which is the form `DzCard` and `DzPanel` already
 * used. That is not a workaround for a gate — it is the styling contract
 * (ADR-04/ADR-19: `tv()` in `.variants.ts`, never a style attribute), and this
 * component had been outside it.
 *
 * ## What is asserted, and what a browser would still have to confirm
 *
 * jsdom does not enforce CSP; nothing here proves a browser accepted the page.
 * What it proves is the property a CSP actually decides on — **that the
 * component emits no construct a strict policy blocks**, in every state,
 * including under hostile input — which is checkable without an engine and is
 * the half that regresses. The browser half belongs to a Playwright lane
 * serving a real `Content-Security-Policy` header and is recorded as owed.
 */

interface Violation {
  readonly directive: string
  readonly detail: string
}

function elementsOf(root: Element): Element[] {
  return [root, ...root.querySelectorAll('*')]
}

/**
 * Every construct in `root` that the policy above blocks.
 *
 * Returns the directive alongside the finding so a failure names the line of
 * the policy it broke rather than only the element it broke it with.
 */
function cspViolations(root: Element): Violation[] {
  const found: Violation[] = []
  for (const el of elementsOf(root)) {
    const tag = el.tagName.toLowerCase()

    if (tag === 'script' && !el.hasAttribute('src'))
      found.push({ directive: 'script-src \'self\'', detail: 'inline <script>' })
    if (tag === 'style')
      found.push({ directive: 'style-src \'self\'', detail: '<style> element (would need a nonce)' })
    if (tag === 'object' || tag === 'embed')
      found.push({ directive: 'object-src \'none\'', detail: `<${tag}>` })
    if (tag === 'iframe' || tag === 'frame')
      found.push({ directive: 'frame-src \'none\'', detail: `<${tag}>` })
    if (tag === 'base')
      found.push({ directive: 'base-uri \'none\'', detail: '<base>' })

    for (const attr of el.attributes) {
      const name = attr.name.toLowerCase()
      if (name === 'style') {
        found.push({
          directive: 'style-src-attr (falls back to style-src \'self\')',
          detail: `<${tag} style=${JSON.stringify(attr.value)}>`,
        })
      }
      if (name.startsWith('on')) {
        found.push({
          directive: 'script-src-attr (falls back to script-src \'self\')',
          detail: `<${tag} ${name}>`,
        })
      }
      if (/^(?:javascript|vbscript):/i.test(attr.value.trim())) {
        found.push({
          directive: 'script-src \'self\'',
          detail: `<${tag} ${name}> carries an executable URL`,
        })
      }
      if (/^(?:data|blob):/i.test(attr.value.trim()) && (name === 'src' || name === 'href')) {
        found.push({
          directive: 'img-src/default-src \'self\'',
          detail: `<${tag} ${name}> carries a ${attr.value.split(':')[0]}: URL`,
        })
      }
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

describe('emits nothing a strict CSP blocks', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    document.head.querySelectorAll('style').forEach(el => el.remove())
  })

  it('at rest', () => {
    const wrapper = mount(DzFileUpload)
    expect(cspViolations(wrapper.element as Element)).toEqual([])
  })

  it('in every state the component declares', async () => {
    const states = [
      { label: 'disabled', props: { disabled: true } },
      { label: 'invalid', props: { invalid: true } },
      { label: 'required', props: { required: true } },
      { label: 'error', props: { error: 'Upload failed' } },
      { label: 'accept + maxSize hint', props: { accept: 'image/*', maxSize: 1024 } },
      { label: 'reference mode', props: { modelMode: 'ref' as const, multiple: true } },
    ]
    for (const state of states) {
      const wrapper = mount(DzFileUpload, { props: state.props })
      await drop(wrapper, [file('a.png', 'image/png')])
      expect(cspViolations(wrapper.element as Element), state.label).toEqual([])
      wrapper.unmount()
    }
  })

  it('while a drag is in progress', async () => {
    const wrapper = mount(DzFileUpload)
    await wrapper.get('[role="button"]').trigger('dragover')
    await nextTick()
    expect(cspViolations(wrapper.element as Element)).toEqual([])
  })

  it('under every fixture in the hostile-name corpus', async () => {
    for (const fixture of loadSecurityCorpus('file-metadata').fixtures) {
      const wrapper = mount(DzFileUpload, { props: { multiple: true } })
      await drop(wrapper, [file(payloadOf(fixture))])
      expect(cspViolations(wrapper.element as Element), fixture.id).toEqual([])
      wrapper.unmount()
    }
  })

  it('keeps its CSS containment, which the blocked style attribute used to carry', async () => {
    // The regression this file exists for. If containment ever moves back to a
    // `style` attribute, the first assertion passes and this one fails; if it
    // is simply deleted, this one fails alone.
    const wrapper = mount(DzFileUpload)
    expect(wrapper.element.getAttribute('style')).toBeNull()
    expect(wrapper.classes().join(' ')).toContain('[contain:layout_style]')
    await nextTick()
  })
})

describe('still functions under the policy', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('accepts, rejects, lists and removes with no blocked construct in any frame', async () => {
    // "Functions under a strict CSP" is a behaviour claim, so the behaviour is
    // driven and the DOM is re-checked after every step rather than only at the
    // end — a violation that appears for one tick is a violation.
    const wrapper = mount(DzFileUpload, { props: { accept: 'image/*', multiple: true, maxFiles: 2 } })
    const root = () => wrapper.element as Element

    await drop(wrapper, [file('ok.png', 'image/png')])
    expect(wrapper.emitted('upload')).toHaveLength(1)
    expect(cspViolations(root()), 'after an accepted drop').toEqual([])

    await drop(wrapper, [file('payload.exe', 'application/x-msdownload')])
    expect(wrapper.emitted('error')).toHaveLength(1)
    expect(cspViolations(root()), 'after a rejected drop').toEqual([])

    const remove = wrapper.get('button[aria-label]')
    await remove.trigger('click')
    await nextTick()
    expect(wrapper.emitted('remove')).toHaveLength(1)
    expect(cspViolations(root()), 'after a removal').toEqual([])
  })

  it('keyboard activation reaches the hidden input without an inline handler', async () => {
    const wrapper = mount(DzFileUpload, { attachTo: document.body })
    const zone = wrapper.get('[role="button"]')
    await zone.trigger('keydown', { key: 'Enter' })
    await nextTick()
    // Vue attaches listeners as properties, not as `on*` attributes; this is
    // the assertion that says so rather than assuming it.
    expect(cspViolations(wrapper.element as Element)).toEqual([])
  })
})

describe('nonce propagation (ADR-20 §nonce)', () => {
  beforeEach(() => {
    // `DzProvider` reads the colour-scheme and reduced-motion media queries at
    // mount and jsdom implements neither. Stubbed to the same shape
    // DzProvider.spec.ts uses, so this file tests the nonce contract rather
    // than jsdom's gaps.
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
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
    for (const el of document.head.querySelectorAll('style'))
      el.remove()
  })

  it('injects no style element, so there is no nonce for it to get wrong', async () => {
    // The nonce contract has two halves. The half that belongs to a Tier D
    // control is this one: it must not be a component that needs a nonce at
    // all. A style element it injected without one would be dropped by
    // `style-src 'self'`, and the control would render unstyled on exactly the
    // hosts that configured CSP correctly.
    const before = document.head.querySelectorAll('style').length
    const wrapper = mount(DzProvider, {
      props: { nonce: 'csp-nonce-1' },
      slots: { default: () => h(DzFileUpload, { multiple: true }) },
      attachTo: document.body,
    })
    await nextTick()

    await wrapper.get('[role="button"]').trigger('drop', { dataTransfer: { files: [file('a.png', 'image/png')] } })
    await nextTick()

    expect(document.head.querySelectorAll('style').length).toBe(before)
    expect(cspViolations(wrapper.element as Element)).toEqual([])
    wrapper.unmount()
  })

  it('leaves no un-nonced library style behind it in the document head', async () => {
    // The other half, checked as a property of the whole render rather than by
    // re-testing DzProvider (DzProvider.spec.ts already asserts the tag itself).
    // Vacuously true today, and it stops being vacuous the moment anything in
    // this subtree starts injecting CSS.
    const wrapper = mount(DzProvider, {
      props: { nonce: 'csp-nonce-1', disableTransitionOnChange: true },
      slots: { default: () => h(DzFileUpload) },
      attachTo: document.body,
    })
    await nextTick()

    const unnonced = [...document.head.querySelectorAll('style')]
      .filter(el => !el.hasAttribute('nonce'))
      .map(el => el.id || '<anonymous>')
    expect(unnonced).toEqual([])
    wrapper.unmount()
  })
})

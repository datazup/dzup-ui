import type { FileUploadError } from '../src/components/forms/DzFileUpload.types.ts'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import DzFileUpload from '../src/components/forms/DzFileUpload.vue'

/**
 * `DzFileUpload` — hostile-input corpus (TASK-OSS-P5-06, Tier D).
 *
 * The threat model beside this file (`DzFileUpload.threat-model.md`) says the
 * component is a UI control and not a validator, and that a server must
 * revalidate everything. That is true and it is not a licence for the control
 * to be wrong: a control whose label says "Accepted: image/*" and whose model
 * then contains an `.exe` has misled both the person using it and the developer
 * who wired it up.
 *
 * So this corpus asserts the two beliefs match. Every case here goes through
 * the **drop** path, because the drop path is where they came apart:
 * `<input accept>` filters the operating system's picker and does nothing at
 * all to `DataTransfer.files`.
 *
 * `attachTo` is not used and no real `DataTransfer` is constructed — jsdom has
 * no clipboard/drag implementation worth the name. A plain object with a
 * `files` array is exactly what the handler reads, and building a fake
 * `DragEvent` around it tests the same code path with less ceremony.
 */

/** A `File` with the name, type and size a test wants, without the bytes. */
function file(name: string, type: string, size = 8): File {
  const f = new File([new Uint8Array(size)], name, { type })
  // `File` computes size from the parts; assert rather than trust, so a change
  // in jsdom cannot make a size test vacuous.
  expect(f.size).toBe(size)
  return f
}

/** Drop `files` onto the component's drop zone and return the emitted events. */
async function drop(wrapper: ReturnType<typeof mount>, files: File[]) {
  const zone = wrapper.get('[role="button"]')
  await zone.trigger('drop', { dataTransfer: { files } })
  await nextTick()
  return {
    uploaded: (wrapper.emitted('upload') ?? []).flatMap(e => e[0] as File[]),
    errors: (wrapper.emitted('error') ?? []).map(e => e[0] as FileUploadError),
    model: (wrapper.emitted('update:modelValue') ?? []).at(-1)?.[0] as File[] | undefined,
  }
}

describe('accept, on the path that had no check', () => {
  it('rejects a dropped executable from an image-only control', async () => {
    // The case F1 in the threat model describes. Before this packet the model
    // held `payload.exe` and no error was emitted.
    const wrapper = mount(DzFileUpload, { props: { accept: 'image/*' } })
    const { uploaded, errors } = await drop(wrapper, [
      file('payload.exe', 'application/x-msdownload'),
    ])

    expect(uploaded).toEqual([])
    expect(errors).toHaveLength(1)
    expect(errors[0]!.reason).toMatch(/not accepted/i)
  })

  it('rejects a double extension whose real type is not accepted', async () => {
    const wrapper = mount(DzFileUpload, { props: { accept: 'image/*' } })
    const { uploaded, errors } = await drop(wrapper, [
      file('invoice.pdf.exe', 'application/x-msdownload'),
    ])

    expect(uploaded).toEqual([])
    expect(errors[0]!.reason).toMatch(/not accepted/i)
  })

  it('rejects a type-less file when accept names only MIME types', async () => {
    // F3: `File.type` is often ''. With no extension rule to fall back on, the
    // conservative answer is no.
    const wrapper = mount(DzFileUpload, { props: { accept: 'image/*' } })
    const { uploaded } = await drop(wrapper, [file('mystery', '')])

    expect(uploaded).toEqual([])
  })

  it('admits a type-less file whose extension is named, and says so in the model', async () => {
    // The other half of F3, asserted so the trade-off is visible rather than
    // discovered: with `.png` in `accept`, this IS a filename check.
    const wrapper = mount(DzFileUpload, { props: { accept: '.png' } })
    const { uploaded } = await drop(wrapper, [file('photo.png', '')])

    expect(uploaded.map(f => f.name)).toEqual(['photo.png'])
  })

  it('matches an extension case-insensitively', async () => {
    const wrapper = mount(DzFileUpload, { props: { accept: '.pdf' } })
    const { uploaded } = await drop(wrapper, [file('REPORT.PDF', 'application/pdf')])

    expect(uploaded.map(f => f.name)).toEqual(['REPORT.PDF'])
  })

  it('honours every token in a comma-separated accept', async () => {
    // `multiple` matters here: without it the single-file rule rejects files 2
    // and 3 before `accept` is ever consulted, and the test would pass for the
    // wrong reason.
    const wrapper = mount(DzFileUpload, { props: { accept: 'image/png, .pdf', multiple: true } })
    const { uploaded, errors } = await drop(wrapper, [
      file('a.png', 'image/png'),
      file('b.pdf', 'application/pdf'),
      file('c.gif', 'image/gif'),
    ])

    expect(uploaded.map(f => f.name)).toEqual(['a.png', 'b.pdf'])
    expect(errors.map(e => e.file.name)).toEqual(['c.gif'])
  })

  it('admits everything when accept is unset', async () => {
    const wrapper = mount(DzFileUpload)
    const { uploaded } = await drop(wrapper, [file('anything.bin', '')])

    expect(uploaded).toHaveLength(1)
  })
})

describe('the other limits, on the same path', () => {
  it('takes one file into a single-file control', async () => {
    // F2. `multiple` constrains the picker and not the drop.
    const wrapper = mount(DzFileUpload, { props: { multiple: false } })
    const { uploaded, errors } = await drop(wrapper, [
      file('a.txt', 'text/plain'),
      file('b.txt', 'text/plain'),
      file('c.txt', 'text/plain'),
    ])

    expect(uploaded).toHaveLength(1)
    expect(errors).toHaveLength(2)
    expect(errors[0]!.reason).toMatch(/one file/i)
  })

  it('enforces maxSize against a file that overstates nothing', async () => {
    const wrapper = mount(DzFileUpload, { props: { multiple: true, maxSize: 16 } })
    const { uploaded, errors } = await drop(wrapper, [
      file('small.bin', 'application/octet-stream', 8),
      file('large.bin', 'application/octet-stream', 64),
    ])

    expect(uploaded.map(f => f.name)).toEqual(['small.bin'])
    expect(errors[0]!.reason).toMatch(/maximum size/i)
  })

  it('enforces maxFiles across repeated drops, not just within one', async () => {
    const wrapper = mount(DzFileUpload, { props: { multiple: true, maxFiles: 2 } })
    await drop(wrapper, [file('a.txt', 'text/plain'), file('b.txt', 'text/plain')])
    const second = await drop(wrapper, [file('c.txt', 'text/plain')])

    expect(second.errors.at(-1)!.reason).toMatch(/maximum 2 files/i)
  })

  it('rejects a zero-byte file only when a limit says to', async () => {
    // Zero bytes is not itself hostile, and refusing it would break a
    // legitimate empty file. Asserted so nobody "hardens" it later by accident.
    const wrapper = mount(DzFileUpload)
    const { uploaded } = await drop(wrapper, [file('empty.txt', 'text/plain', 0)])

    expect(uploaded).toHaveLength(1)
  })

  it('ignores a drop while disabled', async () => {
    const wrapper = mount(DzFileUpload, { props: { disabled: true } })
    const { uploaded, errors } = await drop(wrapper, [file('a.txt', 'text/plain')])

    expect(uploaded).toEqual([])
    expect(errors).toEqual([])
  })
})

describe('the file name is data, and is rendered as data', () => {
  /**
   * Assert the DOM, not the serialized HTML.
   *
   * The obvious assertion — `expect(wrapper.html()).not.toContain('onerror')` —
   * is wrong, and wrong in the direction that matters: it fails on a component
   * that escaped the name **correctly**. `wrapper.html()` re-serializes, so a
   * text node reading `&lt;img … onerror=…&gt;` contains the string `onerror`
   * while containing no attribute and no element. What has to be true is that
   * the browser built no element and no handler out of the name, and only the
   * DOM can say that.
   */
  function expectInertText(wrapper: ReturnType<typeof mount>, name: string): void {
    const root = wrapper.element as HTMLElement
    // The user can read it…
    expect(root.textContent).toContain(name)
    // …and it created nothing.
    expect(root.querySelectorAll('img, script, iframe, object, embed')).toHaveLength(0)
    for (const el of root.querySelectorAll('*')) {
      for (const attr of el.attributes) {
        expect(
          attr.name.toLowerCase().startsWith('on'),
          `${el.tagName} carries an event attribute \`${attr.name}\` built from a file name`,
        ).toBe(false)
      }
    }
  }

  it('does not interpret markup in a file name', async () => {
    const hostile = '<img src=x onerror="alert(1)">.png'
    const wrapper = mount(DzFileUpload, { props: { accept: '.png' } })
    await drop(wrapper, [file(hostile, 'image/png')])
    await nextTick()

    expectInertText(wrapper, hostile)
  })

  it('does not interpret a script tag in a file name', async () => {
    const hostile = String.raw`</script><script>alert(1)</script>.txt`
    const wrapper = mount(DzFileUpload, { props: { accept: '.txt' } })
    await drop(wrapper, [file(hostile, 'text/plain')])
    await nextTick()

    expectInertText(wrapper, hostile)
  })

  it('escapes a hostile name inside the remove button’s accessible name', async () => {
    // The file name reaches an `aria-label` as well as a text node, and an
    // attribute is a different escaping context from element content. Asserted
    // separately because getting one right says nothing about the other.
    const hostile = '" onmouseover="alert(1)" x=".png'
    const wrapper = mount(DzFileUpload, { props: { accept: '.png' } })
    await drop(wrapper, [file(hostile, 'image/png')])
    await nextTick()

    const button = (wrapper.element as HTMLElement).querySelector('button')
    expect(button?.getAttribute('aria-label')).toContain(hostile)
    expect(button?.hasAttribute('onmouseover')).toBe(false)
    expect(button?.hasAttribute('x')).toBe(false)
  })

  it('keeps a very long name from escaping its container', async () => {
    // Not a security property; a layout one that a hostile name exercises. The
    // root sets `contain: layout style`, and this is the assertion that says so.
    const wrapper = mount(DzFileUpload, { props: { accept: '.txt' } })
    await drop(wrapper, [file(`${'a'.repeat(4_000)}.txt`, 'text/plain')])
    await nextTick()

    expect(wrapper.element.getAttribute('style')).toContain('contain: layout style')
  })
})

describe('no URL and no HTML sink, asserted', () => {
  it('constructs no object URL and renders no href or src', async () => {
    // The two `url-policy` / `csp-fixture` exceptions in component-tiers.ts
    // rest on this being true. An exception nothing checks is a claim.
    const wrapper = mount(DzFileUpload, { props: { accept: '.png' } })
    await drop(wrapper, [file('photo.png', 'image/png')])
    await nextTick()

    const html = wrapper.html()
    expect(html).not.toMatch(/\shref=/)
    expect(html).not.toMatch(/\ssrc=/)
    expect(html).not.toContain('blob:')
    expect(html).not.toContain('data:')
  })
})

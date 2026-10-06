import type { DzFileRef } from '@dzup-ui/contracts'
import { isFileRef, isJsonSerializable } from '@dzup-ui/contracts'
import { mount } from '@vue/test-utils'
/**
 * DzFileUpload — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzFileUpload from './DzFileUpload.vue'

describe('dzFileUpload — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzFileUpload)
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzFileUpload, { props: { size } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzFileUpload, { attrs: { class: 'custom-class' } })
    expect(wrapper.html()).toContain('custom-class')
  })

  // ── ARIA ──

  it('exposes the dropzone as a labelled, focusable button', () => {
    const wrapper = mount(DzFileUpload)
    const zone = wrapper.get('[role="button"]')
    expect(zone.attributes('aria-label')).toBe('Upload files')
    expect(zone.attributes('tabindex')).toBe('0')
    expect(zone.attributes('aria-invalid')).toBeUndefined()
    expect(zone.attributes('aria-disabled')).toBeUndefined()
  })

  it('links an error as an alert through aria-describedby and aria-invalid', () => {
    const wrapper = mount(DzFileUpload, { props: { error: 'File too large' } })
    const zone = wrapper.get('[role="button"]')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toBe('File too large')
    expect(zone.attributes('aria-invalid')).toBe('true')
    expect(zone.attributes('aria-describedby')?.split(' ')).toContain(alert.attributes('id'))
  })

  it('marks a disabled dropzone aria-disabled and removes it from the tab order', () => {
    const wrapper = mount(DzFileUpload, { props: { disabled: true, ariaLabel: 'Attach receipts' } })
    const zone = wrapper.get('[role="button"]')
    expect(zone.attributes('aria-label')).toBe('Attach receipts')
    expect(zone.attributes('aria-disabled')).toBe('true')
    expect(zone.attributes('tabindex')).toBe('-1')
  })

  // ── Slots ──

  it('renders the default slot with isDragOver in scope', async () => {
    const wrapper = mount(DzFileUpload, {
      slots: { default: '<template #default="{ isDragOver }"><span class="zone-probe">{{ isDragOver ? \'drop now\' : \'idle\' }}</span></template>' },
    })
    expect(wrapper.get('.zone-probe').text()).toBe('idle')
    expect(wrapper.text()).not.toContain('Drop files here')
    await wrapper.get('[role="button"]').trigger('dragover')
    expect(wrapper.get('.zone-probe').text()).toBe('drop now')
  })

  it('renders the #file-item slot with the row and a working remove()', async () => {
    const file = new File(['hello'], 'notes.txt', { type: 'text/plain' })
    const wrapper = mount(DzFileUpload, {
      props: { modelValue: [file] },
      slots: {
        'file-item': '<template #file-item="{ row, remove }"><button class="row-probe" @click="remove">{{ row.name }}:{{ row.status }}</button></template>',
      },
    })
    const row = wrapper.get('.row-probe')
    expect(row.text()).toBe('notes.txt:uploaded')
    await row.trigger('click')
    expect(wrapper.emitted('remove')?.at(-1)).toEqual([file])
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([[]])
  })
})

describe('dzFileUpload — renderer contract C1 value (reference mode)', () => {
  const makeFile = (name = 'notes.txt') => new File(['hello'], name, { type: 'text/plain' })

  function pick(wrapper: ReturnType<typeof mount>, ...files: File[]) {
    const input = wrapper.find('input[type="file"]')
    Object.defineProperty(input.element, 'files', { value: files, configurable: true })
    return input.trigger('change')
  }

  it('keeps the default mode byte-identical: the model still holds Files', async () => {
    const wrapper = mount(DzFileUpload, { props: { modelValue: [] } })
    await pick(wrapper, makeFile())

    const value = wrapper.emitted('update:modelValue')!.at(-1)![0] as unknown[]
    expect(value[0]).toBeInstanceOf(File)
    expect(wrapper.emitted('uploadRequest')).toBeUndefined()
  })

  it('puts a JSON-serializable reference in the model, never the binary', async () => {
    const wrapper = mount(DzFileUpload, { props: { modelValue: [], modelMode: 'ref' } })
    await pick(wrapper, makeFile())

    const value = wrapper.emitted('update:modelValue')!.at(-1)![0] as DzFileRef[]
    expect(value[0]).not.toBeInstanceOf(File)
    expect(isFileRef(value[0])).toBe(true)
    expect(isJsonSerializable(value)).toBe(true)
    expect(value[0]!.name).toBe('notes.txt')
    expect(value[0]!.status).toBe('pending')
  })

  it('hands the binary to the host through an event instead', async () => {
    const wrapper = mount(DzFileUpload, { props: { modelValue: [], modelMode: 'ref' } })
    const file = makeFile()
    await pick(wrapper, file)

    const request = wrapper.emitted('uploadRequest')!.at(-1)![0] as {
      file: File
      ref: DzFileRef
      signal: AbortSignal
    }
    expect(request.file).toBe(file)
    expect(request.ref.status).toBe('pending')
    expect(request.signal.aborted).toBe(false)
  })

  it('aborts an in-flight upload when its row is removed', async () => {
    const wrapper = mount(DzFileUpload, { props: { modelValue: [], modelMode: 'ref' } })
    await pick(wrapper, makeFile())

    const request = wrapper.emitted('uploadRequest')!.at(-1)![0] as { ref: DzFileRef, signal: AbortSignal }
    await wrapper.setProps({ modelValue: [request.ref] })
    await wrapper.find('[data-file-status]').find('button').trigger('click')

    // The host is holding this signal, and the reference it would report
    // against has just left the model.
    expect(request.signal.aborted).toBe(true)
  })

  it('renders a row for a reference the host has already resolved', () => {
    const failed: DzFileRef = {
      id: 'f1',
      name: 'big.zip',
      size: 999,
      type: 'application/zip',
      status: 'failed',
      error: 'Too large',
    }
    const wrapper = mount(DzFileUpload, { props: { modelValue: [failed], modelMode: 'ref' } })

    expect(wrapper.text()).toContain('big.zip')
    expect(wrapper.text()).toContain('Too large')
    expect(wrapper.find('[data-file-status="failed"]').exists()).toBe(true)
  })

  it('still emits remove with a File, so an existing handler keeps working', async () => {
    const wrapper = mount(DzFileUpload, { props: { modelValue: [], modelMode: 'ref' } })
    const file = makeFile()
    await pick(wrapper, file)

    const request = wrapper.emitted('uploadRequest')!.at(-1)![0] as { ref: DzFileRef }
    await wrapper.setProps({ modelValue: [request.ref] })
    await wrapper.find('[data-file-status]').find('button').trigger('click')

    expect(wrapper.emitted('remove')!.at(-1)![0]).toBe(file)
  })
})

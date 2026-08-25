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

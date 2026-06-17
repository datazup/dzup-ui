import { mount } from '@vue/test-utils'
/**
 * DzInplace — unit / behaviour tests.
 *
 * Covers activation, commit (save), cancel/restore, focus return, the built-in
 * DzInput editor, and the `saveOn` policy.
 */
import { describe, expect, it } from 'vitest'
import { h, nextTick } from 'vue'
import DzInplace from './DzInplace.vue'

describe('dzInplace — behaviour', () => {
  // ── Activation ──

  it('activates on click and shows the editor', async () => {
    const wrapper = mount(DzInplace, {
      props: { value: 'Hello' },
      slots: { edit: () => h('input', { 'data-testid': 'editor' }) },
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('[data-testid="editor"]').exists()).toBe(true)
    expect(wrapper.emitted('open')).toHaveLength(1)
  })

  it('does not activate when disabled', async () => {
    const wrapper = mount(DzInplace, { props: { value: 'Hello', disabled: true } })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('open')).toBeUndefined()
    expect(wrapper.attributes('data-state')).toBe('display')
  })

  // ── Save (commit) ──

  it('commits via Enter and emits save with the current value', async () => {
    const wrapper = mount(DzInplace, {
      props: { value: 'Hello', saveOn: 'enter' },
      slots: {
        edit: ({ setValue }: { setValue: (v: unknown) => void }) =>
          h('input', {
            'data-testid': 'editor',
            'onInput': (e: Event) => setValue((e.target as HTMLInputElement).value),
          }),
      },
    })
    await wrapper.find('button').trigger('click')
    const editor = wrapper.find('[data-testid="editor"]')
    await editor.setValue('World')
    await editor.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('save')).toBeDefined()
    expect(wrapper.emitted('save')![0]).toEqual(['World'])
    // Closed back to the display view.
    expect(wrapper.attributes('data-state')).toBe('display')
  })

  it('commits on blur when saveOn includes blur', async () => {
    const wrapper = mount(DzInplace, {
      props: { value: 'Hello', saveOn: 'blur' },
      attachTo: document.body,
      slots: { edit: () => h('input', { 'data-testid': 'editor' }) },
    })
    await wrapper.find('button').trigger('click')
    // Focus leaves the editor (relatedTarget outside).
    await wrapper.find('[data-testid="editor"]').trigger('focusout', { relatedTarget: document.body })
    expect(wrapper.emitted('save')).toBeDefined()
    wrapper.unmount()
  })

  it('does not commit on blur when saveOn is enter', async () => {
    const wrapper = mount(DzInplace, {
      props: { value: 'Hello', saveOn: 'enter' },
      slots: { edit: () => h('input', { 'data-testid': 'editor' }) },
    })
    await wrapper.find('button').trigger('click')
    await wrapper.find('[data-testid="editor"]').trigger('focusout', { relatedTarget: document.body })
    expect(wrapper.emitted('save')).toBeUndefined()
  })

  // ── Cancel / restore ──

  it('restores the prior value and emits cancel on Esc', async () => {
    const wrapper = mount(DzInplace, {
      props: { value: 'Hello' },
      slots: {
        edit: ({ setValue }: { setValue: (v: unknown) => void }) =>
          h('input', {
            'data-testid': 'editor',
            'onInput': (e: Event) => setValue((e.target as HTMLInputElement).value),
          }),
      },
    })
    await wrapper.find('button').trigger('click')
    await wrapper.find('[data-testid="editor"]').setValue('Changed')
    // The edit propagated outward via v-model:value.
    expect(wrapper.emitted('update:value')!.at(-1)).toEqual(['Changed'])

    await wrapper.find('[data-testid="editor"]').trigger('keydown', { key: 'Escape' })

    expect(wrapper.emitted('cancel')).toHaveLength(1)
    // Prior value restored via a final v-model:value update.
    expect(wrapper.emitted('update:value')!.at(-1)).toEqual(['Hello'])
    expect(wrapper.attributes('data-state')).toBe('display')
  })

  // ── Focus management ──

  it('moves focus into the editor on activate and back to the trigger on close', async () => {
    const wrapper = mount(DzInplace, {
      props: { value: 'Hello', saveOn: 'enter' },
      attachTo: document.body,
      slots: { edit: () => h('input', { 'data-testid': 'editor' }) },
    })
    const trigger = wrapper.find('button').element as HTMLButtonElement
    trigger.focus()
    await wrapper.find('button').trigger('click')
    await nextTick()
    const editor = wrapper.find('[data-testid="editor"]').element
    expect(document.activeElement).toBe(editor)

    await wrapper.find('[data-testid="editor"]').trigger('keydown', { key: 'Enter' })
    await nextTick()
    expect(document.activeElement).toBe(wrapper.find('button').element)
    wrapper.unmount()
  })

  // ── Built-in editor mode ──

  it('renders a built-in DzInput when no #edit slot is provided', async () => {
    const wrapper = mount(DzInplace, {
      props: { value: 'Hello' },
      attachTo: document.body,
    })
    await wrapper.find('button').trigger('click')
    await nextTick()
    const input = wrapper.find('input')
    expect(input.exists()).toBe(true)
    expect((input.element as HTMLInputElement).value).toBe('Hello')

    await input.setValue('Edited')
    await input.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('save')![0]).toEqual(['Edited'])
    wrapper.unmount()
  })

  it('renders the model value in the display view by default', () => {
    const wrapper = mount(DzInplace, { props: { value: 'Read me' } })
    expect(wrapper.find('button').text()).toContain('Read me')
  })
})

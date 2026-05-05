import { mount } from '@vue/test-utils'
/**
 * DzSearchInput — Unit / behavior tests.
 */
import { describe, expect, it, vi } from 'vitest'
import DzSearchInput from './DzSearchInput.vue'

describe('dzSearchInput — Unit Tests', () => {
  it('renders with type="search"', () => {
    const wrapper = mount(DzSearchInput)
    expect(wrapper.find('input').attributes('type')).toBe('search')
  })

  it('has a search icon', () => {
    const wrapper = mount(DzSearchInput)
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('sets default placeholder', () => {
    const wrapper = mount(DzSearchInput)
    expect(wrapper.find('input').attributes('placeholder')).toBe('Search...')
  })

  it('uses custom placeholder when provided', () => {
    const wrapper = mount(DzSearchInput, {
      props: { placeholder: 'Find items...' },
    })
    expect(wrapper.find('input').attributes('placeholder')).toBe('Find items...')
  })

  it('shows clear button when input has value', async () => {
    const wrapper = mount(DzSearchInput, {
      props: { modelValue: 'test' },
    })
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('hides clear button when input is empty', () => {
    const wrapper = mount(DzSearchInput, {
      props: { modelValue: '' },
    })
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('clears input value on clear button click', async () => {
    const wrapper = mount(DzSearchInput, {
      props: { modelValue: 'test' },
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('clear')).toHaveLength(1)
  })

  it('emits search on Enter key', async () => {
    const wrapper = mount(DzSearchInput, {
      props: { modelValue: 'query' },
    })
    await wrapper.find('input').trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('search')?.[0]).toEqual(['query'])
  })

  it('sets aria-label to Search by default', () => {
    const wrapper = mount(DzSearchInput)
    expect(wrapper.find('input').attributes('aria-label')).toBe('Search')
  })

  it('emits focus and blur events', async () => {
    const wrapper = mount(DzSearchInput)
    await wrapper.find('input').trigger('focus')
    await wrapper.find('input').trigger('blur')
    expect(wrapper.emitted('focus')).toHaveLength(1)
    expect(wrapper.emitted('blur')).toHaveLength(1)
  })

  it('disables input when disabled', () => {
    const wrapper = mount(DzSearchInput, { props: { disabled: true } })
    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
  })

  it('emits search after debounce delay', async () => {
    vi.useFakeTimers()
    const wrapper = mount(DzSearchInput, {
      props: { modelValue: '', debounce: 300 },
    })
    await wrapper.setProps({ modelValue: 'hello' })
    expect(wrapper.emitted('search')).toBeUndefined()
    vi.advanceTimersByTime(300)
    expect(wrapper.emitted('search')?.[0]).toEqual(['hello'])
    vi.useRealTimers()
  })

  it('cancels debounce on Enter key', async () => {
    vi.useFakeTimers()
    const wrapper = mount(DzSearchInput, {
      props: { modelValue: 'test', debounce: 300 },
    })
    await wrapper.setProps({ modelValue: 'updated' })
    await wrapper.find('input').trigger('keydown', { key: 'Enter' })
    // Enter fires search immediately
    expect(wrapper.emitted('search')?.[0]).toEqual(['updated'])
    vi.advanceTimersByTime(300)
    // No duplicate search emit from debounce
    expect(wrapper.emitted('search')).toHaveLength(1)
    vi.useRealTimers()
  })

  it('cancels debounce on clear', async () => {
    vi.useFakeTimers()
    const wrapper = mount(DzSearchInput, {
      props: { modelValue: 'test', debounce: 300 },
    })
    await wrapper.setProps({ modelValue: 'updated' })
    await wrapper.find('button').trigger('click')
    vi.advanceTimersByTime(300)
    // search should not have been emitted from debounce
    expect(wrapper.emitted('search')).toBeUndefined()
    vi.useRealTimers()
  })
})

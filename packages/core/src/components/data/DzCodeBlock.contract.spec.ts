import { mount } from '@vue/test-utils'
/**
 * DzCodeBlock — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzCodeBlock from './DzCodeBlock.vue'

describe('dzCodeBlock — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzCodeBlock, { props: { code: 'const x = 1' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders the code content', () => {
    const wrapper = mount(DzCodeBlock, { props: { code: 'const x = 1' } })
    expect(wrapper.text()).toContain('const x = 1')
  })

  it('renders filename when provided', () => {
    const wrapper = mount(DzCodeBlock, { props: { code: 'x = 1', filename: 'main.py' } })
    expect(wrapper.text()).toContain('main.py')
  })

  it('accepts language prop without error', () => {
    const wrapper = mount(DzCodeBlock, { props: { code: 'x = 1', language: 'python' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts showLineNumbers prop', () => {
    const wrapper = mount(DzCodeBlock, { props: { code: 'x = 1', showLineNumbers: true } })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts copyable prop', () => {
    const wrapper = mount(DzCodeBlock, { props: { code: 'x = 1', copyable: true } })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts maxHeight prop', () => {
    const wrapper = mount(DzCodeBlock, { props: { code: 'x = 1', maxHeight: '300px' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('forwards ariaLabel', () => {
    const wrapper = mount(DzCodeBlock, { props: { code: 'x = 1', ariaLabel: 'Python snippet' } })
    expect(wrapper.html()).toContain('Python snippet')
  })

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzCodeBlock, { props: { code: 'x = 1' } })
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })
})

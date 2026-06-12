import { mount } from '@vue/test-utils'
/**
 * DzAnchor — Contract Spec v1 conformance tests.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import DzAnchor from './DzAnchor.vue'

const items = [
  { href: '#intro', label: 'Introduction' },
  { href: '#usage', label: 'Usage' },
  { href: '#api', label: 'API' },
]

beforeEach(() => {
  // JSDOM lacks IntersectionObserver; provide an inert stub for the composable.
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
      takeRecords(): [] { return [] }
    },
  )
})

describe('dzAnchor — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzAnchor, { props: { items } })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders a <nav> landmark with an accessible label', () => {
    const wrapper = mount(DzAnchor, { props: { items } })
    const nav = wrapper.find('nav')
    expect(nav.exists()).toBe(true)
    expect(nav.attributes('aria-label')).toBe('Page navigation')
  })

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzAnchor, { props: { items } })
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  it('displays item labels', () => {
    const wrapper = mount(DzAnchor, { props: { items } })
    expect(wrapper.text()).toContain('Introduction')
    expect(wrapper.text()).toContain('Usage')
    expect(wrapper.text()).toContain('API')
  })

  it('renders one link per item pointing at its href', () => {
    const wrapper = mount(DzAnchor, { props: { items } })
    const links = wrapper.findAll('a')
    expect(links).toHaveLength(3)
    expect(links.map(l => l.attributes('href'))).toEqual(['#intro', '#usage', '#api'])
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzAnchor, {
      props: { items },
      attrs: { class: 'custom-class' },
    })
    expect(wrapper.html()).toContain('custom-class')
  })
})

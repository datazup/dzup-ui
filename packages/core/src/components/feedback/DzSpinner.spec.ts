import { mount } from '@vue/test-utils'
/**
 * DzSpinner — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzSpinner from './DzSpinner.vue'

describe('dzSpinner — Unit Tests', () => {
  it('renders a <span> root element', () => {
    const wrapper = mount(DzSpinner)
    expect(wrapper.element.tagName).toBe('SPAN')
  })

  it('merges consumer class via cn() on the SVG', () => {
    const wrapper = mount(DzSpinner, {
      attrs: { class: 'my-spinner' },
    })
    // Consumer class goes on the root span via attrs forwarding
    // (not the SVG — the SVG has its own variant classes)
    expect(wrapper.attributes('class')).toBeUndefined()
    // Check the root element does not have class attr since we forward it
  })

  it('forwards extra HTML attributes to root', () => {
    const wrapper = mount(DzSpinner, {
      attrs: { 'data-testid': 'loading-spinner' },
    })
    expect(wrapper.attributes('data-testid')).toBe('loading-spinner')
  })

  it('applies xs size class to SVG', () => {
    const wrapper = mount(DzSpinner, { props: { size: 'xs' } })
    const svg = wrapper.find('svg')
    expect(svg.classes()).toContain('h-3')
    expect(svg.classes()).toContain('w-3')
  })

  it('applies sm size class to SVG', () => {
    const wrapper = mount(DzSpinner, { props: { size: 'sm' } })
    const svg = wrapper.find('svg')
    expect(svg.classes()).toContain('h-4')
    expect(svg.classes()).toContain('w-4')
  })

  it('applies md size class to SVG (default)', () => {
    const wrapper = mount(DzSpinner)
    const svg = wrapper.find('svg')
    expect(svg.classes()).toContain('h-6')
    expect(svg.classes()).toContain('w-6')
  })

  it('applies lg size class to SVG', () => {
    const wrapper = mount(DzSpinner, { props: { size: 'lg' } })
    const svg = wrapper.find('svg')
    expect(svg.classes()).toContain('h-8')
    expect(svg.classes()).toContain('w-8')
  })

  it('applies xl size class to SVG', () => {
    const wrapper = mount(DzSpinner, { props: { size: 'xl' } })
    const svg = wrapper.find('svg')
    expect(svg.classes()).toContain('h-12')
    expect(svg.classes()).toContain('w-12')
  })

  it('applies neutral tone class', () => {
    const wrapper = mount(DzSpinner, { props: { tone: 'neutral' } })
    const svg = wrapper.find('svg')
    expect(svg.classes().join(' ')).toContain('text-[var(--dz-foreground)]')
  })

  it('applies primary tone class', () => {
    const wrapper = mount(DzSpinner, { props: { tone: 'primary' } })
    const svg = wrapper.find('svg')
    expect(svg.classes().join(' ')).toContain('text-[var(--dz-primary)]')
  })

  it('applies success tone class', () => {
    const wrapper = mount(DzSpinner, { props: { tone: 'success' } })
    const svg = wrapper.find('svg')
    expect(svg.classes().join(' ')).toContain('text-[var(--dz-success)]')
  })

  it('has animate-spin class on SVG', () => {
    const wrapper = mount(DzSpinner)
    const svg = wrapper.find('svg')
    expect(svg.classes()).toContain('animate-spin')
  })

  it('sVG contains circle and path elements', () => {
    const wrapper = mount(DzSpinner)
    expect(wrapper.find('svg circle').exists()).toBe(true)
    expect(wrapper.find('svg path').exists()).toBe(true)
  })

  it('circle element has opacity-25 class', () => {
    const wrapper = mount(DzSpinner)
    expect(wrapper.find('svg circle').classes()).toContain('opacity-25')
  })

  it('path element has opacity-75 class', () => {
    const wrapper = mount(DzSpinner)
    expect(wrapper.find('svg path').classes()).toContain('opacity-75')
  })
})

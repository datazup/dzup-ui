import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import DzPageHero from './DzPageHero.vue'

describe('dzPageHero', () => {
  it('renders the title as a level-1 heading', () => {
    const wrapper = mount(DzPageHero, { props: { title: 'Library' } })
    expect(wrapper.find('h1').text()).toBe('Library')
  })

  it('renders eyebrow and description only when provided', () => {
    const bare = mount(DzPageHero, { props: { title: 'T' } })
    expect(bare.find('.dz-page-hero__eyebrow').exists()).toBe(false)
    expect(bare.find('.dz-page-hero__desc').exists()).toBe(false)

    const full = mount(DzPageHero, {
      props: { title: 'T', eyebrow: 'Section', description: 'About this page' },
    })
    expect(full.find('.dz-page-hero__eyebrow').text()).toBe('Section')
    expect(full.find('.dz-page-hero__desc').text()).toBe('About this page')
  })

  it('description slot overrides the description prop', () => {
    const wrapper = mount(DzPageHero, {
      props: { title: 'T', description: 'prop text' },
      slots: { description: 'slot text' },
    })
    expect(wrapper.find('.dz-page-hero__desc').text()).toBe('slot text')
  })

  it('renders meta and actions containers only when slotted', () => {
    const bare = mount(DzPageHero, { props: { title: 'T' } })
    expect(bare.find('.dz-page-hero__meta').exists()).toBe(false)
    expect(bare.find('.dz-page-hero__actions').exists()).toBe(false)

    const slotted = mount(DzPageHero, {
      props: { title: 'T' },
      slots: { meta: '<span>3 items</span>', actions: '<button>Go</button>' },
    })
    expect(slotted.find('.dz-page-hero__meta').text()).toContain('3 items')
    expect(slotted.find('.dz-page-hero__actions button').exists()).toBe(true)
  })

  it('exposes the stable root anatomy class and forwards attrs', () => {
    const wrapper = mount(DzPageHero, {
      props: { title: 'T' },
      attrs: { 'data-testid': 'hero', 'class': 'extra' },
    })
    expect(wrapper.classes()).toContain('dz-page-hero')
    expect(wrapper.classes()).toContain('extra')
    expect(wrapper.attributes('data-testid')).toBe('hero')
  })
})

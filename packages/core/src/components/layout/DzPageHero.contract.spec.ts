import { mount } from '@vue/test-utils'
/**
 * DzPageHero -- Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzPageHero from './DzPageHero.vue'

describe('dzPageHero -- Contract Spec v1', () => {
  // -- Semantics --

  it('renders a <header> root with the stable anatomy class', () => {
    const wrapper = mount(DzPageHero, { props: { title: 'T' } })
    expect(wrapper.element.tagName).toBe('HEADER')
    expect(wrapper.classes()).toContain('dz-page-hero')
  })

  it('renders exactly one level-1 heading containing the title', () => {
    const wrapper = mount(DzPageHero, { props: { title: 'Library' } })
    const headings = wrapper.findAll('h1')
    expect(headings).toHaveLength(1)
    expect(headings[0]!.text()).toBe('Library')
    expect(headings[0]!.classes()).toContain('dz-page-hero__title')
  })

  // -- Anatomy classes --

  it('exposes the full anatomy class set when fully populated', () => {
    const wrapper = mount(DzPageHero, {
      props: { title: 'T', eyebrow: 'E', description: 'D' },
      slots: { meta: '<span>m</span>', actions: '<button>a</button>' },
    })
    for (const cls of [
      'dz-page-hero__body',
      'dz-page-hero__eyebrow',
      'dz-page-hero__title',
      'dz-page-hero__desc',
      'dz-page-hero__meta',
      'dz-page-hero__actions',
    ]) {
      expect(wrapper.find(`.${cls}`).exists()).toBe(true)
    }
  })

  it('omits optional anatomy regions when not provided', () => {
    const wrapper = mount(DzPageHero, { props: { title: 'T' } })
    for (const cls of [
      'dz-page-hero__eyebrow',
      'dz-page-hero__desc',
      'dz-page-hero__meta',
      'dz-page-hero__actions',
    ]) {
      expect(wrapper.find(`.${cls}`).exists()).toBe(false)
    }
  })

  // -- Slots --

  it('renders the description slot, overriding the description prop', () => {
    const wrapper = mount(DzPageHero, {
      props: { title: 'T', description: 'Prop text' },
      slots: { description: '<em data-testid="desc">Slot text</em>' },
    })
    expect(wrapper.find('[data-testid="desc"]').text()).toBe('Slot text')
    expect(wrapper.text()).not.toContain('Prop text')
  })

  it('renders meta and actions slot content', () => {
    const wrapper = mount(DzPageHero, {
      props: { title: 'T' },
      slots: {
        meta: '<span data-testid="meta">3 items</span>',
        actions: '<button data-testid="act">Go</button>',
      },
    })
    expect(wrapper.find('[data-testid="meta"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="act"]').exists()).toBe(true)
  })

  // -- Class merging (ADR-10) --

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzPageHero, {
      props: { title: 'T' },
      attrs: { class: 'my-hero' },
    })
    expect(wrapper.classes()).toContain('my-hero')
    expect(wrapper.classes()).toContain('dz-page-hero')
  })

  // -- Attribute forwarding --

  it('forwards extra HTML attributes to the root', () => {
    const wrapper = mount(DzPageHero, {
      props: { title: 'T' },
      attrs: { 'data-testid': 'hero', 'aria-label': 'Page hero' },
    })
    expect(wrapper.attributes('data-testid')).toBe('hero')
    expect(wrapper.attributes('aria-label')).toBe('Page hero')
  })
})

import { mount } from '@vue/test-utils'
/**
 * DzList + DzListItem — Unit / behavior / contract tests.
 */
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzList from './DzList.vue'
import DzListItem from './DzListItem.vue'

describe('dzList', () => {
  it('renders a <ul> element by default', () => {
    const wrapper = mount(DzList, {
      slots: { default: () => h(DzListItem, null, { default: () => 'Item' }) },
    })
    expect(wrapper.element.tagName).toBe('UL')
  })

  it('renders an <ol> element when ordered', () => {
    const wrapper = mount(DzList, {
      props: { ordered: true },
      slots: { default: () => h(DzListItem, null, { default: () => 'Item' }) },
    })
    expect(wrapper.element.tagName).toBe('OL')
  })

  it('has role="list"', () => {
    const wrapper = mount(DzList, {
      slots: { default: () => h(DzListItem, null, { default: () => 'Item' }) },
    })
    expect(wrapper.attributes('role')).toBe('list')
  })

  it('sets data-loading when loading', () => {
    const wrapper = mount(DzList, {
      props: { loading: true },
      slots: { default: () => h(DzListItem, null, { default: () => 'Item' }) },
    })
    expect(wrapper.attributes('data-loading')).toBe('')
  })

  it('sets aria-busy when loading', () => {
    const wrapper = mount(DzList, {
      props: { loading: true },
      slots: { default: () => h(DzListItem, null, { default: () => 'Item' }) },
    })
    expect(wrapper.attributes('aria-busy')).toBe('true')
  })

  it('forwards aria-label', () => {
    const wrapper = mount(DzList, {
      props: { ariaLabel: 'User list' },
      slots: { default: () => h(DzListItem, null, { default: () => 'Item' }) },
    })
    expect(wrapper.attributes('aria-label')).toBe('User list')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzList, {
      attrs: { class: 'my-custom' },
      slots: { default: () => h(DzListItem, null, { default: () => 'Item' }) },
    })
    expect(wrapper.classes()).toContain('my-custom')
  })

  it('has contain: layout style', () => {
    const wrapper = mount(DzList, {
      slots: { default: () => h(DzListItem, null, { default: () => 'Item' }) },
    })
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })
})

describe('dzListItem', () => {
  it('renders an <li> element', () => {
    const wrapper = mount(DzList, {
      slots: {
        default: () => h(DzListItem, null, { default: () => 'Item 1' }),
      },
    })
    const item = wrapper.findComponent(DzListItem)
    expect(item.element.tagName).toBe('LI')
  })

  it('renders default slot content', () => {
    const wrapper = mount(DzList, {
      slots: {
        default: () => h(DzListItem, null, { default: () => 'Hello World' }),
      },
    })
    expect(wrapper.text()).toContain('Hello World')
  })

  it('has role="listitem"', () => {
    const wrapper = mount(DzList, {
      slots: {
        default: () => h(DzListItem, null, { default: () => 'Item' }),
      },
    })
    const item = wrapper.findComponent(DzListItem)
    expect(item.attributes('role')).toBe('listitem')
  })

  it('sets data-disabled when disabled', () => {
    const wrapper = mount(DzList, {
      slots: {
        default: () => h(DzListItem, { disabled: true }, { default: () => 'Item' }),
      },
    })
    const item = wrapper.findComponent(DzListItem)
    expect(item.attributes('data-disabled')).toBe('')
  })

  it('sets data-state="active" when active', () => {
    const wrapper = mount(DzList, {
      slots: {
        default: () => h(DzListItem, { active: true }, { default: () => 'Item' }),
      },
    })
    const item = wrapper.findComponent(DzListItem)
    expect(item.attributes('data-state')).toBe('active')
  })

  it('sets aria-selected when active', () => {
    const wrapper = mount(DzList, {
      slots: {
        default: () => h(DzListItem, { active: true }, { default: () => 'Item' }),
      },
    })
    const item = wrapper.findComponent(DzListItem)
    expect(item.attributes('aria-selected')).toBe('true')
  })

  it('renders prefix and suffix slots', () => {
    const wrapper = mount(DzList, {
      slots: {
        default: () =>
          h(DzListItem, null, {
            default: () => 'Label',
            prefix: () => h('span', { 'data-testid': 'prefix' }),
            suffix: () => h('span', { 'data-testid': 'suffix' }),
          }),
      },
    })
    expect(wrapper.find('[data-testid="prefix"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="suffix"]').exists()).toBe(true)
  })

  it('emits click in interactive mode', async () => {
    const wrapper = mount(DzList, {
      props: { interactive: true },
      slots: {
        default: () => h(DzListItem, null, { default: () => 'Item' }),
      },
    })
    const item = wrapper.findComponent(DzListItem)
    await item.trigger('click')
    expect(item.emitted('click')).toHaveLength(1)
  })

  it('does NOT emit click when disabled in interactive mode', async () => {
    const wrapper = mount(DzList, {
      props: { interactive: true },
      slots: {
        default: () => h(DzListItem, { disabled: true }, { default: () => 'Item' }),
      },
    })
    const item = wrapper.findComponent(DzListItem)
    await item.trigger('click')
    expect(item.emitted('click')).toBeUndefined()
  })
})

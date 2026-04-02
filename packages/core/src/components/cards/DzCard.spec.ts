import { mount } from '@vue/test-utils'
/**
 * DzCard — Unit and behavior tests.
 *
 * Tests component behavior, keyboard interaction, class merging,
 * and variant styling application.
 */
import { describe, expect, it, vi } from 'vitest'
import DzCard from './DzCard.vue'
import DzCardBody from './DzCardBody.vue'
import DzCardFooter from './DzCardFooter.vue'
import DzCardHeader from './DzCardHeader.vue'

describe('dzCard', () => {
  describe('rendering', () => {
    it('renders as a div element', () => {
      const wrapper = mount(DzCard)
      expect(wrapper.element.tagName).toBe('DIV')
    })

    it('renders slot content in correct order: media, header, default, actions, footer', () => {
      const wrapper = mount(DzCard, {
        slots: {
          media: '<div data-testid="media">M</div>',
          header: '<div data-testid="header">H</div>',
          default: '<div data-testid="default">D</div>',
          actions: '<div data-testid="actions">A</div>',
          footer: '<div data-testid="footer">F</div>',
        },
      })
      const order = wrapper.findAll('[data-testid]').map(el => el.attributes('data-testid'))
      expect(order).toEqual(['media', 'header', 'default', 'actions', 'footer'])
    })
  })

  describe('variant styling', () => {
    it('applies elevated variant classes by default', () => {
      const wrapper = mount(DzCard)
      const classStr = wrapper.classes().join(' ')
      expect(classStr).toContain('shadow')
    })

    it('applies outlined variant with border classes', () => {
      const wrapper = mount(DzCard, { props: { variant: 'outlined' } })
      const classStr = wrapper.classes().join(' ')
      expect(classStr).toContain('border')
    })

    it('applies flat variant without shadow or border', () => {
      const wrapper = mount(DzCard, { props: { variant: 'flat' } })
      const classStr = wrapper.classes().join(' ')
      expect(classStr).not.toContain('shadow-[var(--dz-shadow-md)]')
      expect(classStr).not.toContain('border-[var(--dz-card-border-color)]')
    })

    it('applies padding variants correctly', () => {
      const wrapper = mount(DzCard, { props: { padding: 'none' } })
      const classStr = wrapper.classes().join(' ')
      expect(classStr).toContain('p-0')
    })

    it('contains layout style for CSS containment', () => {
      const wrapper = mount(DzCard)
      const classStr = wrapper.classes().join(' ')
      expect(classStr).toContain('contain')
    })
  })

  describe('class merging (ADR-10)', () => {
    it('merges consumer class attribute with variant classes', () => {
      const wrapper = mount(DzCard, {
        attrs: { class: 'custom-class' },
      })
      const classStr = wrapper.classes().join(' ')
      expect(classStr).toContain('custom-class')
    })
  })

  describe('clickable behavior', () => {
    it('emits click event with MouseEvent payload on click', async () => {
      const wrapper = mount(DzCard, { props: { clickable: true } })
      await wrapper.trigger('click')
      const emitted = wrapper.emitted('click')
      expect(emitted).toHaveLength(1)
      expect(emitted![0]![0]).toBeInstanceOf(MouseEvent)
    })

    it('emits click event on Enter keydown', async () => {
      const wrapper = mount(DzCard, { props: { clickable: true } })
      await wrapper.trigger('keydown', { key: 'Enter' })
      const emitted = wrapper.emitted('click')
      expect(emitted).toHaveLength(1)
    })

    it('emits click event on Space keydown', async () => {
      const wrapper = mount(DzCard, { props: { clickable: true } })
      await wrapper.trigger('keydown', { key: ' ' })
      const emitted = wrapper.emitted('click')
      expect(emitted).toHaveLength(1)
    })

    it('prevents default on Space keydown to avoid scrolling', async () => {
      const wrapper = mount(DzCard, { props: { clickable: true } })
      const event = new KeyboardEvent('keydown', { key: ' ', cancelable: true })
      const spy = vi.spyOn(event, 'preventDefault')
      wrapper.element.dispatchEvent(event)
      expect(spy).toHaveBeenCalled()
    })

    it('does not emit click on non-activating keys', async () => {
      const wrapper = mount(DzCard, { props: { clickable: true } })
      await wrapper.trigger('keydown', { key: 'Escape' })
      expect(wrapper.emitted('click')).toBeUndefined()
    })

    it('does not respond to keyboard when not clickable', async () => {
      const wrapper = mount(DzCard)
      await wrapper.trigger('keydown', { key: 'Enter' })
      expect(wrapper.emitted('click')).toBeUndefined()
    })
  })

  describe('hoverable', () => {
    it('applies hover shadow class when hoverable', () => {
      const wrapper = mount(DzCard, { props: { hoverable: true } })
      const classStr = wrapper.classes().join(' ')
      expect(classStr).toContain('hover:shadow')
    })

    it('does not apply hover class when not hoverable', () => {
      const wrapper = mount(DzCard)
      const classStr = wrapper.classes().join(' ')
      expect(classStr).not.toContain('hover:shadow')
    })
  })
})

describe('dzCardHeader', () => {
  it('renders as a div element', () => {
    const wrapper = mount(DzCardHeader)
    expect(wrapper.element.tagName).toBe('DIV')
  })

  it('renders default slot in flex-1 container', () => {
    const wrapper = mount(DzCardHeader, {
      slots: { default: '<span>Title</span>' },
    })
    expect(wrapper.find('.flex-1').text()).toBe('Title')
  })

  it('renders actions slot only when provided', () => {
    const withoutActions = mount(DzCardHeader, {
      slots: { default: 'Title' },
    })
    expect(withoutActions.findAll('div').length).toBe(2) // root + flex-1

    const withActions = mount(DzCardHeader, {
      slots: { default: 'Title', actions: '<button>Edit</button>' },
    })
    expect(withActions.find('button').exists()).toBe(true)
  })

  it('merges consumer class attribute', () => {
    const wrapper = mount(DzCardHeader, {
      attrs: { class: 'my-header' },
    })
    expect(wrapper.classes()).toContain('my-header')
  })
})

describe('dzCardBody', () => {
  it('renders as a div element', () => {
    const wrapper = mount(DzCardBody)
    expect(wrapper.element.tagName).toBe('DIV')
  })

  it('renders default slot content', () => {
    const wrapper = mount(DzCardBody, {
      slots: { default: '<p>Body content</p>' },
    })
    expect(wrapper.find('p').text()).toBe('Body content')
  })

  it('merges consumer class attribute', () => {
    const wrapper = mount(DzCardBody, {
      attrs: { class: 'my-body' },
    })
    expect(wrapper.classes()).toContain('my-body')
  })
})

describe('dzCardFooter', () => {
  it('renders as a div element', () => {
    const wrapper = mount(DzCardFooter)
    expect(wrapper.element.tagName).toBe('DIV')
  })

  it('renders default slot content', () => {
    const wrapper = mount(DzCardFooter, {
      slots: { default: '<button>Action</button>' },
    })
    expect(wrapper.find('button').text()).toBe('Action')
  })

  it('merges consumer class attribute', () => {
    const wrapper = mount(DzCardFooter, {
      attrs: { class: 'my-footer' },
    })
    expect(wrapper.classes()).toContain('my-footer')
  })
})

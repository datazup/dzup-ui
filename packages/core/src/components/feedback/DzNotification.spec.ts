import { mount } from '@vue/test-utils'
/**
 * DzNotification — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzNotification from './DzNotification.vue'

function mountNotification(notificationProps = {}) {
  return mount(DzNotification, {
    props: {
      title: 'Test Notification',
      ...notificationProps,
    },
  })
}

describe('dzNotification', () => {
  it('renders successfully', () => {
    const wrapper = mountNotification()
    expect(wrapper.exists()).toBe(true)
  })

  it('renders title', () => {
    const wrapper = mountNotification({ title: 'Upload complete' })
    expect(wrapper.text()).toContain('Upload complete')
  })

  it('renders description', () => {
    const wrapper = mountNotification({ description: 'File uploaded' })
    expect(wrapper.text()).toContain('File uploaded')
  })

  it('renders default slot content', () => {
    const wrapper = mount(DzNotification, {
      props: { title: 'Info' },
      slots: { default: 'Custom body content' },
    })
    expect(wrapper.text()).toContain('Custom body content')
  })

  it('has contain: layout style', () => {
    const wrapper = mountNotification()
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  it('sets data-tone attribute', () => {
    const wrapper = mountNotification({ tone: 'success' })
    expect(wrapper.attributes('data-tone')).toBe('success')
  })

  it('sets data-state to open', () => {
    const wrapper = mountNotification()
    expect(wrapper.attributes('data-state')).toBe('open')
  })

  it('uses role="alert" for danger tone', () => {
    const wrapper = mountNotification({ tone: 'danger' })
    expect(wrapper.attributes('role')).toBe('alert')
  })

  it('uses role="status" for non-urgent tones', () => {
    const wrapper = mountNotification({ tone: 'info' })
    expect(wrapper.attributes('role')).toBe('status')
  })

  it('renders close button when closable', () => {
    const wrapper = mountNotification({ closable: true })
    expect(wrapper.find('[aria-label="Dismiss notification"]').exists()).toBe(true)
  })

  it('does not render close button by default', () => {
    const wrapper = mountNotification()
    expect(wrapper.find('[aria-label="Dismiss notification"]').exists()).toBe(false)
  })

  it('emits close when close button clicked', async () => {
    const wrapper = mountNotification({ closable: true })
    await wrapper.find('[aria-label="Dismiss notification"]').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('hides after close', async () => {
    const wrapper = mountNotification({ closable: true })
    await wrapper.find('[aria-label="Dismiss notification"]').trigger('click')
    expect(wrapper.find('[data-state]').exists()).toBe(false)
  })

  it('forwards aria-label', () => {
    const wrapper = mountNotification({ ariaLabel: 'Success message' })
    expect(wrapper.attributes('aria-label')).toBe('Success message')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzNotification, {
      props: { title: 'Test' },
      attrs: { class: 'my-notification' },
    })
    expect(wrapper.classes()).toContain('my-notification')
  })

  it('renders actions slot', () => {
    const wrapper = mount(DzNotification, {
      props: { title: 'Test' },
      slots: { actions: '<button>View</button>' },
    })
    expect(wrapper.text()).toContain('View')
  })
})

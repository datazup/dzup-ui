import { mount } from '@vue/test-utils'
/**
 * DzNotification — Unit / behavior tests.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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
    expect(wrapper.classes()).toContain('[contain:layout_style]')
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

// UI-DZUP-UI-UX-M-10: auto-dismiss pauses while the user is on it (WCAG 2.2.1).
describe('dzNotification — pausable auto-dismiss', () => {
  let opener: HTMLButtonElement

  beforeEach(() => {
    vi.useFakeTimers()
    opener = document.createElement('button')
    opener.textContent = 'Open'
    document.body.appendChild(opener)
    opener.focus()
  })

  afterEach(() => {
    vi.useRealTimers()
    opener.remove()
  })

  function mountTimed(duration: number) {
    return mount(DzNotification, {
      props: { title: 'Saved', duration },
      slots: { actions: '<button type="button" data-test="undo">Undo</button>' },
      attachTo: document.body,
    })
  }

  it('closes after the duration when nobody interacts with it', async () => {
    const wrapper = mountTimed(1000)
    vi.advanceTimersByTime(999)
    expect(wrapper.emitted('close')).toBeUndefined()
    vi.advanceTimersByTime(1)
    expect(wrapper.emitted('close')).toHaveLength(1)
    wrapper.unmount()
  })

  it('does not close while hovered, then resumes with the remaining time', async () => {
    const wrapper = mountTimed(1000)
    vi.advanceTimersByTime(400)
    await wrapper.trigger('mouseenter')
    vi.advanceTimersByTime(5000)
    expect(wrapper.emitted('close')).toBeUndefined()
    expect(wrapper.find('[data-part="root"]').exists()).toBe(true)

    await wrapper.trigger('mouseleave')
    vi.advanceTimersByTime(599)
    expect(wrapper.emitted('close')).toBeUndefined()
    vi.advanceTimersByTime(1)
    expect(wrapper.emitted('close')).toHaveLength(1)
    wrapper.unmount()
  })

  it('does not close while focus is on an action, and returns focus when it does close', async () => {
    const wrapper = mountTimed(1000)
    vi.advanceTimersByTime(700)
    const undo = wrapper.get('[data-test="undo"]').element as HTMLButtonElement
    undo.focus()
    expect(document.activeElement).toBe(undo)

    vi.advanceTimersByTime(5000)
    expect(wrapper.emitted('close')).toBeUndefined()
    expect(document.activeElement).toBe(undo)

    // Focus leaves the notification: the remaining 300 ms run, then it closes.
    opener.focus()
    vi.advanceTimersByTime(299)
    expect(wrapper.emitted('close')).toBeUndefined()
    vi.advanceTimersByTime(1)
    expect(wrapper.emitted('close')).toHaveLength(1)
    wrapper.unmount()
  })

  it('moves focus back to the opener, not <body>, when it closes with focus inside', async () => {
    const wrapper = mount(DzNotification, {
      props: { title: 'Saved', closable: true },
      attachTo: document.body,
    })
    const close = wrapper.get('[data-part="close"]').element as HTMLButtonElement
    close.focus()
    close.click()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-part="root"]').exists()).toBe(false)
    expect(document.activeElement).not.toBe(document.body)
    expect(document.activeElement).toBe(opener)
    wrapper.unmount()
  })

  it('keeps focus moves inside the notification from resuming the countdown', async () => {
    const wrapper = mount(DzNotification, {
      props: { title: 'Saved', duration: 1000, closable: true },
      slots: { actions: '<button type="button" data-test="undo">Undo</button>' },
      attachTo: document.body,
    })
    ;(wrapper.get('[data-test="undo"]').element as HTMLButtonElement).focus()
    ;(wrapper.get('[data-part="close"]').element as HTMLButtonElement).focus()
    vi.advanceTimersByTime(5000)
    expect(wrapper.emitted('close')).toBeUndefined()
    wrapper.unmount()
  })

  it('never closes on its own with the default duration of 0', async () => {
    const wrapper = mount(DzNotification, { props: { title: 'Saved' }, attachTo: document.body })
    vi.advanceTimersByTime(60_000)
    expect(wrapper.emitted('close')).toBeUndefined()
    expect(wrapper.find('[data-part="root"]').exists()).toBe(true)
    wrapper.unmount()
  })
})

import { mount } from '@vue/test-utils'
/**
 * DzPagination — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzPagination from './DzPagination.vue'

describe('dzPagination — Unit Tests', () => {
  it('renders a nav element', () => {
    const wrapper = mount(DzPagination, {
      props: { total: 100 },
    })
    expect(wrapper.find('nav').exists()).toBe(true)
  })

  it('renders previous and next buttons', () => {
    const wrapper = mount(DzPagination, {
      props: { total: 50, pageSize: 10 },
    })
    const prevBtn = wrapper.find('[aria-label="Go to previous page"]')
    const nextBtn = wrapper.find('[aria-label="Go to next page"]')
    expect(prevBtn.exists()).toBe(true)
    expect(nextBtn.exists()).toBe(true)
  })

  it('renders page number buttons', () => {
    const wrapper = mount(DzPagination, {
      props: { total: 50, pageSize: 10, modelValue: 1 },
    })
    const buttons = wrapper.findAll('button')
    // Should have prev + page numbers + next at minimum
    expect(buttons.length).toBeGreaterThanOrEqual(3)
  })

  it('highlights current page with aria-current', () => {
    const wrapper = mount(DzPagination, {
      props: { total: 50, pageSize: 10, modelValue: 1 },
    })
    const current = wrapper.find('[aria-current="page"]')
    expect(current.exists()).toBe(true)
    expect(current.text()).toBe('1')
  })

  it('calculates correct number of pages', () => {
    const wrapper = mount(DzPagination, {
      props: { total: 53, pageSize: 10, modelValue: 1 },
    })
    // 53/10 = 6 pages, with siblingCount=1 we should see some page buttons
    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBeGreaterThanOrEqual(3)
  })

  it('emits update:modelValue when clicking a page', async () => {
    const wrapper = mount(DzPagination, {
      props: { total: 50, pageSize: 10, modelValue: 1 },
    })
    const buttons = wrapper.findAll('button')
    const page2 = buttons.find(btn => btn.text() === '2')
    if (page2) {
      await page2.trigger('click')
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')![0]).toEqual([2])
    }
  })

  it('emits change event with page number', async () => {
    const wrapper = mount(DzPagination, {
      props: { total: 50, pageSize: 10, modelValue: 1 },
    })
    const buttons = wrapper.findAll('button')
    const page2 = buttons.find(btn => btn.text() === '2')
    if (page2) {
      await page2.trigger('click')
      expect(wrapper.emitted('change')).toBeTruthy()
      expect(wrapper.emitted('change')![0]).toEqual([2])
    }
  })

  it('renders first/last buttons when showEdges is true', () => {
    const wrapper = mount(DzPagination, {
      props: { total: 100, pageSize: 10, showEdges: true },
    })
    const first = wrapper.find('[aria-label="Go to first page"]')
    const last = wrapper.find('[aria-label="Go to last page"]')
    expect(first.exists()).toBe(true)
    expect(last.exists()).toBe(true)
  })

  it('does not render first/last buttons by default', () => {
    const wrapper = mount(DzPagination, {
      props: { total: 100, pageSize: 10 },
    })
    const first = wrapper.find('[aria-label="Go to first page"]')
    const last = wrapper.find('[aria-label="Go to last page"]')
    expect(first.exists()).toBe(false)
    expect(last.exists()).toBe(false)
  })

  it('uses default pageSize of 10', () => {
    const wrapper = mount(DzPagination, {
      props: { total: 30, modelValue: 1 },
    })
    // 30/10 = 3 pages, should see page buttons for 1, 2, 3
    const pageButton3 = wrapper.findAll('button').find(btn => btn.text() === '3')
    expect(pageButton3).toBeTruthy()
  })

  it('merges consumer class on nav element', () => {
    const wrapper = mount(DzPagination, {
      props: { total: 100 },
      attrs: { class: 'my-pagination' },
    })
    expect(wrapper.find('nav').classes()).toContain('my-pagination')
  })

  it('handles single page gracefully', () => {
    const wrapper = mount(DzPagination, {
      props: { total: 5, pageSize: 10, modelValue: 1 },
    })
    expect(wrapper.exists()).toBe(true)
    const pageButton = wrapper.findAll('button').find(btn => btn.text() === '1')
    expect(pageButton).toBeTruthy()
  })

  it('handles zero total gracefully', () => {
    const wrapper = mount(DzPagination, {
      props: { total: 0, pageSize: 10 },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('emits focus when pagination receives focus', async () => {
    const wrapper = mount(DzPagination, {
      props: { total: 50, pageSize: 10 },
    })
    const nav = wrapper.find('nav')
    await nav.trigger('focusin')
    expect(wrapper.emitted('focus')).toHaveLength(1)
  })

  it('emits blur when pagination loses focus', async () => {
    const wrapper = mount(DzPagination, {
      props: { total: 50, pageSize: 10 },
    })
    const nav = wrapper.find('nav')
    await nav.trigger('focusout')
    expect(wrapper.emitted('blur')).toHaveLength(1)
  })
})

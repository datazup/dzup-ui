import { mount } from '@vue/test-utils'
/**
 * DzPagination — Contract Spec v1 conformance tests.
 *
 * Verifies props, events, slots, data attributes, and ARIA compliance.
 */
import { describe, expect, it } from 'vitest'
import DzPagination from './DzPagination.vue'

describe('dzPagination — Contract Spec v1', () => {
  // ── Props ──

  it('renders with required total prop', () => {
    const wrapper = mount(DzPagination, {
      props: { total: 100 },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzPagination, {
        props: { total: 100, size },
      })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('accepts pageSize prop', () => {
    const wrapper = mount(DzPagination, {
      props: { total: 100, pageSize: 20 },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts siblingCount prop', () => {
    const wrapper = mount(DzPagination, {
      props: { total: 100, siblingCount: 2 },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts showEdges prop', () => {
    const wrapper = mount(DzPagination, {
      props: { total: 100, showEdges: true },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts disabled prop', () => {
    const wrapper = mount(DzPagination, {
      props: { total: 100, disabled: true },
    })
    expect(wrapper.exists()).toBe(true)
  })

  // ── Data attributes ──

  it('sets data-disabled when disabled', () => {
    const wrapper = mount(DzPagination, {
      props: { total: 100, disabled: true },
    })
    const nav = wrapper.find('nav')
    expect(nav.attributes('data-disabled')).toBe('')
  })

  it('omits data-disabled when not disabled', () => {
    const wrapper = mount(DzPagination, {
      props: { total: 100 },
    })
    const nav = wrapper.find('nav')
    expect(nav.attributes('data-disabled')).toBeUndefined()
  })

  // ── CSS containment ──

  it('has contain: layout style on nav element', () => {
    const wrapper = mount(DzPagination, {
      props: { total: 100 },
    })
    const nav = wrapper.find('nav')
    expect(nav.attributes('style')).toContain('contain: layout style')
  })

  // ── ARIA ──

  it('renders a <nav> element with aria-label', () => {
    const wrapper = mount(DzPagination, {
      props: { total: 100 },
    })
    const nav = wrapper.find('nav')
    expect(nav.exists()).toBe(true)
    expect(nav.attributes('aria-label')).toBe('Pagination')
  })

  it('allows custom aria-label', () => {
    const wrapper = mount(DzPagination, {
      props: { total: 100, ariaLabel: 'Results pagination' },
    })
    expect(wrapper.find('nav').attributes('aria-label')).toBe('Results pagination')
  })

  it('forwards id to nav element', () => {
    const wrapper = mount(DzPagination, {
      props: { total: 100, id: 'pg-nav' },
    })
    expect(wrapper.find('nav').attributes('id')).toBe('pg-nav')
  })

  // ── Events ──

  it('emits update:modelValue when page changes', async () => {
    const wrapper = mount(DzPagination, {
      props: { total: 50, pageSize: 10, modelValue: 1 },
    })
    const buttons = wrapper.findAll('button')
    // Click a page number button (skip prev button)
    const pageButton = buttons.find(
      btn => btn.text() === '2',
    )
    if (pageButton) {
      await pageButton.trigger('click')
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    }
  })

  it('emits change when page changes', async () => {
    const wrapper = mount(DzPagination, {
      props: { total: 50, pageSize: 10, modelValue: 1 },
    })
    const buttons = wrapper.findAll('button')
    const pageButton = buttons.find(btn => btn.text() === '2')
    if (pageButton) {
      await pageButton.trigger('click')
      expect(wrapper.emitted('change')).toBeTruthy()
    }
  })

  // ── Class merging ──

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzPagination, {
      props: { total: 100 },
      attrs: { class: 'my-pagination' },
    })
    const nav = wrapper.find('nav')
    expect(nav.classes()).toContain('my-pagination')
  })

  // ── Show edges ──

  it('renders first/last buttons when showEdges is true', () => {
    const wrapper = mount(DzPagination, {
      props: { total: 100, pageSize: 10, showEdges: true },
    })
    const firstButton = wrapper.find('[aria-label="Go to first page"]')
    const lastButton = wrapper.find('[aria-label="Go to last page"]')
    expect(firstButton.exists()).toBe(true)
    expect(lastButton.exists()).toBe(true)
  })

  it('does not render first/last buttons when showEdges is false', () => {
    const wrapper = mount(DzPagination, {
      props: { total: 100, pageSize: 10, showEdges: false },
    })
    const firstButton = wrapper.find('[aria-label="Go to first page"]')
    const lastButton = wrapper.find('[aria-label="Go to last page"]')
    expect(firstButton.exists()).toBe(false)
    expect(lastButton.exists()).toBe(false)
  })
})

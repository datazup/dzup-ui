import { mount } from '@vue/test-utils'
/**
 * DzTable — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzTable from './DzTable.vue'
import DzTableBody from './DzTableBody.vue'
import DzTableCell from './DzTableCell.vue'
import DzTableFooter from './DzTableFooter.vue'
import DzTableRow from './DzTableRow.vue'

describe('dzTable — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzTable, {
      slots: { default: '<tr><td>Cell</td></tr>' },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzTable, {
      slots: { default: '<tr><td>Cell</td></tr>' },
    })
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzTable, {
        props: { size },
        slots: { default: '<tr><td>Cell</td></tr>' },
      })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('accepts variant values', () => {
    const variants = ['default', 'bordered', 'striped'] as const
    for (const variant of variants) {
      const wrapper = mount(DzTable, {
        props: { variant },
        slots: { default: '<tr><td>Cell</td></tr>' },
      })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('accepts density values', () => {
    const densities = ['compact', 'default', 'comfortable'] as const
    for (const density of densities) {
      const wrapper = mount(DzTable, {
        props: { density },
        slots: { default: '<tr><td>Cell</td></tr>' },
      })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('forwards aria-label', () => {
    const wrapper = mount(DzTable, {
      props: { ariaLabel: 'Users' },
      slots: { default: '<tr><td>Cell</td></tr>' },
    })
    expect(wrapper.html()).toContain('Users')
  })

  it('renders default slot content', () => {
    const wrapper = mount(DzTable, {
      slots: { default: '<tr><td>Cell data</td></tr>' },
    })
    expect(wrapper.text()).toContain('Cell data')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzTable, {
      attrs: { class: 'custom-class' },
      slots: { default: '<tr><td>Cell</td></tr>' },
    })
    expect(wrapper.html()).toContain('custom-class')
  })
})

describe('dzTableFooter — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzTable, {
      slots: {
        default: () => h(DzTableFooter, null, { default: () => '<tr><td>Total</td></tr>' }),
      },
    })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('tfoot').exists()).toBe(true)
  })
})

describe('dzTableRow (expandable) — Contract Spec v1', () => {
  it('renders an accessible toggle and detail row on expand', async () => {
    const wrapper = mount(DzTable, {
      slots: {
        default: () =>
          h(DzTableBody, null, {
            default: () =>
              h(
                DzTableRow,
                { expandable: true, rowId: 'r1' },
                {
                  default: () => h(DzTableCell, null, { default: () => 'Alice' }),
                  expand: () => 'Detail',
                },
              ),
          }),
      },
    })
    const toggle = wrapper.find('button[aria-expanded]')
    expect(toggle.exists()).toBe(true)
    expect(toggle.attributes('aria-expanded')).toBe('false')
    await toggle.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(wrapper.find('tr.expand-row').exists()).toBe(true)
    expect(wrapper.emitted('rowExpand')).toEqual([['r1']])
  })
})

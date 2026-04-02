import { mount } from '@vue/test-utils'
/**
 * DzTable (compound) — Unit / behavior / contract tests.
 */
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzTable from './DzTable.vue'
import DzTableBody from './DzTableBody.vue'
import DzTableCell from './DzTableCell.vue'
import DzTableHeader from './DzTableHeader.vue'
import DzTableRow from './DzTableRow.vue'

/** Helper to render a complete table structure */
function mountTable(tableProps = {}) {
  return mount(DzTable, {
    props: tableProps,
    slots: {
      default: () => [
        h(DzTableHeader, null, {
          default: () =>
            h(DzTableRow, null, {
              default: () => [
                h(DzTableCell, { header: true }, { default: () => 'Name' }),
                h(DzTableCell, { header: true }, { default: () => 'Email' }),
              ],
            }),
        }),
        h(DzTableBody, null, {
          default: () =>
            h(DzTableRow, null, {
              default: () => [
                h(DzTableCell, null, { default: () => 'Alice' }),
                h(DzTableCell, null, { default: () => 'alice@example.com' }),
              ],
            }),
        }),
      ],
    },
  })
}

describe('dzTable', () => {
  it('renders a wrapper div with a <table> inside', () => {
    const wrapper = mountTable()
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.find('table').exists()).toBe(true)
  })

  it('has role="table" on the table element', () => {
    const wrapper = mountTable()
    expect(wrapper.find('table').attributes('role')).toBe('table')
  })

  it('sets data-loading when loading', () => {
    const wrapper = mountTable({ loading: true })
    expect(wrapper.attributes('data-loading')).toBe('')
  })

  it('sets aria-busy on table when loading', () => {
    const wrapper = mountTable({ loading: true })
    expect(wrapper.find('table').attributes('aria-busy')).toBe('true')
  })

  it('forwards aria-label to the table element', () => {
    const wrapper = mountTable({ ariaLabel: 'Users table' })
    expect(wrapper.find('table').attributes('aria-label')).toBe('Users table')
  })

  it('has contain: layout style', () => {
    const wrapper = mountTable()
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzTable, {
      attrs: { class: 'my-table' },
      slots: {
        default: () =>
          h(DzTableBody, null, {
            default: () =>
              h(DzTableRow, null, {
                default: () => h(DzTableCell, null, { default: () => 'X' }),
              }),
          }),
      },
    })
    expect(wrapper.classes()).toContain('my-table')
  })
})

describe('dzTableHeader', () => {
  it('renders a <thead> element', () => {
    const wrapper = mountTable()
    expect(wrapper.find('thead').exists()).toBe(true)
  })
})

describe('dzTableBody', () => {
  it('renders a <tbody> element', () => {
    const wrapper = mountTable()
    expect(wrapper.find('tbody').exists()).toBe(true)
  })
})

describe('dzTableRow', () => {
  it('renders a <tr> element', () => {
    const wrapper = mountTable()
    expect(wrapper.find('tr').exists()).toBe(true)
  })

  it('sets aria-selected and data-state when selected', () => {
    const wrapper = mount(DzTable, {
      slots: {
        default: () =>
          h(DzTableBody, null, {
            default: () =>
              h(DzTableRow, { selected: true }, {
                default: () => h(DzTableCell, null, { default: () => 'X' }),
              }),
          }),
      },
    })
    const row = wrapper.findComponent(DzTableRow)
    expect(row.attributes('aria-selected')).toBe('true')
    expect(row.attributes('data-state')).toBe('selected')
  })
})

describe('dzTableCell', () => {
  it('renders a <td> element by default', () => {
    const wrapper = mountTable()
    expect(wrapper.findAll('td').length).toBeGreaterThan(0)
  })

  it('renders a <th> element when header=true', () => {
    const wrapper = mountTable()
    expect(wrapper.findAll('th').length).toBeGreaterThan(0)
  })

  it('sets scope="col" on header cells', () => {
    const wrapper = mountTable()
    const th = wrapper.find('th')
    expect(th.attributes('scope')).toBe('col')
  })

  it('applies text alignment', () => {
    const wrapper = mount(DzTable, {
      slots: {
        default: () =>
          h(DzTableBody, null, {
            default: () =>
              h(DzTableRow, null, {
                default: () =>
                  h(DzTableCell, { align: 'right' }, { default: () => '$100' }),
              }),
          }),
      },
    })
    const cell = wrapper.findComponent(DzTableCell)
    expect(cell.classes().some((c: string) => c.includes('text-right'))).toBe(true)
  })
})

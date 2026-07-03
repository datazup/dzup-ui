import { mount } from '@vue/test-utils'
/**
 * DzTable (compound) — Unit / behavior / contract tests.
 */
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzTable from './DzTable.vue'
import DzTableBody from './DzTableBody.vue'
import DzTableCell from './DzTableCell.vue'
import DzTableFooter from './DzTableFooter.vue'
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

  it('renders caption as sr-only by default', () => {
    const wrapper = mount(DzTable, {
      slots: {
        caption: () => 'Users',
        default: () =>
          h(DzTableBody, null, {
            default: () =>
              h(DzTableRow, null, {
                default: () => h(DzTableCell, null, { default: () => 'X' }),
              }),
          }),
      },
    })
    expect(wrapper.find('caption').classes()).toContain('sr-only')
  })

  it('renders caption visibly when captionVisible is true', () => {
    const wrapper = mount(DzTable, {
      props: { captionVisible: true },
      slots: {
        caption: () => 'Users',
        default: () =>
          h(DzTableBody, null, {
            default: () =>
              h(DzTableRow, null, {
                default: () => h(DzTableCell, null, { default: () => 'X' }),
              }),
          }),
      },
    })
    expect(wrapper.find('caption').classes()).not.toContain('sr-only')
    expect(wrapper.find('caption').text()).toBe('Users')
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

  it('renders default DzEmpty with "No records found." when body has zero rows', () => {
    const wrapper = mount(DzTable, {
      slots: {
        default: () => h(DzTableBody, null, {}),
      },
    })
    expect(wrapper.find('tbody tr').exists()).toBe(true)
    expect(wrapper.find('tbody td').attributes('colspan')).toBe('1000')
    expect(wrapper.text()).toContain('No records found.')
  })

  it('renders custom #empty slot content when body has zero rows', () => {
    const wrapper = mount(DzTable, {
      slots: {
        default: () =>
          h(DzTableBody, null, {
            empty: () => 'Nothing here yet',
          }),
      },
    })
    expect(wrapper.text()).toContain('Nothing here yet')
    expect(wrapper.text()).not.toContain('No records found.')
  })

  it('does not render the empty state when rows are present', () => {
    const wrapper = mountTable()
    expect(wrapper.find('tbody tr td[colspan="1000"]').exists()).toBe(false)
  })

  it('treats whitespace-only / comment default slot content as empty', () => {
    const wrapper = mount(DzTable, {
      slots: {
        default: () =>
          h(DzTableBody, null, {
            default: () => ['   ', '\n'],
          }),
      },
    })
    expect(wrapper.text()).toContain('No records found.')
  })

  it('renders 3 skeleton rows by default when loading', () => {
    const wrapper = mount(DzTable, {
      props: { loading: true },
      slots: {
        default: () =>
          h(DzTableBody, null, {
            default: () =>
              h(DzTableRow, null, {
                default: () => h(DzTableCell, null, { default: () => 'Alice' }),
              }),
          }),
      },
    })
    expect(wrapper.findAll('tbody tr').length).toBe(3)
    expect(wrapper.find('[aria-hidden="true"]').exists()).toBe(true)
  })

  it('respects a custom skeletonRows prop', () => {
    const wrapper = mount(DzTable, {
      props: { loading: true },
      slots: {
        default: () => h(DzTableBody, { skeletonRows: 5 }, {}),
      },
    })
    expect(wrapper.findAll('tbody tr').length).toBe(5)
  })

  it('prioritizes loading skeleton over real row content', () => {
    const wrapper = mount(DzTable, {
      props: { loading: true },
      slots: {
        default: () =>
          h(DzTableBody, null, {
            default: () =>
              h(DzTableRow, null, {
                default: () => h(DzTableCell, null, { default: () => 'Alice' }),
              }),
          }),
      },
    })
    expect(wrapper.text()).not.toContain('Alice')
  })

  it('prioritizes loading skeleton over the empty state', () => {
    const wrapper = mount(DzTable, {
      props: { loading: true },
      slots: {
        default: () => h(DzTableBody, null, {}),
      },
    })
    expect(wrapper.text()).not.toContain('No records found.')
    expect(wrapper.findAll('tbody tr').length).toBe(3)
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
              h(
                DzTableRow,
                { selected: true },
                {
                  default: () => h(DzTableCell, null, { default: () => 'X' }),
                },
              ),
          }),
      },
    })
    const row = wrapper.find('tbody tr')
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
                default: () => h(DzTableCell, { align: 'right' }, { default: () => '$100' }),
              }),
          }),
      },
    })
    const cell = wrapper.findComponent(DzTableCell)
    expect(cell.classes().some((c: string) => c.includes('text-right'))).toBe(true)
  })
})

describe('dzTableFooter', () => {
  function mountWithFooter() {
    return mount(DzTable, {
      slots: {
        default: () => [
          h(DzTableBody, null, {
            default: () =>
              h(DzTableRow, null, {
                default: () => h(DzTableCell, null, { default: () => 'Alice' }),
              }),
          }),
          h(DzTableFooter, null, {
            default: () =>
              h(DzTableRow, null, {
                default: () => h(DzTableCell, null, { default: () => 'Total: 1' }),
              }),
          }),
        ],
      },
    })
  }

  it('renders a <tfoot> element', () => {
    const wrapper = mountWithFooter()
    expect(wrapper.find('tfoot').exists()).toBe(true)
  })

  it('renders footer slot content', () => {
    const wrapper = mountWithFooter()
    expect(wrapper.find('tfoot').text()).toContain('Total: 1')
  })

  it('applies a top-border footer style distinct from header', () => {
    const wrapper = mountWithFooter()
    const footerClasses = wrapper.find('tfoot').classes()
    expect(footerClasses.some(c => c.includes('border-t'))).toBe(true)
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzTable, {
      slots: {
        default: () =>
          h(
            DzTableFooter,
            { class: 'my-footer' },
            {
              default: () =>
                h(DzTableRow, null, {
                  default: () => h(DzTableCell, null, { default: () => 'X' }),
                }),
            },
          ),
      },
    })
    expect(wrapper.find('tfoot').classes()).toContain('my-footer')
  })
})

describe('dzTableRow — expandable', () => {
  function mountExpandable() {
    return mount(DzTable, {
      slots: {
        default: () =>
          h(DzTableBody, null, {
            default: () =>
              h(
                DzTableRow,
                { expandable: true, rowId: 'r1' },
                {
                  default: () => h(DzTableCell, null, { default: () => 'Alice' }),
                  expand: () => 'Detail content',
                },
              ),
          }),
      },
    })
  }

  it('renders a toggle button with a chevron for expandable rows', () => {
    const wrapper = mountExpandable()
    const button = wrapper.find('button[aria-expanded]')
    expect(button.exists()).toBe(true)
    expect(button.find('svg').exists()).toBe(true)
    expect(button.attributes('aria-expanded')).toBe('false')
  })

  it('does not render a toggle cell for non-expandable rows', () => {
    const wrapper = mount(DzTable, {
      slots: {
        default: () =>
          h(DzTableBody, null, {
            default: () =>
              h(DzTableRow, null, {
                default: () => h(DzTableCell, null, { default: () => 'Alice' }),
              }),
          }),
      },
    })
    expect(wrapper.find('button[aria-expanded]').exists()).toBe(false)
  })

  it('hides the expand detail row until expanded', () => {
    const wrapper = mountExpandable()
    expect(wrapper.find('tr.expand-row').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Detail content')
  })

  it('reveals the #expand slot inside an expand-row when toggled', async () => {
    const wrapper = mountExpandable()
    await wrapper.find('button[aria-expanded]').trigger('click')
    const expandRow = wrapper.find('tr.expand-row')
    expect(expandRow.exists()).toBe(true)
    expect(expandRow.text()).toContain('Detail content')
    expect(wrapper.find('button[aria-expanded]').attributes('aria-expanded')).toBe('true')
  })

  it('renders the detail cell with a full-width colspan', async () => {
    const wrapper = mountExpandable()
    await wrapper.find('button[aria-expanded]').trigger('click')
    const detailCell = wrapper.find('tr.expand-row td')
    expect(detailCell.attributes('colspan')).toBe('1000')
  })

  it('collapses again on a second toggle', async () => {
    const wrapper = mountExpandable()
    const button = () => wrapper.find('button[aria-expanded]')
    await button().trigger('click')
    expect(wrapper.find('tr.expand-row').exists()).toBe(true)
    await button().trigger('click')
    expect(wrapper.find('tr.expand-row').exists()).toBe(false)
  })

  it('emits rowExpand then rowCollapse with the row id', async () => {
    const wrapper = mountExpandable()
    const button = () => wrapper.find('button[aria-expanded]')
    await button().trigger('click')
    await button().trigger('click')
    expect(wrapper.emitted('rowExpand')).toEqual([['r1']])
    expect(wrapper.emitted('rowCollapse')).toEqual([['r1']])
  })

  it('tracks expanded state per rowId across multiple rows', async () => {
    const wrapper = mount(DzTable, {
      slots: {
        default: () =>
          h(DzTableBody, null, {
            default: () => [
              h(
                DzTableRow,
                { expandable: true, rowId: 'a' },
                {
                  default: () => h(DzTableCell, null, { default: () => 'A' }),
                  expand: () => 'Detail A',
                },
              ),
              h(
                DzTableRow,
                { expandable: true, rowId: 'b' },
                {
                  default: () => h(DzTableCell, null, { default: () => 'B' }),
                  expand: () => 'Detail B',
                },
              ),
            ],
          }),
      },
    })
    await wrapper.findAll('button[aria-expanded]')[0]!.trigger('click')
    expect(wrapper.text()).toContain('Detail A')
    expect(wrapper.text()).not.toContain('Detail B')
    expect(wrapper.emitted('rowExpand')).toEqual([['a']])
  })
})

/**
 * DzTable — Contract Spec v1 conformance tests.
 */
import { expectAnatomy } from '@dzup-ui/testing'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import { anatomy } from './DzTable.anatomy.ts'
import DzTable from './DzTable.vue'
import DzTableBody from './DzTableBody.vue'
import DzTableCell from './DzTableCell.vue'
import DzTableFooter from './DzTableFooter.vue'
import DzTableHeader from './DzTableHeader.vue'
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
  // ── Anatomy (ADR-19) ──

  it('conforms with only the nodes DzTable itself renders', () => {
    const wrapper = mount(DzTable, { slots: { default: '<tr><td>Cell</td></tr>' } })

    expect(wrapper.attributes('data-part')).toBe('root')
    expect(wrapper.find('[data-part="content"]').element.tagName).toBe('TABLE')
    expectAnatomy(wrapper, anatomy)
  })

  it('conforms with the whole family composed', () => {
    // The family anatomy earns its keep here: header, body, footer, row and
    // cell come from five other components, and one check covers all of them.
    const wrapper = mount(DzTable, {
      slots: {
        caption: () => 'Quarterly results',
        default: () => [
          h(DzTableHeader, () => h(DzTableRow, () => h(DzTableCell, { header: true }, () => 'Q'))),
          h(DzTableBody, () => h(DzTableRow, () => h(DzTableCell, () => '1'))),
          h(DzTableFooter, () => h(DzTableRow, () => h(DzTableCell, () => 'Total'))),
        ],
      },
    })

    for (const part of ['title', 'header', 'body', 'footer', 'row', 'cell'])
      expect(wrapper.find(`[data-part="${part}"]`).exists(), part).toBe(true)

    expectAnatomy(wrapper, anatomy)
  })

  it('emits repeated rows and cells without tripping the exactly-once rule', () => {
    // `row` and `cell` are declared optional precisely because a table has many
    // of each; a check that demanded one would fail every real table.
    const wrapper = mount(DzTable, {
      slots: {
        default: () => h(DzTableBody, () => [
          h(DzTableRow, () => [h(DzTableCell, () => 'a'), h(DzTableCell, () => 'b')]),
          h(DzTableRow, () => [h(DzTableCell, () => 'c'), h(DzTableCell, () => 'd')]),
        ]),
      },
    })

    expect(wrapper.findAll('[data-part="row"]')).toHaveLength(2)
    expect(wrapper.findAll('[data-part="cell"]')).toHaveLength(4)
    expectAnatomy(wrapper, anatomy)
  })

  it('conforms while loading, when the body renders skeleton rows', () => {
    const wrapper = mount(DzTable, {
      props: { loading: true },
      slots: { default: () => h(DzTableBody, { skeletonRows: 3 }, () => []) },
    })

    expect(wrapper.attributes('data-state')).toBe('loading')
    expectAnatomy(wrapper, anatomy)
  })

  // ── Per-part overrides (`ui`) ──

  it('reaches the table element and the caption, which class cannot', () => {
    const wrapper = mount(DzTable, {
      props: { captionVisible: true, ui: { content: 'table-fixed', title: 'text-left' } },
      slots: { caption: () => 'Results', default: '<tr><td>Cell</td></tr>' },
    })

    expect(wrapper.find('[data-part="content"]').classes()).toContain('table-fixed')
    expect(wrapper.find('[data-part="title"]').classes()).toContain('text-left')
    expect(wrapper.html()).not.toContain('!important')
  })

  it('keeps class on the scroll container', () => {
    const wrapper = mount(DzTable, {
      attrs: { class: 'max-h-96' },
      slots: { default: '<tr><td>Cell</td></tr>' },
    })

    expect(wrapper.classes()).toContain('max-h-96')
    expect(wrapper.find('[data-part="content"]').classes()).not.toContain('max-h-96')
  })

  it('leaves the sr-only caption behaviour intact when overriding it', () => {
    // `captionVisible: false` hides the caption from sight but not from a
    // screen reader; a `ui.title` override must not silently drop that.
    const wrapper = mount(DzTable, {
      props: { ui: { title: 'font-bold' } },
      slots: { caption: () => 'Results', default: '<tr><td>Cell</td></tr>' },
    })

    const caption = wrapper.find('[data-part="title"]').classes()
    expect(caption).toContain('sr-only')
    expect(caption).toContain('font-bold')
  })
})

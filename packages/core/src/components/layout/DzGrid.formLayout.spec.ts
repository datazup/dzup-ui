/**
 * `DzGrid` and `DzStack` as form layouts (TASK-FORM-OSS-04).
 *
 * A form renderer maps its layout nodes onto these two, so what matters is not
 * how they look but what a *field* can be told to do inside them: how many
 * columns it occupies, and whether either primitive has a physical direction
 * baked in that an Arabic form would render backwards.
 *
 * The answer to the second is good and this file pins it. The answer to the
 * first was a gap until TASK-R3-O3 added `DzGridItem` (decision D67); the
 * `dzGridItem` block below pins the span API that replaced it.
 */

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import { gridItemSpanMap } from './DzGrid.variants.ts'
import DzGrid from './DzGrid.vue'
import DzGridItem from './DzGridItem.vue'
import DzStack from './DzStack.vue'

describe('dzGrid — responsive columns', () => {
  it('takes a fixed column count', () => {
    const wrapper = mount(DzGrid, { props: { cols: 3 } })
    expect(wrapper.classes().join(' ')).toContain('grid-cols-3')
  })

  it('takes a column count per breakpoint', () => {
    // A form that is one column on a phone and three on a desktop is the
    // ordinary case, and it is the one the renderer's layout node maps to.
    const wrapper = mount(DzGrid, { props: { cols: { sm: 1, md: 2, lg: 3 } } })
    const classes = wrapper.classes().join(' ')
    expect(classes).toContain('grid-cols-1')
    expect(classes).toMatch(/md:grid-cols-2/)
    expect(classes).toMatch(/lg:grid-cols-3/)
  })

  it('lays out its children in source order', () => {
    const wrapper = mount(DzGrid, {
      props: { cols: 2 },
      slots: { default: () => [h('input', { id: 'first' }), h('input', { id: 'second' })] },
    })
    const ids = wrapper.findAll('input').map(i => i.attributes('id'))
    expect(ids).toEqual(['first', 'second'])
  })

  it('has no direction of its own, so `dir` on an ancestor orders the columns', () => {
    // CSS grid follows the writing mode: `grid-cols-3` fills right-to-left
    // under `dir="rtl"` without the component knowing anything about it. What
    // would break that is a physical `margin-left` or an explicit
    // `grid-auto-flow` — and there is neither.
    const wrapper = mount(DzGrid, { props: { cols: 3 } })
    const classes = wrapper.classes().join(' ')
    expect(classes).not.toMatch(/(?:^|\s)-?(?:ml|mr|pl|pr|left|right)-/)
  })
})

/**
 * The span API (TASK-R3-O3, decision D67 — option (b), `DzGridItem`).
 *
 * Until this change the file asserted the gap: "a spanning field is a raw class
 * on the child", because `DzGrid` had no way to say "this field takes two of
 * the three columns". A renderer's layout node says exactly that, so the answer
 * is now a typed prop on a grid item rather than a class name the renderer has
 * to look up in a table of its own.
 */
describe('dzGridItem — how many columns a field occupies', () => {
  it('spans a fixed number of columns', () => {
    const wrapper = mount(DzGrid, {
      props: { cols: 3 },
      slots: { default: () => h(DzGridItem, { span: 2 }, () => h('input', { id: 'wide' })) },
    })
    const item = wrapper.find('#wide').element.parentElement!
    expect(item.className).toContain('col-span-2')
  })

  it('spans per breakpoint, full width on a phone and half the grid from md up', () => {
    // The Form renderer's case: `{ sm: 1, md: 12 }` on the grid and a
    // `colSpan: 6` field.
    const wrapper = mount(DzGridItem, { props: { span: { base: 'full', md: 6 } } })
    const classes = wrapper.classes()
    expect(classes).toContain('col-span-full')
    expect(classes).toContain('md:col-span-6')
  })

  it('takes every breakpoint the grid takes', () => {
    const wrapper = mount(DzGridItem, { props: { span: { sm: 12, md: 4, lg: 3 } } })
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['sm:col-span-12', 'md:col-span-4', 'lg:col-span-3']))
  })

  it('renders no span class at all when no span is given — one column is the CSS default', () => {
    const wrapper = mount(DzGridItem)
    expect(wrapper.attributes('class')).toBeUndefined()
  })

  it('clamps a numeric span into 1–12 rather than emitting a class that does not exist', () => {
    // A span that came from a JSON document is not type-checked. 13 is not a
    // Tailwind class, and silently rendering one column is the worse answer.
    expect(mount(DzGridItem, { props: { span: 13 as 12 } }).classes()).toContain('col-span-12')
    expect(mount(DzGridItem, { props: { span: 0 as 1 } }).classes()).toContain('col-span-1')
    expect(mount(DzGridItem, { props: { span: 2.7 as 2 } }).classes()).toContain('col-span-2')
  })

  it('lets a consumer class win over the span it computed', () => {
    const wrapper = mount(DzGridItem, { props: { span: 2 }, attrs: { class: 'col-span-3' } })
    expect(wrapper.classes()).toContain('col-span-3')
    expect(wrapper.classes()).not.toContain('col-span-2')
  })

  it('renders as the element it is told to', () => {
    const wrapper = mount(DzGridItem, { props: { as: 'section', span: 2 } })
    expect(wrapper.element.tagName).toBe('SECTION')
  })

  it('has no physical direction, so it mirrors under dir="rtl" with nothing to configure', () => {
    // `grid-column: span N` counts grid lines from the inline-start edge. What
    // would break that is a physical margin or a `col-start` computed from the
    // left — and every class in the table is a span.
    for (const span of [1, 6, 12, 'full'] as const) {
      const wrapper = mount(DzGridItem, { props: { span: { base: span, sm: span, md: span, lg: span } } })
      const classes = wrapper.classes().join(' ')
      expect(classes, String(span)).not.toMatch(/(?:^|\s|:)-?(?:ml|mr|pl|pr|left|right|col-start|col-end)-/)
    }
  })

  it('emits a literal class for every span at every breakpoint, so the scanner can see it', () => {
    // A class built with a template string compiles to nothing. The table is
    // literal; this pins that every cell exists and names its own breakpoint.
    for (const bp of ['base', 'sm', 'md', 'lg'] as const) {
      for (const span of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 'full'] as const) {
        const expected = `${bp === 'base' ? '' : `${bp}:`}col-span-${span}`
        expect(gridItemSpanMap[bp][span]).toBe(expected)
      }
    }
  })
})

describe('dzStack — direction', () => {
  it('stacks vertically by default, which is the form case', () => {
    const wrapper = mount(DzStack)
    expect(wrapper.classes().join(' ')).toContain('flex-col')
  })

  /**
   * The renderer's vocabulary is now accepted as well as the component's own.
   *
   * A renderer's layout node calls this axis `row`/`column`; `DzStack` called it
   * only `horizontal`/`vertical`, so a registry entry had to translate and a
   * `direction="row"` silently fell back to vertical. TASK-R3-O3 added `row` and
   * `column` as additive aliases — both spellings work, neither is deprecated.
   */
  it('lays out horizontally when asked, in either vocabulary', () => {
    for (const direction of ['horizontal', 'row'] as const) {
      const wrapper = mount(DzStack, { props: { direction } })
      expect(wrapper.classes().join(' '), direction).toContain('flex-row')
    }
  })

  it('stacks vertically for `column`, the renderer spelling of `vertical`', () => {
    const wrapper = mount(DzStack, { props: { direction: 'column' } })
    expect(wrapper.classes().join(' ')).toContain('flex-col')
  })

  it('falls back to vertical for a direction it does not know', () => {
    const wrapper = mount(DzStack, { props: { direction: 'diagonal' as 'horizontal' } })
    expect(wrapper.classes().join(' ')).toContain('flex-col')
  })

  it('uses flex-row, which follows `dir` rather than fighting it', () => {
    // `flex-direction: row` is writing-mode relative: under `dir="rtl"` the
    // first child sits on the right, with nothing to configure. A component
    // that had reached for `float` or a physical margin would need mirroring
    // and would be a row on this list instead.
    const wrapper = mount(DzStack, { props: { direction: 'horizontal' } })
    const classes = wrapper.classes().join(' ')
    expect(classes).not.toContain('flex-row-reverse')
    expect(classes).not.toMatch(/(?:^|\s)-?(?:ml|mr|pl|pr)-/)
  })

  it('keeps its children in source order', () => {
    const wrapper = mount(DzStack, {
      props: { direction: 'horizontal' },
      slots: { default: () => [h('input', { id: 'a' }), h('input', { id: 'b' })] },
    })
    expect(wrapper.findAll('input').map(i => i.attributes('id'))).toEqual(['a', 'b'])
  })

  it('spaces with gap rather than margins, so nothing is physically anchored', () => {
    const wrapper = mount(DzStack, { props: { gap: 'md' } })
    expect(wrapper.classes().join(' ')).toMatch(/gap-/)
  })
})
